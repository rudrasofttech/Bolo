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
using NetTopologySuite.Triangulate.QuadEdge;
using Microsoft.AspNetCore.Hosting;
using Org.BouncyCastle.Crypto.Parameters;
using BoloWeb.Helper;
using Org.BouncyCastle.Asn1.Misc;

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
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly EmailHelper emailWorker;
        public MembersController(BoloContext context, IConfiguration config, IHubContext<PersonChatHub> hubContext, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _config = config;
            _hubContext = hubContext;
            _webHostEnvironment = webHostEnvironment;
            emailWorker = new EmailHelper(config, _webHostEnvironment);
        }

        //[HttpGet()]
        //[AllowAnonymous]
        //[Route("OTPMobile")]
        //public async Task<ActionResult> GetOTPMobile([FromQuery] string phone, [FromQuery] string code)
        //{
        //    try
        //    {
        //        var member = await _context.Members.FirstOrDefaultAsync(t => (t.Phone == phone && t.CountryCode == code));
        //        if (member == null)
        //        {
        //            member = new Member()
        //            {
        //                CountryCode = code,
        //                Status = RecordStatus.Unverified,
        //                CreateDate = DateTime.UtcNow,
        //                Email = string.Empty,
        //                Name = string.Empty,
        //                Phone = phone,
        //                OTP = EncryptionHelper.Encrypt(Helper.Utility.GenerateOTP()),
        //                OTPExpiry = Helper.Utility.OTPExpiry,
        //                PublicID = Guid.NewGuid(),
        //                Activity = ActivityStatus.Online,
        //                Bio = "",
        //                Channelname = "",
        //                City = "",
        //                Country = "",
        //                LastPulse = DateTime.UtcNow,
        //                Pic = "",
        //                ThoughtStatus = "",
        //                Visibility = MemberProfileVisibility.Public,
        //                State = ""
        //            };
        //            _context.Members.Add(member);
        //            await _context.SaveChangesAsync();
        //        }
        //        string OTP = EncryptionHelper.Decrypt(member.OTP);
        //        if (DateTime.Compare(member.OTPExpiry, DateTime.UtcNow) < 0)
        //        {
        //            OTP = Helper.Utility.GenerateOTP();
        //            member.OTP = EncryptionHelper.Encrypt(OTP);
        //            member.OTPExpiry = Helper.Utility.OTPExpiry;
        //            await _context.SaveChangesAsync();
        //        }
        //        if (!string.IsNullOrEmpty(member.Email))
        //        {
        //            EmailUtility eu = new EmailUtility(_config);
        //            eu.SendEmail(member.Email, "", "waarta@rudrasofttech.com", "", "Waarta OTP", string.Format("Your waarta one time password is: {0}", OTP));
        //        }
        //        if (!string.IsNullOrEmpty(member.Phone))
        //        {
        //            Helper.Utility.SendSMS(member.Phone, string.Format("Your Waarta OTP is: {0}", OTP));
        //        }

        //        return Ok();
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(ex.Message);
        //    }
        //}

        //[HttpGet()]
        //[AllowAnonymous]
        //[Route("OTP")]
        //public async Task<ActionResult> GetOTP([FromQuery] string id)
        //{
        //    try
        //    {
        //        var member = await _context.Members.FirstOrDefaultAsync(t => (t.Email.ToLower() == id.ToLower() || (t.Phone == id && id.Length == 10)));
        //        if (member == null)
        //        {
        //            return NotFound();
        //        }
        //        string OTP = EncryptionHelper.Decrypt(member.OTP);
        //        if (DateTime.Compare(member.OTPExpiry, DateTime.UtcNow) < 0)
        //        {
        //            OTP = Helper.Utility.GenerateOTP();
        //            member.OTP = EncryptionHelper.Encrypt(OTP);
        //            member.OTPExpiry = Helper.Utility.OTPExpiry;
        //            await _context.SaveChangesAsync();
        //        }
        //        if (!string.IsNullOrEmpty(member.Email))
        //        {
        //            EmailUtility eu = new EmailUtility(_config);
        //            eu.SendEmail(member.Email, "", "waarta@rudrasofttech.com", "", "Waarta OTP", string.Format("Your waarta one time password is: {0}", OTP));
        //        }
        //        if (!string.IsNullOrEmpty(member.Phone))
        //        {
        //            Helper.Utility.SendSMS(member.Phone, string.Format("Your Waarta OTP is: {0}", OTP));
        //        }

        //        return Ok();
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(ex.Message);
        //    }
        //}

        [HttpPost]
        [AllowAnonymous]
        [Route("Login")]
        public async Task<ActionResult<LoginReturnDTO>> Login(LoginDTO model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            var member = await _context.Members.Include(t => t.Roles).FirstOrDefaultAsync(t => (t.UserName == model.UserName || t.Email == model.UserName) && t.Password == EncryptionHelper.CalculateSHA256(model.Password));

            if (member == null)
            {
                return NotFound(new { error = "Invalid Credentials" });
            }
            else
            {
                member.Status = RecordStatus.Active;
                await _context.SaveChangesAsync();
                var mdto = new MemberDTO(member);
                if (_context.ProfileLinks.Any(t => t.Member.ID == member.ID))
                    mdto.Links = _context.ProfileLinks.Where(t => t.Member.ID == member.ID).ToList();
                if (_context.ProfileEmails.Any(t => t.Member.ID == member.ID))
                    mdto.Emails = _context.ProfileEmails.Where(t => t.Member.ID == member.ID).ToList();
                if (_context.ProfilePhones.Any(t => t.Member.ID == member.ID))
                    mdto.Phones = _context.ProfilePhones.Where(t => t.Member.ID == member.ID).ToList();
                LoginReturnDTO result = new LoginReturnDTO() { Member = mdto, Token = GenerateJSONWebToken(member) };
                return result;
            }
        }

        private string GenerateJSONWebToken(Member m)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var claims = new List<Claim>() {
                new Claim(ClaimTypes.Name, m.PublicID.ToString()),
        new Claim(ClaimTypes.NameIdentifier,  m.PublicID.ToString()),
        new Claim(JwtRegisteredClaimNames.Email, m.Email),
        new Claim(JwtRegisteredClaimNames.Exp, Helper.Utility.TokenExpiry.ToString("yyyy-MM-dd")),
        new Claim(JwtRegisteredClaimNames.Jti, m.PublicID.ToString())
    };
            if (m.Roles != null)
            {
                foreach (MemberRole mr in m.Roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, mr.Name));
                }
            }
            var token = new JwtSecurityToken(_config["Jwt:Issuer"],
              _config["Jwt:Issuer"],
              claims.ToArray(),
              expires: Helper.Utility.TokenExpiry,
              signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // GET: api/Members
        [HttpGet]
        [Route("getmembers")]
        public MemberListPaged GetMembers([FromQuery] string k = "", [FromQuery] int p = 0, [FromQuery] int ps = 20)
        {
            if (!User.IsInRole("Master"))
                return null;

            MemberListPaged result = new MemberListPaged() { Current = p, PageSize = ps };
            var query = _context.Members.Where(t => true);
            if (!string.IsNullOrEmpty(k))
                query = query.Where(t => t.Email.Contains(k) || t.UserName.Contains(k) || t.Name.Contains(k));
            result.Total = query.Count();
            result.Members = query.OrderByDescending(t => t.CreateDate).Select(t => new MemberDTO(t)).Skip(ps * p).Take(ps).ToList();
            foreach (var m in result.Members)
            {
                m.FollowerCount = _context.Followers.Count(t => t.Following.PublicID == m.ID);
                m.PostCount = _context.Posts.Count(t => t.Owner.PublicID == m.ID);
                m.FollowingCount = _context.Followers.Count(t => t.Follower.PublicID == m.ID);
            }
            return result;
        }

        [HttpGet]
        [Route("changestatus")]
        public ActionResult ChangeStatus([FromQuery] Guid id, [FromQuery] RecordStatus status)
        {
            if (!User.IsInRole("Master"))
                return null;
            try
            {
                var m = _context.Members.FirstOrDefault(t => t.PublicID == id);
                if (m != null)
                {
                    m.Status = status;
                    m.ModifyDate = DateTime.UtcNow;
                }
                _context.SaveChanges();
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Unable to process request. " + ex.Message });
            }
        }

        // GET: api/Members
        [HttpGet]
        [Route("Validate")]
        public async Task<ActionResult<MemberDTO>> Validate()
        {
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
                return NotFound();
            else
            {
                MemberDTO result = new MemberDTO(member)
                {
                    Phone = member.Phone,
                    Email = member.Email,
                    FollowerCount = _context.Followers.Count(t => t.Following.ID == member.ID),
                    FollowingCount = _context.Followers.Count(t => t.Follower.ID == member.ID),
                    PostCount = _context.Posts.Count(t => t.Owner.ID == member.ID)
                };
                if (_context.ProfileLinks.Any(t => t.Member.ID == member.ID))
                    result.Links = _context.ProfileLinks.Where(t => t.Member.ID == member.ID).ToList();
                if (_context.ProfileEmails.Any(t => t.Member.ID == member.ID))
                    result.Emails = _context.ProfileEmails.Where(t => t.Member.ID == member.ID).ToList();
                if (_context.ProfilePhones.Any(t => t.Member.ID == member.ID))
                    result.Phones = _context.ProfilePhones.Where(t => t.Member.ID == member.ID).ToList();
                LocationHelper lh = new LocationHelper();
                result.Country = lh.GetCountryName(result.Country);
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
            try
            {
                Member member = null;
                if (Guid.TryParse(id, out Guid idguid))
                {
                    member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == idguid);
                }
                else
                {
                    member = await _context.Members.FirstOrDefaultAsync(t => t.UserName == id);
                }

                if (member == null)
                {
                    return NotFound();
                }
                MemberDTO result = new MemberDTO(member)
                {

                    Phone = member.Phone,
                    Email = member.Email,
                    FollowerCount = _context.Followers.Count(t => t.Following.ID == member.ID && t.Status == FollowerStatus.Active),
                    FollowingCount = _context.Followers.Count(t => t.Follower.ID == member.ID),
                    PostCount = _context.Posts.Count(t => t.Owner.ID == member.ID),
                    FollowRequestCount = _context.Followers.Count(t => t.Following.ID == member.ID && t.Status == FollowerStatus.Requested)
                };
                if (_context.ProfileLinks.Any(t => t.Member.ID == member.ID))
                    result.Links = _context.ProfileLinks.Where(t => t.Member.ID == member.ID).ToList();
                if (_context.ProfileEmails.Any(t => t.Member.ID == member.ID))
                    result.Emails = _context.ProfileEmails.Where(t => t.Member.ID == member.ID).ToList();
                if (_context.ProfilePhones.Any(t => t.Member.ID == member.ID))
                    result.Phones = _context.ProfilePhones.Where(t => t.Member.ID == member.ID).ToList();
                LocationHelper lh = new LocationHelper();
                result.Country = lh.GetCountryName(result.Country);

                return result;
            }catch(Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet]
        [Route("getlinks")]
        public List<ProfileLink> GetLinks()
        {
            var member = _context.Members.First(t => t.PublicID == new Guid(User.Identity.Name));
            return _context.ProfileLinks.Where(t => t.Member.ID == member.ID).ToList();
        }

        [HttpGet]
        [Route("removelink/{id}")]
        public ActionResult RemoveLink(Guid id)
        {
            try
            {
                var member = _context.Members.First(t => t.PublicID == new Guid(User.Identity.Name));
                var l = _context.ProfileLinks.FirstOrDefault(t => t.Member.ID == member.ID && t.ID == id);
                if (l == null)
                    return NotFound();
                else
                {
                    _context.ProfileLinks.Remove(l);
                    _context.SaveChanges();
                    return Ok();
                }
            }catch(Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost]
        [Route("savelink")]
        public ActionResult SaveLink([FromForm] Guid id, [FromForm] string url, [FromForm] string name)
        {
            try
            {
                var member = _context.Members.First(t => t.PublicID == new Guid(User.Identity.Name));
                if (id == Guid.Empty)
                {
                    var pl = new ProfileLink()
                    {
                        ID = Guid.NewGuid(),
                        Member = member,
                        Name = name,
                        URL = url
                    };
                    _context.ProfileLinks.Add(pl);
                    _context.SaveChanges();
                    return Ok(pl);
                }
                else
                {
                    var pl = _context.ProfileLinks.FirstOrDefault(t => t.Member.ID == member.ID && t.ID == id);
                    if(pl == null) return NotFound();
                    else
                    {
                        pl.Name = name;
                        pl.URL = url;
                        _context.SaveChanges();
                        return Ok(pl);
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet]
        [Route("getemails")]
        public List<ProfileEmail> GetEmails()
        {
            var member = _context.Members.First(t => t.PublicID == new Guid(User.Identity.Name));
            return _context.ProfileEmails.Where(t => t.Member.ID == member.ID).ToList();
        }

        [HttpGet]
        [Route("removeemail/{id}")]
        public ActionResult RemoveEmail(Guid id)
        {
            try
            {
                var member = _context.Members.First(t => t.PublicID == new Guid(User.Identity.Name));
                var l = _context.ProfileEmails.FirstOrDefault(t => t.Member.ID == member.ID && t.ID == id);
                if (l == null)
                    return NotFound();
                else
                {
                    _context.ProfileEmails.Remove(l);
                    _context.SaveChanges();
                    return Ok();
                }
            }catch(Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost]
        [Route("saveemail")]
        public ActionResult SaveEmail([FromForm] Guid id, [FromForm] string email)
        {
            try
            {
                var member = _context.Members.First(t => t.PublicID == new Guid(User.Identity.Name));
                if (id == Guid.Empty)
                {
                    var pe = new ProfileEmail()
                    {
                        ID = Guid.NewGuid(),
                        Member = member,
                        Email = email
                    };
                    _context.ProfileEmails.Add(pe);
                    _context.SaveChanges();
                    return Ok(pe);
                }
                else
                {
                    var pe = _context.ProfileEmails.FirstOrDefault(t => t.Member.ID == member.ID && t.ID == id);
                    if (pe == null) return NotFound();
                    else
                    {
                        pe.Email = email;
                        _context.SaveChanges();
                        return Ok(pe);
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        

        [HttpGet]
        [Route("getphones")]
        public List<ProfilePhone> GetPhones()
        {
            var member = _context.Members.First(t => t.PublicID == new Guid(User.Identity.Name));
            return _context.ProfilePhones.Where(t => t.Member.ID == member.ID).ToList();
        }

        [HttpGet]
        [Route("removephone/{id}")]
        public ActionResult RemovePhone(Guid id)
        {
            var member = _context.Members.First(t => t.PublicID == new Guid(User.Identity.Name));
            var l = _context.ProfilePhones.FirstOrDefault(t => t.Member.ID == member.ID && t.ID == id);
            if (l == null)
                return NotFound();
            else
            {
                _context.ProfilePhones.Remove(l);
                _context.SaveChanges();
                return Ok();
            }
        }

        [HttpPost]
        [Route("savephone")]
        public ActionResult SavePhone([FromForm] Guid id, [FromForm] string phone)
        {
            try
            {
                var member = _context.Members.First(t => t.PublicID == new Guid(User.Identity.Name));
                if (id == Guid.Empty)
                {
                    var pp = new ProfilePhone()
                    {
                        ID = Guid.NewGuid(),
                        Member = member,
                        Phone = phone
                    };
                    _context.ProfilePhones.Add(pp);
                    _context.SaveChanges();
                    return Ok(pp);
                }
                else
                {
                    var pe = _context.ProfilePhones.FirstOrDefault(t => t.Member.ID == member.ID && t.ID == id);
                    if (pe == null) return NotFound();
                    else
                    {
                        pe.Phone = phone;
                        _context.SaveChanges();
                        return Ok(pe);
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("getsecurityquestion/{id}")]
        public ActionResult<string> GetSecurityQuestion(string id)
        {
            var member = _context.Members.FirstOrDefault(t => t.Email == id || t.UserName == id);
            if (member == null) { return NotFound(); }

            return Ok(new { member.SecurityQuestion });
        }

        [HttpPost]
        [AllowAnonymous]
        [Route("validatesecurityanswer")]
        public ActionResult ValidateSecurityAnswer([FromForm] string username, [FromForm] string question, [FromForm] string answer, [FromForm] string password)
        {
            //if (string.IsNullOrEmpty(answer))
            //    return BadRequest(new { error = "Security Answer missing." });
            if (string.IsNullOrEmpty(question))
                return BadRequest(new { error = "Security Question missing." });
            if (string.IsNullOrEmpty(username))
                return BadRequest(new { error = "Security Question missing." });
            if (string.IsNullOrEmpty(password))
                return BadRequest(new { error = "Password missing." });
            else if (password.Length < 8)
                return BadRequest(new { error = "Try a longer password, minimum 8 characters." });

            try
            {
                var member = _context.Members.FirstOrDefault(t => (t.Email == username || t.UserName == username) && t.SecurityQuestion == question && t.SecurityAnswer == EncryptionHelper.CalculateSHA256(answer.ToLower()));
                if (member == null)
                {
                    return NotFound(new { error = "Security answer provided does not match our records." });
                }
                else
                {
                    member.Password = EncryptionHelper.CalculateSHA256(password);
                    member.ModifyDate = DateTime.UtcNow;
                    _context.SaveChanges();
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Unable to process request. " + ex.Message });
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
        [Route("savesecurityquestion")]
        public async Task<IActionResult> SaveSecurityQuestion([FromQuery] string d)
        {
            if (string.IsNullOrEmpty(d))
                return BadRequest(new { error = "Security Question is required." });
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
            {
                return NotFound();
            }
            else
            {
                member.SecurityQuestion = d;
                member.ModifyDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok();
            }
        }

        [HttpGet]
        [Route("savesecurityanswer")]
        public async Task<IActionResult> SaveSecurityAnswer([FromQuery] string d)
        {
            if (string.IsNullOrEmpty(d))
                return BadRequest(new { error = "Security Answer is required." });

            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
            {
                return NotFound();
            }
            else
            {
                member.SecurityAnswer = EncryptionHelper.CalculateSHA256(d);
                member.ModifyDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
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
                    return BadRequest(new { error = "Email address is associated with another account. Provide a different email." });
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
                    return BadRequest(new { error = "Mobile number is associated with another account. Provide a different email." });
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
                    if (!string.IsNullOrEmpty(pic))
                    {
                        string substr = pic.Substring(pic.IndexOf(";base64,") + 8, pic.Length - (pic.IndexOf(";base64,") + 8));
                        byte[] data = System.Convert.FromBase64String(substr);
                        string filename = string.Format("{0}.jpg", Guid.NewGuid().ToString());
                        string webRootPath = _webHostEnvironment.WebRootPath;
                        if (!Directory.Exists(Path.Combine(webRootPath, "dp")))
                            Directory.CreateDirectory(Path.Combine(webRootPath, "dp"));

                        string abspath = Path.Combine(webRootPath, "dp", filename);
                        string relpath = string.Format("dp/{0}", filename);
                        using (var stream = new MemoryStream(data, 0, data.Length))
                        {
                            System.Drawing.Image image = System.Drawing.Image.FromStream(stream);
                            image.Save(abspath, System.Drawing.Imaging.ImageFormat.Jpeg);

                        }
                        pic = relpath;
                    }
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
        [AllowAnonymous]
        [Route("changeallpic")]
        public async Task<IActionResult> ChangeAllPic()
        {

            var members = _context.Members.Where(t => !string.IsNullOrEmpty(t.Pic) && t.Pic.Contains(";base64,"));
            foreach (var member in members)
            {
                string pic = member.Pic;
                if (!string.IsNullOrEmpty(pic))
                {
                    string substr = pic.Substring(pic.IndexOf(";base64,") + 8, pic.Length - (pic.IndexOf(";base64,") + 8));
                    byte[] data = System.Convert.FromBase64String(substr);
                    string filename = string.Format("{0}.jpg", Guid.NewGuid().ToString());
                    string webRootPath = _webHostEnvironment.WebRootPath;
                    if (!Directory.Exists(Path.Combine(webRootPath, "dp")))
                        Directory.CreateDirectory(Path.Combine(webRootPath, "dp"));

                    string abspath = Path.Combine(webRootPath, "dp", filename);
                    string relpath = string.Format("dp/{0}", filename);
                    using (var stream = new MemoryStream(data, 0, data.Length))
                    {
                        System.Drawing.Image image = System.Drawing.Image.FromStream(stream);
                        image.Save(abspath, System.Drawing.Imaging.ImageFormat.Jpeg);

                    }
                    pic = relpath;
                }
                member.Pic = pic;
                member.ModifyDate = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet]
        [Route("savethoughtstatus")]
        public async Task<IActionResult> SaveThoughtStatus([FromQuery] string d)
        {
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
                return NotFound();
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

                return Ok(new { });
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
        [Route("register")]
        public async Task<ActionResult<MemberDTO>> Register(RegisterDTO model)
        {
            if (String.IsNullOrEmpty(model.UserName))
            {
                return BadRequest(new { error = "Username is missing." });
            }
            else if (!Helper.Utility.RegexMatch(model.UserName, "^[a-zA-Z0-9_.]*$"))
            {
                return BadRequest(new { error = "Only alphabets, numbers _ and . allowed in Username." });
            }
            if (string.IsNullOrEmpty(model.SecurityQuestion))
            {
                return BadRequest(new { error = "Security question is missing." });
            }
            if (string.IsNullOrEmpty(model.SecurityAnswer))
            {
                return BadRequest(new { error = "Security Answer is missing." });
            }
            if (string.IsNullOrEmpty(model.Password))
            {
                return BadRequest(new { error = "Password is missing." });
            }
            else if (model.Password.Length < 8)
            {
                return BadRequest(new { error = "Password should be 8 characters long." });
            }

            if (_context.Members.Count(t => t.UserName == model.UserName) > 0)
            {
                return BadRequest(new { error = "Username already exist, please try to log in." });
            }

            if (_context.Members.Count(t => t.Email == model.Email) > 0)
            {
                return BadRequest(new { error = "Email already exist, please use another email address." });
            }
            //if (_context.Members.Count(t => t.Phone == model.Phone) > 0)
            //{
            //    return BadRequest(new { error = "Phone already exist, please use another phone." });
            //}
            IP2LocationResult locData = new IP2LocationResult();
            try
            {
                IPLocationWorker iplWorker = new IPLocationWorker(_config);
                locData = await iplWorker.GetLocationAsync(Request.HttpContext.Connection.RemoteIpAddress.ToString());
            }
            catch { }
            Member m = new Member()
            {
                Status = RecordStatus.Active,
                CreateDate = DateTime.UtcNow,
                Email = model.Email,
                Name = string.Empty,
                Phone = string.Empty,
                Password = EncryptionHelper.CalculateSHA256(model.Password),
                PublicID = Guid.NewGuid(),
                Activity = ActivityStatus.Online,
                Bio = string.Empty,
                UserName = model.UserName,
                City = locData.City_Name,
                LastPulse = DateTime.UtcNow,
                Pic = string.Empty,
                ThoughtStatus = string.Empty,
                Visibility = MemberProfileVisibility.Public,
                State = locData.Region_Name,
                Country = locData.Country_Name,
                SecurityAnswer = EncryptionHelper.CalculateSHA256(model.SecurityAnswer.ToLower().Trim()),
                SecurityQuestion = model.SecurityQuestion,
                IsEmailVerified = false
            };
            _context.Members.Add(m);
            await _context.SaveChangesAsync();
            //try
            //{
            //    await emailWorker.SendVerificationEmailAsync(m.UserName, m.Email, $"https://www.yocail.com/home/emailverify/{m.PublicID}");
            //}
            //catch (Exception)
            //{

            //}
            //if (!string.IsNullOrEmpty(model.Phone))
            //{
            //    Helper.Utility.SendSMS(model.Phone, string.Format("Your Bolo passcode is: {0}", OTP));
            //}
            return Ok(new MemberDTO(m) { Email = m.Email, Phone = m.Phone });
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
            foreach (var item in members)
            {
                item.FollowerCount = _context.Followers.Count(t => t.Following.PublicID == item.ID);
                item.FollowingCount = _context.Followers.Count(t => t.Follower.PublicID == item.ID);
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

        [HttpPost]
        [Route("SubscribeNotification")]
        public async Task<ActionResult> SubscribeNotification([FromForm] string endpoint, [FromForm] string p256dh, [FromForm] string auth)
        {
            var user = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (user == null)
            {
                return NotFound();
            }
            else
            {
                PushNotificationWebApp pnwa = _context.PushNotificationWebApps.FirstOrDefault(t => t.User.ID == user.ID && t.Endpoint == endpoint);
                if (pnwa == null)
                {
                    pnwa = new PushNotificationWebApp()
                    {
                        Auth = auth,
                        Endpoint = endpoint,
                        P256dh = p256dh,
                        User = user
                    };
                    _context.PushNotificationWebApps.Add(pnwa);
                }
                else
                {
                    pnwa.Endpoint = endpoint;
                    pnwa.Auth = auth;
                    pnwa.P256dh = p256dh;
                    pnwa.User = user;
                }

                await _context.SaveChangesAsync();
                return Ok();
            }
        }

        [HttpGet]
        [Authorize]
        [Route("count")]
        public ActionResult Count([FromQuery] RecordStatus status)
        {
            return Ok(new { count = _context.Members.Count(t => t.Status == status) });
        }

        [HttpGet]
        [Route("sendemailverification/{id}")]
        public async Task<ActionResult<Tuple<bool, string>>> SendEmailVerification(Guid id)
        {
            var m = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == id);
            if (m == null)
            {
                return NotFound();
            }
            else
            {
                var result = await emailWorker.SendVerificationEmailAsync(m.UserName, m.Email, $"https://www.yocail.com/home/emailverify/{m.PublicID}");
                return Ok(result);
            }
        }

        private bool MemberExists(int id)
        {
            return _context.Members.Any(e => e.ID == id);
        }
    }
}
