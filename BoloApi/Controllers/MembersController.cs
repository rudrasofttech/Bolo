using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Bolo.Data;
using Bolo.Models;
using Microsoft.AspNetCore.Authorization;
using Bolo.Helper;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore.Storage;
using System.IO;

namespace Bolo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MembersController : ControllerBase
    {
        private readonly BoloContext _context;
        private readonly IConfiguration _config;
        public MembersController(BoloContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpGet()]
        [AllowAnonymous]
        [Route("OTP")]
        public async Task<ActionResult> GetOTP([FromQuery]string id)
        {
            try
            {
                var member = await _context.Members.FirstOrDefaultAsync(t => (t.Email.ToLower() == id.ToLower() || t.Phone == id));
                if (member == null)
                {
                    return NotFound();
                }
                string OTP = EncryptionHelper.Decrypt(member.OTP);
                if (DateTime.Compare(member.OTPExpiry, DateTime.UtcNow) < 0)
                {
                    OTP = Helper.Utility.GenerateOTP();
                    member.OTP = EncryptionHelper.Encrypt(OTP);
                    member.OTPExpiry = Helper.Utility.OTPExpiry;
                    await _context.SaveChangesAsync();
                }
                if (!string.IsNullOrEmpty(member.Email))
                {
                    Helper.Utility.SendEmail(member.Email, "", "waarta@rudrasofttech.com", "", "Waarta OTP", string.Format("You passcode is: {0}", OTP));
                }
                if (!string.IsNullOrEmpty(member.Phone))
                {
                    Helper.Utility.SendSMS(member.Phone, string.Format("Your Waarta passcode is: {0}", OTP));
                }

                return Ok(OTP);
            }catch(Exception ex)
            {
                return Ok(ex.Message);
            }
        }

        [HttpPost]
        [AllowAnonymous]
        [Route("Login")]
        public async Task<ActionResult<LoginReturnDTO>> Login(LoginDTO model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            var member = await _context.Members.FirstOrDefaultAsync(t => (t.Email.ToLower() == model.ID.ToLower() || t.Phone == model.ID) && t.OTP == EncryptionHelper.Encrypt(model.Passcode));
            if (member == null)
            {
                return NotFound(new { error = "Invalid Credentials" });
            }
            else
            {
                if (member.OTPExpiry < DateTime.UtcNow)
                {
                    return NotFound(new { error = "OTP Expired" });
                }
                else
                {
                    member.Status = RecordStatus.Active;
                    await _context.SaveChangesAsync();
                    //this data is changed just to avoid sending confidetial information to client.
                    //it is not saved in db
                    member.ID = 0;
                    member.OTP = "";
                    member.OTPExpiry = DateTime.UtcNow.AddDays(-365);
                    LoginReturnDTO result = new LoginReturnDTO() { Member = member, Token = GenerateJSONWebToken(member) };
                    return result;
                }
            }
        }

        private string GenerateJSONWebToken(Member m)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var claims = new[] {
                new Claim(ClaimTypes.Name, m.PublicID.ToString()),
        //new Claim(JwtRegisteredClaimNames.Sub, m.PublicID.ToString()),
        new Claim(JwtRegisteredClaimNames.Email, m.Email),
        new Claim(JwtRegisteredClaimNames.Exp, Helper.Utility.OTPExpiry.ToString("yyyy-MM-dd")),
        new Claim(JwtRegisteredClaimNames.Jti, m.PublicID.ToString())
    };
            var token = new JwtSecurityToken(_config["Jwt:Issuer"],
              _config["Jwt:Issuer"],
              claims,
              expires: Helper.Utility.OTPExpiry,
              signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // GET: api/Members
        [HttpGet]
        [Authorize("Admin")]
        public async Task<ActionResult<IEnumerable<Member>>> GetMembers()
        {
            return await _context.Members.ToListAsync();
        }

        // GET: api/Members
        [HttpGet]
        [Route("Validate")]
        public async Task<ActionResult<MemberDTO>> Validate()
        {
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
            {
                return NotFound();
            }
            else
            {
                MemberDTO result = new MemberDTO()
                {
                    ID = member.PublicID,
                    Name = member.Name,
                    ChannelName = string.IsNullOrEmpty(member.Channelname) ? "" : member.Channelname.ToLower(),
                    Bio = string.IsNullOrEmpty(member.Bio) ? "" : member.Bio,
                    BirthYear = member.BirthYear,
                    Gender = member.Gender,
                    Activity = member.Activity,
                    Visibility = member.Visibility,
                    Pic = string.IsNullOrEmpty(member.Pic) ? "" : member.Pic,
                    Country = string.IsNullOrEmpty(member.Country) ? "" : member.Country,
                    State = string.IsNullOrEmpty(member.State) ? "" : member.State,
                    City = string.IsNullOrEmpty(member.City) ? "" : member.City,
                    ThoughtStatus = string.IsNullOrEmpty(member.ThoughtStatus) ? "" : member.ThoughtStatus
                };
                return result;
            }
        }

        // GET: api/Members
        [HttpGet]
        [Route("profilepic")]
        public async Task<ActionResult<string>> GetProfilePic(Guid id)
        {
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == id);
            if (member == null)
            {
                return NotFound();
            }
            else if (member.Pic != null)
            {
                return NotFound();
            }
            else
            {
                return member.Pic;
            }
        }

        // GET: api/Members/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MemberDTO>> GetMember(string id)
        {
            var member = new Member();
            if (Guid.TryParse(id, out Guid idguid)){
                member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == idguid);
            }
            else
            {
                member = await _context.Members.FirstOrDefaultAsync(t => t.Channelname.ToLower() == id.ToLower());
            }

            if (member == null)
            {
                return NotFound();
            }
            MemberDTO result = new MemberDTO()
            {
                ID = member.PublicID,
                Name = member.Name,
                ChannelName = member.Channelname,
                Bio = member.Bio,
                BirthYear = member.BirthYear,
                Gender = member.Gender,
                Activity = member.Activity,
                Visibility = member.Visibility,
                Pic = string.IsNullOrEmpty(member.Pic) ? "" : member.Pic,
                Country = string.IsNullOrEmpty(member.Country) ? "" : member.Country,
                State = string.IsNullOrEmpty(member.State) ? "" : member.State,
                City = string.IsNullOrEmpty(member.City) ? "" : member.City,
                ThoughtStatus = string.IsNullOrEmpty(member.ThoughtStatus) ? "" : member.ThoughtStatus
            };
            return result;
        }

        [HttpGet]
        [Route("SaveChannel")]
        public async Task<IActionResult> SaveChannelName([FromQuery]string channel)
        {
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
            {
                return NotFound();
            }
            else
            {
                int count = await _context.Members.CountAsync(t => t.Channelname == channel);
                if (count > 0)
                {
                    return BadRequest(new { message = "Channel name is taken." });
                }
                else
                {
                    member.Channelname = channel;
                    member.ModifyDate = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
                return Ok();
            }
        }

        [HttpPost]
        [Route("savebio")]
        public async Task<IActionResult> SaveBio([FromForm]string d)
        {
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
            {
                return NotFound();
            }
            else
            {

                member.Bio = d;
                member.ModifyDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok();
            }
        }

        [HttpGet]
        [Route("savename")]
        public async Task<IActionResult> SaveName([FromQuery]string d)
        {
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
            {
                return NotFound();
            }
            else
            {

                member.Name = d;
                member.ModifyDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok();
            }
        }

        [HttpGet]
        [Route("savebirthyear")]
        public async Task<IActionResult> SaveBirthYear([FromQuery]int d)
        {
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
            {
                return NotFound();
            }
            else
            {

                member.BirthYear = d;
                member.ModifyDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok();
            }
        }

        [HttpGet]
        [Route("savevisibility")]
        public async Task<IActionResult> SaveProfileVisibility([FromQuery]MemberProfileVisibility d)
        {
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
            {
                return NotFound();
            }
            else
            {

                member.Visibility = d;
                member.ModifyDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok();
            }
        }

        [HttpGet]
        [Route("savegender")]
        public async Task<IActionResult> SaveGender([FromQuery]Gender d)
        {
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
            {
                return NotFound();
            }
            else
            {

                member.Gender = d;
                member.ModifyDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok();
            }
        }

        [HttpGet]
        [Route("savecountry")]
        public async Task<IActionResult> SaveCountry([FromQuery]string d)
        {
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
            {
                return NotFound();
            }
            else
            {

                member.Country = d;
                member.ModifyDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok();
            }
        }

        [HttpGet]
        [Route("savestate")]
        public async Task<IActionResult> SaveState([FromQuery]string d)
        {
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
            {
                return NotFound();
            }
            else
            {

                member.State = d;
                member.ModifyDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok();
            }
        }

        [HttpGet]
        [Route("savecity")]
        public async Task<IActionResult> SaveCity([FromQuery]string d)
        {
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
            {
                return NotFound();
            }
            else
            {

                member.City = d;
                member.ModifyDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok();
            }
        }

        [HttpPost]
        [Route("savepic")]
        public async Task<IActionResult> SavePic([FromForm]string pic)
        {

            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
            {
                return NotFound();
            }
            else
            {
                try
                {

                    member.Pic = pic;
                    member.ModifyDate = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    return Ok();
                }
                catch
                {
                    throw;
                }
            }
        }

        [HttpPost]
        [Route("savethoughtstatus")]
        public async Task<IActionResult> SaveThoughtStatus([FromForm]string d)
        {

            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
            {
                return NotFound();
            }
            else
            {
                try
                {

                    member.ThoughtStatus = d;
                    member.ModifyDate = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    return Ok();
                }
                catch
                {
                    throw;
                }
            }
        }

        [HttpGet]
        [Route("savepulse")]
        public async Task<IActionResult> SavePulse([FromQuery]ActivityStatus s)
        {
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
            {
                return NotFound();
            }
            else
            {
                member.Activity = s;
                member.LastPulse = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok();
            }
        }

        // PUT: api/Members/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMember(int id, Member member)
        {
            if (id != member.ID)
            {
                return BadRequest();
            }

            _context.Entry(member).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MemberExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Members
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult<Member>> PostMember(RegisterDTO model)
        {
            if (String.IsNullOrEmpty(model.Name))
            {
                ModelState.AddModelError("Error", "Name Required");
                return BadRequest(ModelState);
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (_context.Members.Count(t => t.Email == model.Email || (t.Phone == model.Phone && t.CountryCode == model.CountryCode && model.Phone != "")) > 0)
            {
                ModelState.AddModelError("Error", "The email / phone already exist, please try to log in.");
                return BadRequest(ModelState);
            }
            string OTP = Helper.Utility.GenerateOTP();
            Member m = new Member()
            {
                CountryCode = model.CountryCode,
                Status = RecordStatus.Unverified,
                CreateDate = DateTime.UtcNow,
                Email = model.Email,
                Name = model.Name,
                Phone = model.Phone,
                OTP = EncryptionHelper.Encrypt(OTP),
                OTPExpiry = Helper.Utility.OTPExpiry,
                PublicID = Guid.NewGuid(),
                Activity = ActivityStatus.Online,
                Bio = "",
                Channelname = "",
                City="", Country="", LastPulse = DateTime.UtcNow, 
                Pic ="", ThoughtStatus="", 
                Visibility = MemberProfileVisibility.Public, State = ""
            };
            _context.Members.Add(m);
            await _context.SaveChangesAsync();
            if (!string.IsNullOrEmpty(model.Email))
            {
                Helper.Utility.SendEmail(model.Email, "", "contact@bolo.com", "", "Bolo OTP", string.Format("You passcode is: {0}", OTP));
            }
            if (!string.IsNullOrEmpty(model.Phone))
            {
                Helper.Utility.SendSMS(model.Phone, string.Format("Your Bolo passcode is: {0}", OTP));
            }
            return Ok(); //CreatedAtAction("GetMember", new { id = m.ID }, m);
        }

        [HttpGet]
        [Route("search")]
        public ActionResult<IEnumerable<MemberDTO>> Search(string s){
           return _context.Members.Where(t => (t.Name.Contains(s) || t.Bio.Contains(s)) && t.Visibility == MemberProfileVisibility.Public && t.PublicID != new Guid(User.Identity.Name)).Select(t => new MemberDTO()
            {
                ID = t.PublicID,
                Name = t.Name,
                ChannelName = string.IsNullOrEmpty(t.Channelname) ? "" : t.Channelname.ToLower(),
                Bio = string.IsNullOrEmpty(t.Bio) ? "" : t.Bio,
                BirthYear = t.BirthYear,
                Gender = t.Gender,
                Activity = t.Activity,
                Visibility = t.Visibility,
                Pic = string.IsNullOrEmpty(t.Pic) ? "" : t.Pic,
                Country = string.IsNullOrEmpty(t.Country) ? "" : t.Country,
                State = string.IsNullOrEmpty(t.State) ? "" : t.State,
                City = string.IsNullOrEmpty(t.City) ? "" : t.City,
                ThoughtStatus = string.IsNullOrEmpty(t.ThoughtStatus) ? "" : t.ThoughtStatus
            }).ToList();
        }

        // DELETE: api/Members/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<Member>> DeleteMember(int id)
        {
            var member = await _context.Members.FindAsync(id);
            if (member == null)
            {
                return NotFound();
            }

            _context.Members.Remove(member);
            await _context.SaveChangesAsync();

            return member;
        }

        private bool MemberExists(int id)
        {
            return _context.Members.Any(e => e.ID == id);
        }
    }
}
