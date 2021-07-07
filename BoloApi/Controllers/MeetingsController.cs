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
using System.Text;
using System.IO;
using Org.BouncyCastle.Ocsp;
using System.Drawing;
using System.Drawing.Imaging;
using System.Diagnostics;
using Microsoft.AspNetCore.SignalR;
using Bolo.Hubs;

namespace Bolo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MeetingsController : ControllerBase
    {
        private readonly BoloContext _context;
        private readonly IHubContext<PersonChatHub> _hubContext;
        public MeetingsController(BoloContext context, IHubContext<PersonChatHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        // GET: api/Meetings
        [HttpGet]

        public async Task<ActionResult<List<MeetingDTO>>> GetMeetings()
        {
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
            {
                return NotFound();
            }
            //get list of owned meeting
            var ownedm = _context.Meetings.Include(t => t.Owner)
                .Where(t => t.Owner.ID == member.ID)
                .OrderByDescending(t => t.CreateDate)
                .Select(t => new MeetingDTO()
                {
                    CreateDate = t.CreateDate,
                    ID = t.PublicID,
                    Owner = new MemberDTO(t.Owner),
                    Name = t.Name,
                    Purpose = t.Purpose,
                    MemberRelation = MeetingMemberType.Owner,
                    Pic = t.Pic
                }).ToList<MeetingDTO>();
            //get list of meeting of which member is part of but not blocked
            var partof = _context.MeetingMembers.Include(t => t.Meeting)
                .Where(t => t.Member.ID == member.ID && t.MemberType != MeetingMemberType.Blocked)
                .OrderBy(t => t.Meeting.Name).Select(t => new MeetingDTO()
                {
                    CreateDate = t.Meeting.CreateDate,
                    ID = t.Meeting.PublicID,
                    Owner = null,
                    Name = t.Meeting.Name,
                    Purpose = t.Meeting.Purpose,
                    MemberRelation = t.MemberType,
                    Pic = t.Meeting.Pic
                }).ToList<MeetingDTO>();

            List<MeetingDTO> meetings = new List<MeetingDTO>();
            meetings.AddRange(ownedm);
            meetings.AddRange(partof);
            return meetings;
        }

        // GET: api/Meetings/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<MeetingDTO>> GetMeeting(string id)
        {
            var meeting = await _context.Meetings.Include(t => t.Owner).FirstOrDefaultAsync(t => t.PublicID.ToLower() == id.ToLower());

            if (meeting == null)
            {
                return NotFound();
            }
            else
            {
                MeetingDTO result = new MeetingDTO()
                {
                    ID = meeting.PublicID,
                    CreateDate = meeting.CreateDate,
                    Name = meeting.Name,
                    Purpose = meeting.Purpose,
                    Pic = meeting.Pic
                };
                if (meeting.Owner != null)
                {
                    result.Owner = new MemberDTO(meeting.Owner);
                }
                return result;
            }
        }

        [HttpPost]
        [Route("savepic")]
        public async Task<IActionResult> SavePic([FromForm] string pic, [FromForm] string mid)
        {

            var meeting = _context.Meetings.Include(t => t.Owner).FirstOrDefault(t => t.PublicID.ToLower() == mid.ToLower());

            if (meeting == null)
            {
                return NotFound();
            }
            //can logged in member remove member to a meeting
            bool cansave = false;
            var member = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
            if (meeting.Owner.ID == member.ID)
            {
                cansave = true;
            }

            var mm = _context.MeetingMembers.Include(t => t.Meeting).Include(t => t.Member)
                .FirstOrDefault(t => t.Meeting.ID == meeting.ID && t.Member.ID == member.ID);
            if (mm != null)
            {
                if (mm.MemberType == MeetingMemberType.Admin)
                {
                    cansave = true;
                }

            }
            if (cansave)
            {
                meeting.Pic = pic;
                await _context.SaveChangesAsync();
                MeetingDTO mdto = new MeetingDTO() { CreateDate = meeting.CreateDate, ID = meeting.PublicID, MemberRelation = MeetingMemberType.Owner, Name = meeting.Name, Owner = new MemberDTO(meeting.Owner), Pic = meeting.Pic, Purpose = meeting.Purpose };
                _ = _hubContext.Clients.User(meeting.Owner.PublicID.ToString().ToLower()).SendAsync("DiscussionInfoUpdated", meeting.PublicID, mdto);
                foreach (MeetingMember mmem in _context.MeetingMembers.Where(t => t.Meeting.PublicID == mid && (t.MemberType != MeetingMemberType.Blocked && t.MemberType != MeetingMemberType.Pending)))
                {
                    mdto.MemberRelation = mmem.MemberType;
                    _ = _hubContext.Clients.User(mmem.Member.PublicID.ToString().ToLower()).SendAsync("DiscussionInfoUpdated", meeting.PublicID, mdto);
                }
            }
            return Ok();
        }

        [HttpPost]
        [Route("savename")]
        public async Task<IActionResult> SaveName([FromForm] string name, [FromForm] string mid)
        {

            var meeting = _context.Meetings.Include(t => t.Owner).FirstOrDefault(t => t.PublicID.ToLower() == mid.ToLower());

            if (meeting == null)
            {
                return NotFound();
            }
            //can logged in member remove member to a meeting
            bool cansave = false;
            var member = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
            if (meeting.Owner.ID == member.ID)
            {
                cansave = true;
            }

            var mm = _context.MeetingMembers.Include(t => t.Meeting).Include(t => t.Member)
                .FirstOrDefault(t => t.Meeting.ID == meeting.ID && t.Member.ID == member.ID);
            if (mm != null)
            {
                if (mm.MemberType == MeetingMemberType.Admin)
                {
                    cansave = true;
                }

            }
            if (cansave)
            {
                meeting.Name = name;
                await _context.SaveChangesAsync();
                MeetingDTO mdto = new MeetingDTO() { CreateDate = meeting.CreateDate, ID = meeting.PublicID, MemberRelation = MeetingMemberType.Owner, Name = meeting.Name, Owner = new MemberDTO(meeting.Owner), Pic = meeting.Pic, Purpose = meeting.Purpose };
                _ = _hubContext.Clients.User(meeting.Owner.PublicID.ToString().ToLower()).SendAsync("DiscussionInfoUpdated", meeting.PublicID, mdto);
                foreach (MeetingMember mmem in _context.MeetingMembers.Where(t => t.Meeting.PublicID == mid && (t.MemberType != MeetingMemberType.Blocked && t.MemberType != MeetingMemberType.Pending)))
                {
                    mdto.MemberRelation = mmem.MemberType;
                    _ = _hubContext.Clients.User(mmem.Member.PublicID.ToString().ToLower()).SendAsync("DiscussionInfoUpdated", meeting.PublicID, mdto);
                }
            }
            return Ok();
        }

        [HttpPost]
        [Route("savepurpose")]
        public async Task<IActionResult> SavePurpose([FromForm] string purpose, [FromForm] string mid)
        {

            var meeting = _context.Meetings.Include(t => t.Owner).FirstOrDefault(t => t.PublicID.ToLower() == mid.ToLower());

            if (meeting == null)
            {
                return NotFound();
            }
            //can logged in member remove member to a meeting
            bool cansave = false;
            var member = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
            if (meeting.Owner.ID == member.ID)
            {
                cansave = true;
            }

            var mm = _context.MeetingMembers.Include(t => t.Meeting).Include(t => t.Member)
                .FirstOrDefault(t => t.Meeting.ID == meeting.ID && t.Member.ID == member.ID);
            if (mm != null)
            {
                if (mm.MemberType == MeetingMemberType.Admin)
                {
                    cansave = true;
                }

            }
            if (cansave)
            {
                meeting.Purpose = purpose;
                await _context.SaveChangesAsync();
                MeetingDTO mdto = new MeetingDTO() { CreateDate = meeting.CreateDate, ID = meeting.PublicID, MemberRelation = MeetingMemberType.Owner, Name = meeting.Name, Owner = new MemberDTO(meeting.Owner), Pic = meeting.Pic, Purpose = meeting.Purpose };
                _ = _hubContext.Clients.User(meeting.Owner.PublicID.ToString().ToLower()).SendAsync("DiscussionInfoUpdated", meeting.PublicID, mdto);
                foreach (MeetingMember mmem in _context.MeetingMembers.Where(t => t.Meeting.PublicID == mid && (t.MemberType != MeetingMemberType.Blocked && t.MemberType != MeetingMemberType.Pending)))
                {
                    mdto.MemberRelation = mmem.MemberType;
                    _ = _hubContext.Clients.User(mmem.Member.PublicID.ToString().ToLower()).SendAsync("DiscussionInfoUpdated", meeting.PublicID, mdto);
                }
            }
            return Ok();
        }

        // PUT: api/Meetings/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMeeting(int id, Meeting meeting)
        {
            if (id != meeting.ID)
            {
                return BadRequest();
            }

            _context.Entry(meeting).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MeetingExists(id))
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

        [HttpGet]
        [Route("join/{id}")]
        public async Task<ActionResult<string>> JoinMeeting(string id)
        {
            var meeting = await _context.Meetings.Include(t => t.Owner).FirstOrDefaultAsync(t => t.PublicID.ToLower() == id.ToLower());

            if (meeting == null)
            {
                return NotFound();
            }
            string result = "";
            var member = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
            if (meeting.Owner.ID == member.ID)
            {
                result = "owner";
            }
            else
            {
                var mm = _context.MeetingMembers.Include(t => t.Meeting).Include(t => t.Member)
                    .FirstOrDefault(t => t.Meeting.ID == meeting.ID && t.Member.ID == member.ID);
                if (mm != null)
                {

                    switch (mm.MemberType)
                    {
                        case MeetingMemberType.General:
                            result = "general";
                            break;
                        case MeetingMemberType.Auditor:
                            result = "auditor";
                            break;
                        case MeetingMemberType.Admin:
                            result = "admin";
                            break;
                        case MeetingMemberType.Pending:
                            result = "pending";
                            break;
                        case MeetingMemberType.Blocked:
                            result = "blocked";
                            break;
                        default:
                            break;
                    }
                }
                else
                {
                    mm = new MeetingMember() { CreateDate = DateTime.UtcNow, Meeting = meeting, Member = member, MemberType = MeetingMemberType.Pending };
                    _context.MeetingMembers.Add(mm);
                    await _context.SaveChangesAsync();
                    result = "pending";
                }
            }
            return result;

        }

        [HttpGet]
        [Route("members/{id}")]
        public async Task<ActionResult<List<MeetingMemberDTO>>> GetMeetingMembers(string id)
        {
            List<MeetingMemberDTO> result = new List<MeetingMemberDTO>();
            var meeting = await _context.Meetings.Include(t => t.Owner).FirstOrDefaultAsync(t => t.PublicID.ToLower() == id.ToLower());

            if (meeting == null)
            {
                return NotFound();
            }
            bool cangetlist = false;
            //can logged in member get member list
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            
            if (member.ID == meeting.Owner.ID) {
                cangetlist = true;            }

            //add owner
            result.Add(new MeetingMemberDTO(new MemberDTO(meeting.Owner)) { MemberSince = meeting.CreateDate, MemberType = MeetingMemberType.Owner });

            var mm = await _context.MeetingMembers.Include(t => t.Meeting).Include(t => t.Member)
                .FirstOrDefaultAsync(t => t.Meeting.ID == meeting.ID && t.Member.ID == member.ID);
            if (mm != null)
            {
                if (mm.MemberType != MeetingMemberType.Blocked)
                {
                    cangetlist = true;
                }
            }
            

            if (cangetlist)
            {
                result.AddRange(_context.MeetingMembers.Include(t => t.Member).Where(t => t.Meeting.ID == meeting.ID && t.MemberType != MeetingMemberType.Blocked)
                   .OrderBy(t => t.Member.Name).Select(t => new MeetingMemberDTO(new MemberDTO(t.Member)) { MemberSince = t.CreateDate, MemberType = t.MemberType }));
            }
            return result;

        }

        [HttpGet]
        [Route("addto/{id}")]
        public ActionResult AddToMeeting(string id, [FromQuery] Guid memberid)
        {
            var meeting = _context.Meetings.Include(t => t.Owner).FirstOrDefault(t => t.PublicID.ToLower() == id.ToLower());

            if (meeting == null)
            {
                return NotFound();
            }
            //can logged in member add member to a meeting
            bool canadd = false;
            var member = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
            if (meeting.Owner.ID == member.ID)
            {
                canadd = true;
            }

            var mm = _context.MeetingMembers.Include(t => t.Meeting).Include(t => t.Member)
                .FirstOrDefault(t => t.Meeting.ID == meeting.ID && t.Member.ID == member.ID);
            if (mm != null)
            {
                if (mm.MemberType == MeetingMemberType.Admin)
                {
                    canadd = true;
                }

            }
            if (canadd)
            {
                //get the target member object
                var targetmember = _context.Members.FirstOrDefault(t => t.PublicID == memberid);
                if (targetmember != null)
                {
                    //check if member is already part of meeting or not the owner if not add the member
                    var tmm = _context.MeetingMembers.FirstOrDefault(t => t.Meeting.ID == meeting.ID && t.Member.ID == targetmember.ID);
                    if (tmm == null && meeting.Owner.ID != targetmember.ID)
                    {
                        mm = new MeetingMember() { CreateDate = DateTime.UtcNow, Meeting = meeting, Member = targetmember, MemberType = MeetingMemberType.General };
                        _context.MeetingMembers.Add(mm);
                        _context.SaveChanges();
                    }
                }
            }
            return Ok();
        }

        [HttpGet]
        [Route("remove/{id}")]
        public ActionResult RemoveFromMeeting(string id, [FromQuery] Guid mid)
        {
            var meeting = _context.Meetings.Include(t => t.Owner).FirstOrDefault(t => t.PublicID.ToLower() == id.ToLower());

            if (meeting == null)
            {
                return NotFound();
            }
            //can logged in member remove member to a meeting
            bool canremove = false;
            var member = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
            if (meeting.Owner.ID == member.ID)
            {
                canremove = true;
            }

            var mm = _context.MeetingMembers.Include(t => t.Meeting).Include(t => t.Member)
                .FirstOrDefault(t => t.Meeting.ID == meeting.ID && t.Member.ID == member.ID);
            if (mm != null)
            {
                if (mm.MemberType == MeetingMemberType.Admin)
                {
                    canremove = true;
                }

            }
            if (canremove)
            {
                var mmember = _context.MeetingMembers.SingleOrDefault(t => t.Meeting.ID == meeting.ID && t.Member.PublicID == mid);
                if (mmember != null)
                {
                    _context.MeetingMembers.Remove(mmember);
                    _context.SaveChanges();
                }
            }
            return Ok();
        }

        [HttpGet]
        [Route("leave/{id}")]
        public ActionResult LeaveMeeting(string id)
        {
            var meeting = _context.Meetings.Include(t => t.Owner).FirstOrDefault(t => t.PublicID.ToLower() == id.ToLower());

            if (meeting == null)
            {
                return NotFound();
            }
            //can logged in member remove member to a meeting
            var member = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
            var mm = _context.MeetingMembers.Include(t => t.Meeting).Include(t => t.Member)
                .FirstOrDefault(t => t.Meeting.ID == meeting.ID && t.Member.ID == member.ID);
            if (mm != null)
            {
                _context.MeetingMembers.Remove(mm);
                _context.SaveChanges();
            }

            return Ok();
        }



        // POST: api/Meetings
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult<MeetingDTO>> PostMeeting(CreateMeetingDTO m)
        {
            //remove unnamed meeting which are older than 48 hours
            var meetings = _context.Meetings.Where(t => t.Name == string.Empty && t.CreateDate < DateTime.Now.AddHours(-48));
            foreach (var meet in meetings)
            {
                _context.Meetings.Remove(meet);
                if (!string.IsNullOrEmpty(meet.PublicID))
                {
                    var meetingpath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", "meeting", meet.PublicID);
                    if (Directory.Exists(meetingpath))
                    {
                        Directory.Delete(meetingpath, true);
                    }
                }
            }
            _ = _context.SaveChangesAsync();

            Meeting meeting = new Meeting
            {
                CreateDate = DateTime.UtcNow,
                Status = RecordStatus.Active,
                Name = m.Name,
                Purpose = m.Purpose,
                Pic = m.Pic
            };
            if (User.Identity.IsAuthenticated)
            {
                meeting.Owner = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
            }
            else
            {
                meeting.Owner = null;
            }
            _context.Meetings.Add(meeting);
            await _context.SaveChangesAsync();

            string id = string.Format("{0}{1}{2}{3}{4}{5}{6}", meeting.ID, DateTime.Now.DayOfYear, DateTime.Now.Month, DateTime.Now.Hour, DateTime.Now.Day, DateTime.Now.Minute, DateTime.Now.Second);
            if (id.Length > 9)
            {
                id = id.Substring(0, 9);
            }
            //id = string.Format("{0}{1}{2}", id.Substring(0, 8), meeting.ID, id.Substring(8, 4));

            meeting.PublicID = id;
            await _context.SaveChangesAsync();

            MeetingDTO result = new MeetingDTO()
            {
                ID = meeting.PublicID,
                CreateDate = meeting.CreateDate,
                Name = meeting.Name,
                Purpose = meeting.Purpose,
                Pic = meeting.Pic
            };
            if (meeting.Owner != null)
            {
                result.Owner = new MemberDTO(meeting.Owner);
            }
            return result;
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("media/{id}")]
        public ActionResult GetMedia(string id, [FromQuery] string f)
        {
            var fpath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", "meeting", id, f);
            switch (Path.GetExtension(fpath).ToLower())
            {
                case ".jpg":
                    return PhysicalFile(fpath, "image/jpg");
                case ".jpeg":
                    return PhysicalFile(fpath, "image/jpg");
                case ".png":
                    return PhysicalFile(fpath, "image/png");
                case ".gif":
                    return PhysicalFile(fpath, "image/gif");
                case ".mp3":
                    return PhysicalFile(fpath, "audio/mp3");
                case ".webm":
                    return PhysicalFile(fpath, "video/webm");
                case ".mp4":
                    return PhysicalFile(fpath, "video/mp4");
                case ".ogg":
                    return PhysicalFile(fpath, "video/ogg");
                case ".mov":
                    return PhysicalFile(fpath, "video/mov");
                case ".doc":
                case ".docx":
                case ".pdf":
                case ".htm":
                case ".html":
                case ".txt":
                case ".css":
                case ".zip":
                case ".xls":
                case ".xlsx":
                    return PhysicalFile(fpath, "application/*");

                default:
                    return PhysicalFile(fpath, "application/*");
            }

        }


        [HttpGet]
        [Route("DownloadChunk")]
        public ActionResult DownloadFile([FromQuery] string filename, [FromQuery] int position, [FromQuery] string id)
        {
            if (string.IsNullOrEmpty(filename))
            {
                return Ok(new { data = string.Empty, position = -1, length = -1 });
            }
            string filepath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", "meeting", id, filename);
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
        public ActionResult PostFile([FromForm] string f, [FromForm] string meetingid, [FromForm] string filename, [FromForm] bool gfn)
        {
            if (f == null || f.Length == 0)
                return Content("file not selected");

            if (gfn)
                filename = Guid.NewGuid().ToString().ToLower() + Path.GetExtension(filename);

            var meetingpath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", "meeting", meetingid);
            if (!Directory.Exists(meetingpath))
            {
                Directory.CreateDirectory(meetingpath);
            }
            var path = Path.Combine(meetingpath, filename);


            //string[] arr = f.Split(";base64,");
            //if (arr.Length == 2)
            //{
            //    //byte[] barr = br.ReadBytes((int)stream.Length);
            //    byte[] barr = Convert.FromBase64String(arr[1]);
            //    if (System.IO.File.Exists(path))
            //    {
            //        using FileStream fs = new FileStream(path, FileMode.Append);
            //        fs.Write(barr, 0, barr.Length);
            //    }
            //    else
            //    {
            //        using FileStream fs = new FileStream(path, FileMode.OpenOrCreate);
            //        fs.Write(barr, 0, barr.Length);
            //    }
            //}
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

        [HttpGet]
        [Route("GenerateThumbnail")]
        public ActionResult GenerateThumbnail([FromQuery] string filename, [FromQuery] string id)
        {
            string ffmpegpath = Path.Combine(Directory.GetCurrentDirectory(), "ffmpeg", "ffmpeg.exe");
            string filepath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", "meeting", id, filename);
            string thumbpath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", "meeting", id, filename.ToLower().Replace(Path.GetExtension(filename.ToLower()), "-thumb.jpg"));
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

        // DELETE: api/Meetings/5
        [HttpGet]
        [Route("Remove/{id}")]
        public async Task<ActionResult<MeetingDTO>> DeleteMeeting(string id)
        {
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));

            var meeting = await _context.Meetings.Include(t => t.Owner).FirstOrDefaultAsync(t =>
            t.PublicID == id && t.Owner.ID == member.ID);
            if (meeting == null)
            {
                return NotFound();
            }
            var meetingpath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", "meeting", meeting.PublicID);

            //if meeting path exist then delete the folder and its content
            if (Directory.Exists(meetingpath))
            {
                Directory.Delete(meetingpath, true);
            }
            var meetingmembers = _context.MeetingMembers.Where(t => t.Meeting.ID == meeting.ID);
            _context.MeetingMembers.RemoveRange(meetingmembers);
            _context.Meetings.Remove(meeting);

            await _context.SaveChangesAsync();

            return new MeetingDTO()
            {
                CreateDate = meeting.CreateDate,
                ID = meeting.PublicID,
                Name = meeting.Name,
                Owner = new MemberDTO(meeting.Owner),
                Purpose = meeting.Purpose
            };
        }

        private bool MeetingExists(int id)
        {
            return _context.Meetings.Any(e => e.ID == id);
        }
    }
}
