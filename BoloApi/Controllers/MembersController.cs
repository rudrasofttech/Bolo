using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
using System.IO;
using Microsoft.AspNetCore.SignalR;
using Bolo.Hubs;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;

namespace Bolo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MembersController : ControllerBase
    {
        private readonly BoloContext _context;
        private readonly IConfiguration _config;
        private readonly IHubContext<PersonChatHub> _hubContext;
        public MembersController(BoloContext context, IConfiguration config, IHubContext<PersonChatHub> hubContext)
        {
            _context = context;
            _config = config;
            _hubContext = hubContext;
        }

        [HttpGet()]
        [AllowAnonymous]
        [Route("OTPMobile")]
        public async Task<ActionResult> GetOTPMobile([FromQuery] string phone, [FromQuery] string code)
        {
            try
            {
                var member = await _context.Members.FirstOrDefaultAsync(t => (t.Phone == phone && t.CountryCode == code));
                if (member == null)
                {
                    member = new Member()
                    {
                        CountryCode = code,
                        Status = RecordStatus.Unverified,
                        CreateDate = DateTime.UtcNow,
                        Email = string.Empty,
                        Name = string.Empty,
                        Phone = phone,
                        OTP = EncryptionHelper.Encrypt(Helper.Utility.GenerateOTP()),
                        OTPExpiry = Helper.Utility.OTPExpiry,
                        PublicID = Guid.NewGuid(),
                        Activity = ActivityStatus.Online,
                        Bio = "",
                        Channelname = "",
                        City = "",
                        Country = "",
                        LastPulse = DateTime.UtcNow,
                        Pic = "",
                        ThoughtStatus = "",
                        Visibility = MemberProfileVisibility.Public,
                        State = ""
                    };
                    _context.Members.Add(member);
                    await _context.SaveChangesAsync();
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
                    EmailUtility eu = new EmailUtility(_config);
                    eu.SendEmail(member.Email, "", "waarta@rudrasofttech.com", "", "Waarta OTP", string.Format("Your waarta one time password is: {0}", OTP));
                }
                if (!string.IsNullOrEmpty(member.Phone))
                {
                    Helper.Utility.SendSMS(member.Phone, string.Format("Your Waarta OTP is: {0}", OTP));
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet()]
        [AllowAnonymous]
        [Route("OTP")]
        public async Task<ActionResult> GetOTP([FromQuery] string id)
        {
            try
            {
                var member = await _context.Members.FirstOrDefaultAsync(t => (t.Email.ToLower() == id.ToLower() || (t.Phone == id && id.Length == 10)));
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
                    EmailUtility eu = new EmailUtility(_config);
                    eu.SendEmail(member.Email, "", "waarta@rudrasofttech.com", "", "Waarta OTP", string.Format("Your waarta one time password is: {0}", OTP));
                }
                if (!string.IsNullOrEmpty(member.Phone))
                {
                    Helper.Utility.SendSMS(member.Phone, string.Format("Your Waarta OTP is: {0}", OTP));
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
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
                    ////this data is changed just to avoid sending confidetial information to client.
                    ////it is not saved in db
                    //member.ID = 0;
                    //member.OTP = "";
                    //member.OTPExpiry = DateTime.UtcNow.AddDays(-365);
                    LoginReturnDTO result = new LoginReturnDTO() { Member = new MemberDTO(member), Token = GenerateJSONWebToken(member) };
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
        new Claim(JwtRegisteredClaimNames.Exp, Helper.Utility.TokenExpiry.ToString("yyyy-MM-dd")),
        new Claim(JwtRegisteredClaimNames.Jti, m.PublicID.ToString())
    };
            var token = new JwtSecurityToken(_config["Jwt:Issuer"],
              _config["Jwt:Issuer"],
              claims,
              expires: Helper.Utility.TokenExpiry,
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
                MemberDTO result = new MemberDTO(member);
                result.Phone = member.Phone;
                result.Email = member.Email;
                result.PostCount = _context.Posts.Count(t => t.Owner.ID == member.ID);
                result.FollowerCount = _context.Followers.Count(t => t.Following.ID == member.ID);
                result.FollowingCount = _context.Followers.Count(t => t.Follower.ID == member.ID);
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
            if (Guid.TryParse(id, out Guid idguid))
            {
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
            MemberDTO result = new MemberDTO(member);
            return result;
        }


        [HttpGet]
        [Route("SaveChannelName")]
        public async Task<IActionResult> SaveChannelName([FromQuery] string d)
        {
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
            {
                return NotFound();
            }
            else
            {
                int count = await _context.Members.CountAsync(t => t.Channelname == d && t.ID != member.ID);
                if (count > 0)
                {
                    return BadRequest(new { message = "Channel name is taken." });
                }
                else
                {
                    member.Channelname = d;
                    member.ModifyDate = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
                return Ok();
            }
        }

        [HttpPost]
        [Route("savebio")]
        public async Task<IActionResult> SaveBio([FromForm] string d)
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

                var contacts = await _context.Contacts.Include(t => t.Person).Where(t => t.Owner.ID == member.ID).ToListAsync();
                foreach (Contact c in contacts)
                {
                    MemberDTO mdto = new MemberDTO(member);
                    _ = _hubContext.Clients.User(c.Person.PublicID.ToString()).SendAsync("ContactUpdated", mdto);
                }
                return Ok();
            }
        }

        [HttpGet]
        [Route("savename")]
        public async Task<IActionResult> SaveName([FromQuery] string d)
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

                var contacts = await _context.Contacts.Include(t => t.Person).Where(t => t.Owner.ID == member.ID).ToListAsync();
                foreach (Contact c in contacts)
                {
                    MemberDTO mdto = new MemberDTO(member);
                    _ = _hubContext.Clients.User(c.Person.PublicID.ToString()).SendAsync("ContactUpdated", mdto);
                }
                return Ok();
            }
        }

        [HttpGet]
        [Route("saveemail")]
        public async Task<IActionResult> SaveEmail([FromQuery] string d)
        {
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
            {
                return NotFound();
            }
            else
            {
                int c = await _context.Members.CountAsync(t => t.ID != member.ID && t.Email == d);
                if (c > 0)
                {
                    return BadRequest("duplicatedata");
                }
                member.Email = d;
                member.ModifyDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok();
            }
        }

        [HttpGet]
        [Route("savephone")]
        public async Task<IActionResult> SavePhone([FromQuery] string d)
        {
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
            {
                return NotFound();
            }
            else
            {
                int c = await _context.Members.CountAsync(t => t.ID != member.ID && t.Phone == d);
                if (c > 0)
                {
                    return BadRequest("duplicatedata");
                }
                member.Phone = d;
                member.ModifyDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok();
            }
        }

        [HttpGet]
        [Route("savebirthyear")]
        public async Task<IActionResult> SaveBirthYear([FromQuery] int d)
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

                var contacts = await _context.Contacts.Include(t => t.Person).Where(t => t.Owner.ID == member.ID).ToListAsync();
                foreach (Contact c in contacts)
                {
                    MemberDTO mdto = new MemberDTO(member);
                    _ = _hubContext.Clients.User(c.Person.PublicID.ToString()).SendAsync("ContactUpdated", mdto);
                }

                return Ok();
            }
        }

        [HttpGet]
        [Route("savevisibility")]
        public async Task<IActionResult> SaveProfileVisibility([FromQuery] MemberProfileVisibility d)
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
        public async Task<IActionResult> SaveGender([FromQuery] Gender d)
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

                var contacts = await _context.Contacts.Include(t => t.Person).Where(t => t.Owner.ID == member.ID).ToListAsync();
                foreach (Contact c in contacts)
                {
                    MemberDTO mdto = new MemberDTO(member);
                    _ = _hubContext.Clients.User(c.Person.PublicID.ToString()).SendAsync("ContactUpdated", mdto);
                }

                return Ok();
            }
        }

        [HttpGet]
        [Route("savecountry")]
        public async Task<IActionResult> SaveCountry([FromQuery] string d)
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

                var contacts = await _context.Contacts.Include(t => t.Person).Where(t => t.Owner.ID == member.ID).ToListAsync();
                foreach (Contact c in contacts)
                {
                    MemberDTO mdto = new MemberDTO(member);
                    _ = _hubContext.Clients.User(c.Person.PublicID.ToString()).SendAsync("ContactUpdated", mdto);
                }

                return Ok();
            }
        }

        [HttpGet]
        [Route("savestate")]
        public async Task<IActionResult> SaveState([FromQuery] string d)
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

                var contacts = await _context.Contacts.Include(t => t.Person).Where(t => t.Owner.ID == member.ID).ToListAsync();
                foreach (Contact c in contacts)
                {
                    MemberDTO mdto = new MemberDTO(member);
                    _ = _hubContext.Clients.User(c.Person.PublicID.ToString()).SendAsync("ContactUpdated", mdto);
                }

                return Ok();
            }
        }

        [HttpGet]
        [Route("savecity")]
        public async Task<IActionResult> SaveCity([FromQuery] string d)
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

                var contacts = await _context.Contacts.Include(t => t.Person).Where(t => t.Owner.ID == member.ID).ToListAsync();
                foreach (Contact c in contacts)
                {
                    MemberDTO mdto = new MemberDTO(member);
                    _ = _hubContext.Clients.User(c.Person.PublicID.ToString()).SendAsync("ContactUpdated", mdto);
                }
                return Ok();
            }
        }

        [HttpPost]
        [Route("savepic")]
        public async Task<IActionResult> SavePic([FromForm] string pic)
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

                    var contacts = await _context.Contacts.Include(t => t.Person).Where(t => t.Owner.ID == member.ID).ToListAsync();
                    foreach (Contact c in contacts)
                    {
                        MemberDTO mdto = new MemberDTO(member);
                        _ = _hubContext.Clients.User(c.Person.PublicID.ToString()).SendAsync("ContactUpdated", mdto);
                    }
                    return Ok();
                }
                catch
                {
                    throw;
                }
            }
        }

        [HttpGet]
        [Route("savethoughtstatus")]
        public async Task<IActionResult> SaveThoughtStatus([FromQuery] string d)
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
        public async Task<IActionResult> SavePulse([FromQuery] ActivityStatus s)
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

                var contacts = await _context.Contacts.Include(t => t.Person).Where(t => t.Owner.ID == member.ID).ToListAsync();
                foreach (Contact c in contacts)
                {
                    MemberDTO mdto = new MemberDTO(member);
                    _ = _hubContext.Clients.User(c.Person.PublicID.ToString()).SendAsync("ContactUpdated", mdto);
                }

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
            if (_context.Members.Count(t => t.Phone == model.Phone && t.CountryCode == model.CountryCode && model.Phone != "") > 0)
            {
                ModelState.AddModelError("Error", "The phone already exist, please try to log in.");
                return BadRequest(ModelState);
            }
            string OTP = Helper.Utility.GenerateOTP();
            Member m = new Member()
            {
                CountryCode = model.CountryCode,
                Status = RecordStatus.Unverified,
                CreateDate = DateTime.UtcNow,
                Email = string.Empty,
                Name = model.Name,
                Phone = model.Phone,
                OTP = EncryptionHelper.Encrypt(OTP),
                OTPExpiry = Helper.Utility.OTPExpiry,
                PublicID = Guid.NewGuid(),
                Activity = ActivityStatus.Online,
                Bio = "",
                Channelname = "",
                City = "",
                Country = "IN",
                LastPulse = DateTime.UtcNow,
                Pic = "",
                ThoughtStatus = "",
                Visibility = MemberProfileVisibility.Public,
                State = ""
            };
            _context.Members.Add(m);
            await _context.SaveChangesAsync();
            //if (!string.IsNullOrEmpty(model.Email))
            //{
            //    EmailUtility eu = new EmailUtility(_config);
            //    eu.SendEmail(model.Email, "", "contact@bolo.com", "", "Bolo OTP", string.Format("You passcode is: {0}", OTP));
            //}
            if (!string.IsNullOrEmpty(model.Phone))
            {
                Helper.Utility.SendSMS(model.Phone, string.Format("Your Bolo passcode is: {0}", OTP));
            }
            return Ok(); //CreatedAtAction("GetMember", new { id = m.ID }, m);
        }

        [HttpGet]
        [Route("search")]
        [AllowAnonymous]
        public ActionResult<IEnumerable<MemberDTO>> Search(string s)
        {
            
            if (string.IsNullOrEmpty(s))
            {
                return new List<MemberDTO>();
            }
            else if (s.Trim().Length < 3)
            {
                return new List<MemberDTO>();
            }
            string[] keywords = s.Trim().Split(" ".ToCharArray());
            List<string> avoid = "a,an,the,in,of,is,it,there,their,where,were,do,you,from".Split(",".ToCharArray()).ToList<string>();
            List<string> males = "man,boy,male,men".Split(",".ToCharArray()).ToList<string>();
            List<string> females = "woman,girl,female,women".Split(",".ToCharArray()).ToList<string>();
            var query = _context.Members.Where(t => t.Visibility == MemberProfileVisibility.Public);
            List<string> searchfor = new List<string>();
            foreach (var k in keywords)
            {
                if (avoid.Contains(k.Trim()))
                {
                    continue;
                }
                else if (males.Contains(k.Trim().ToLower()))
                {
                    query = query.Where(t => t.Gender == Gender.Male);
                }
                else if (females.Contains(k.Trim().ToLower()))
                {
                    query = query.Where(t => t.Gender == Gender.Female);
                }
                else if (!string.IsNullOrEmpty(k.Trim()))
                {
                    query = query.Where(t => t.Name.Contains(k) || t.Bio.Contains(k) ||
                    t.City.Contains(k) || t.State.Contains(k) ||
                    t.Country.Contains(k) || t.ThoughtStatus.Contains(k) ||
                    t.Phone == k || t.Email.ToLower() == k.ToLower());
                }
            }

            if (User.Identity.IsAuthenticated)
            {
                query = query.Where(t => t.PublicID != new Guid(User.Identity.Name));
            }
            var members = query.Select(t => new MemberDTO(t)).Take(10).ToList();
            foreach(var item in members)
            {
                item.FollowerCount = _context.Followers.Count(t => t.Following.PublicID == item.ID);
                item.FollowingCount = _context.Followers.Count(t => t.Follower.PublicID == item.ID);
                item.PostCount = _context.Posts.Count(t => t.Owner.PublicID == item.ID);
            }
            return query.Select(t => new MemberDTO(t)).Take(10).ToList();
        }

        [HttpGet]
        [Route("DownloadChunk")]
        public ActionResult DownloadFile([FromQuery] string filename, [FromQuery] int position)
        {
            if (string.IsNullOrEmpty(filename))
            {
                return Ok(new { data = string.Empty, position = -1, length = -1 });
            }
            string filepath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", filename);
            if (System.IO.File.Exists(filepath))
            {
                byte[] array = System.IO.File.ReadAllBytes(filepath);

                if ((array.Length - position) > 131072)
                {

                    return Ok(new { data = Convert.ToBase64String(array.Skip(position).Take(131072).ToArray()), position = (position + 131072), length = array.Length });
                }
                else
                {
                    return Ok(new { data = Convert.ToBase64String(array.Skip(position).Take((int)(array.Length - position)).ToArray()), position = array.Length, length = array.Length });
                }

            }
            else
            {
                return Ok(new { data = string.Empty, position = -1, length = -1 });
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="f"></param>
        /// <param name="meetingid"></param>
        /// <param name="filename"></param>
        /// <param name="gfn">Generate File Name</param>
        /// <returns></returns>
        [HttpPost]
        [Route("UploadFile")]
        public ActionResult PostFile([FromForm] string f, [FromForm] string filename, [FromForm] bool gfn)
        {
            if (f == null || f.Length == 0)
                return Content("file not selected");

            if (gfn)
                filename = Guid.NewGuid().ToString().ToLower() + Path.GetExtension(filename);

            var meetingpath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", User.Identity.Name);
            if (!Directory.Exists(meetingpath))
            {
                Directory.CreateDirectory(meetingpath);
            }
            var path = Path.Combine(meetingpath, filename);

            string data = f;
            //sometimes in base64 string there some text appended.
            if (f.IndexOf(";base64,") > -1)
            {
                string[] arr = f.Split(";base64,");
                if (arr.Length == 2)
                {
                    data = arr[1];
                }
            }
            byte[] barr = Convert.FromBase64String(data);
            if (System.IO.File.Exists(path))
            {
                using FileStream fs = new FileStream(path, FileMode.Append);
                fs.Write(barr, 0, barr.Length);
            }
            else
            {
                using FileStream fs = new FileStream(path, FileMode.OpenOrCreate);
                fs.Write(barr, 0, barr.Length);
            }

            return Ok(new { filename });
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

        [HttpGet]
        [Route("GenerateThumbnail")]
        public ActionResult GenerateThumbnail([FromQuery] string filename)
        {
            string ffmpegpath = Path.Combine(Directory.GetCurrentDirectory(), "ffmpeg", "ffmpeg.exe");
            string filepath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", User.Identity.Name, filename);
            string thumbpath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", User.Identity.Name, filename.ToLower().Replace(Path.GetExtension(filename.ToLower()), "-thumb.jpg"));
            if (System.IO.File.Exists(filepath))
            {
                if (filename.ToLower().EndsWith(".ogg") || filename.ToLower().EndsWith(".mp4") || filename.ToLower().EndsWith(".webm") || filename.ToLower().EndsWith(".mov"))
                {
                    //var cmd = '"' + ffmpegpath + '"' + " -itsoffset -1  -i " + '"' + filepath + '"' + " -vcodec mjpeg -vframes 1 -an -f rawvideo -s 320x240 " + '"' + thumbpath + '"';

                    ProcessStartInfo startInfo = new ProcessStartInfo
                    {
                        CreateNoWindow = false,
                        UseShellExecute = false,
                        FileName = ffmpegpath,
                        Arguments = " -itsoffset -1  -i " + '"' + filepath + '"' + " -vcodec mjpeg -vframes 1 -filter:v scale=\"280:-1\" " + '"' + thumbpath + '"',
                        RedirectStandardOutput = true
                    };
                    Console.WriteLine(string.Format("Executing \"{0}\" with arguments \"{1}\".\r\n", startInfo.FileName, startInfo.Arguments));
                    try
                    {
                        using Process process = Process.Start(startInfo);
                        process.Start();
                        process.WaitForExit(2000);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                    }
                }
            }
            return Ok();
        }

        //TO DO
        //[HttpGet]
        //[Route("CompressVideo")]
        //public ActionResult CompressVideo([FromQuery] string filename)
        //{
        //    string filepath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", User.Identity.Name, filename);
        //    string thumbpath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", User.Identity.Name, filename.ToLower().Replace(Path.GetExtension(filename.ToLower()), "-thumb" + Path.GetExtension(filename.ToLower())));
        //    if (System.IO.File.Exists(filepath))
        //    {
        //        if (filename.ToLower().EndsWith(".ogg") || filename.ToLower().EndsWith(".mp4") || filename.ToLower().EndsWith(".webm") || filename.ToLower().EndsWith(".mov"))
        //        {
        //            var cmd = '"' + ffmpegpath + '"' + " -itsoffset -1  -i " + '"' + filepath + '"' + " -vcodec mjpeg -vframes 1 -an -f rawvideo -s 320x240 " + '"' + thumbpath + '"';

        //            ProcessStartInfo startInfo = new ProcessStartInfo();
        //            startInfo.CreateNoWindow = false;
        //            startInfo.UseShellExecute = false;
        //            startInfo.FileName = ffmpegpath;
        //            startInfo.Arguments = " -itsoffset -1  -i " + '"' + filepath + '"' + " -vcodec mjpeg -vframes 1 -filter:v scale=\"280:-1\" " + '"' + thumbpath + '"';
        //            startInfo.RedirectStandardOutput = true;
        //            Console.WriteLine(string.Format("Executing \"{0}\" with arguments \"{1}\".\r\n", startInfo.FileName, startInfo.Arguments));
        //            try
        //            {
        //                using (Process process = Process.Start(startInfo))
        //                {
        //                    process.Start();
        //                    process.WaitForExit(2000);
        //                }
        //            }
        //            catch (Exception ex)
        //            {
        //                Console.WriteLine(ex.Message);
        //            }
        //        }
        //    }
        //    return Ok();
        //}

        private bool MemberExists(int id)
        {
            return _context.Members.Any(e => e.ID == id);
        }
    }
}
