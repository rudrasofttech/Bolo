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

namespace BoloWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DiscussionsController : ControllerBase
    {
        private readonly BoloContext _context;

        public DiscussionsController(BoloContext context)
        {
            _context = context;
        }

        // GET: api/Discussions
        [HttpGet]

        public async Task<ActionResult<List<DiscussionDTO>>> GetDiscussions()
        {
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
            {
                return NotFound();
            }

            var ownedm = _context.Discussions.Include(t => t.Owner).Where(t => t.Owner.ID == member.ID).Select(t => new DiscussionDTO()
            {
                CreateDate = t.CreateDate,
                ID = t.PublicID,
                Owner = new MemberDTO(t.Owner),
                Name = t.Name,
                Purpose = t.Purpose
            }).ToList<DiscussionDTO>();

            List<DiscussionDTO> meetings = new List<DiscussionDTO>();
            meetings.AddRange(ownedm);
            return meetings;
        }

        // GET: api/Discussions/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<DiscussionDTO>> GetDiscussion(string id)
        {
            var d = await _context.Discussions.Include(t => t.Owner).FirstOrDefaultAsync(t => t.PublicID.ToLower() == id.ToLower());

            if (d == null)
            {
                return NotFound();
            }
            else
            {
                DiscussionDTO result = new DiscussionDTO() { ID = d.PublicID, CreateDate = d.CreateDate, Name = d.Name, Purpose = d.Purpose };
                if (d.Owner != null)
                {
                    result.Owner = new MemberDTO(d.Owner);
                }
                return result;
            }
        }

        // PUT: api/Meetings/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDiscussion(int id, Discussion discussion)
        {
            if (id != discussion.ID)
            {
                return BadRequest();
            }

            _context.Entry(discussion).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DiscussionExists(id))
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

        // POST: api/Meetings
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult<DiscussionDTO>> PostMeeting(CreateDiscussionDTO m)
        {
            //remove unnamed meeting which are older than 48 hours
            var meetings = _context.Discussions.Where(t => t.Name == string.Empty && t.CreateDate < DateTime.Now.AddHours(-48));
            foreach (var meet in meetings)
            {
                _context.Discussions.Remove(meet);
                if (!string.IsNullOrEmpty(meet.PublicID))
                {
                    var meetingpath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", "discussion", meet.PublicID);
                    if (Directory.Exists(meetingpath))
                    {
                        Directory.Delete(meetingpath, true);
                    }
                }
            }
            _ = _context.SaveChangesAsync();

            Discussion discussion = new Discussion
            {
                CreateDate = DateTime.UtcNow,
                Status = RecordStatus.Active,
                Name = m.Name,
                Purpose = m.Purpose
            };
            if (User.Identity.IsAuthenticated)
            {
                discussion.Owner = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
            }
            else
            {
                discussion.Owner = null;
            }
            _context.Discussions.Add(discussion);
            await _context.SaveChangesAsync();

            string id = string.Format("{0}{1}{2}{3}{4}{5}{6}", discussion.ID, DateTime.Now.DayOfYear, DateTime.Now.Month, DateTime.Now.Hour, DateTime.Now.Day, DateTime.Now.Minute, DateTime.Now.Second);
            if (id.Length > 9)
            {
                id = id.Substring(0, 9);
            }
            //id = string.Format("{0}{1}{2}", id.Substring(0, 8), meeting.ID, id.Substring(8, 4));

            discussion.PublicID = id;
            await _context.SaveChangesAsync();

            DiscussionDTO result = new DiscussionDTO() { ID = discussion.PublicID, CreateDate = discussion.CreateDate, Name = discussion.Name, Purpose = discussion.Purpose };
            if (discussion.Owner != null)
            {
                result.Owner = new MemberDTO(discussion.Owner);
            }
            return result;
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("media/{id}")]
        public ActionResult GetMedia(string id, [FromQuery] string f)
        {
            var fpath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", "discussion", id, f);
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
        [Route("remove/{id}")]
        public async Task<ActionResult> RemoveMemberAsync(string id, [FromQuery] Guid member)
        {
            var d = await _context.Discussions.Include(t => t.Owner).FirstOrDefaultAsync(t => t.PublicID == id);
            if (d == null)
            {
                return NotFound();
            }
            //check if member is not owner of the meeting
            //owners cannot be removed from their meetings
            if (d.Owner.PublicID == member)
            {
                return BadRequest();
            }
            bool userHasAuthorityToBlock = false;
            //at first check if logged user is the owner of meeting
            if (d.Owner.PublicID == new Guid(User.Identity.Name))
            {
                userHasAuthorityToBlock = true;
            }
            //if not than check if user is admin of the meeting
            if (!userHasAuthorityToBlock)
            {
                var mm = await _context.DiscussionMembers.FirstOrDefaultAsync(t => t.Member.PublicID == new Guid(User.Identity.Name) && t.Relation == DiscussionRelationType.Admin && t.Discussion.PublicID == id);
                if (mm != null)
                {
                    userHasAuthorityToBlock = true;
                }
            }
            if (userHasAuthorityToBlock)
            {
                var mm2 = await _context.DiscussionMembers.FirstOrDefaultAsync(t => t.Member.PublicID == member && t.Discussion.PublicID == id);
                if (mm2 != null)
                {
                    _context.DiscussionMembers.Remove(mm2);
                    await _context.SaveChangesAsync();
                    return Ok();
                }
                else
                {
                    return BadRequest();
                }
            }

            return BadRequest();
        }

        [HttpGet]
        [Route("approve/{id}")]
        public async Task<ActionResult> ApproveMemberAsync(string id, [FromQuery] Guid member)
        {
            var d = await _context.Discussions.Include(t => t.Owner).FirstOrDefaultAsync(t => t.PublicID == id);
            if (d == null)
            {
                return NotFound();
            }
            //check if member is not owner of the meeting
            //owners cannot be removed from their meetings
            if (d.Owner.PublicID == member)
            {
                return BadRequest();
            }
            bool userHasAuthorityToApprove = false;
            //at first check if logged user is the owner of meeting
            if (d.Owner.PublicID == new Guid(User.Identity.Name))
            {
                userHasAuthorityToApprove = true;
            }
            //if not than check if user is admin of the meeting
            if (!userHasAuthorityToApprove)
            {
                var mm = await _context.DiscussionMembers.FirstOrDefaultAsync(t => t.Member.PublicID == new Guid(User.Identity.Name) && t.Relation == DiscussionRelationType.Admin && t.Discussion.PublicID == id);
                if (mm != null)
                {
                    userHasAuthorityToApprove = true;
                }
            }
            if (userHasAuthorityToApprove)
            {
                var mm2 = await _context.DiscussionMembers.FirstOrDefaultAsync(t => t.Member.PublicID == member && t.Discussion.PublicID == id);
                if (mm2 != null)
                {
                    mm2.Relation = DiscussionRelationType.Member;
                    await _context.SaveChangesAsync();
                    return Ok();
                }
                else
                {
                    return BadRequest();
                }
            }

            return BadRequest();
        }

        [HttpGet]
        [Route("join/{id}")]
        public async Task<ActionResult> JoinMeeting(string id)
        {
            var d = await _context.Discussions.Include(t => t.Owner).FirstOrDefaultAsync(t => t.PublicID == id);
            if (d == null)
            {
                return NotFound("Not Found");
            }
            var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            if (member == null)
            {
                return NotFound("Member Not Found");
            }
            var mm = await _context.DiscussionMembers.FirstOrDefaultAsync(t => t.Member.PublicID == new Guid(User.Identity.Name) && t.Discussion.PublicID == id);
            if (mm == null)
            {
                DiscussionMember mmnew = new DiscussionMember()
                {
                    CreateDate = DateTime.UtcNow,
                    Discussion = d,
                    Relation = DiscussionRelationType.Requested,
                    Member = member
                };
                _context.DiscussionMembers.Add(mmnew);
                await _context.SaveChangesAsync();

            }
            return Ok();
        }

        [HttpGet]
        [Route("DownloadChunk")]
        public ActionResult DownloadFile([FromQuery] string filename, [FromQuery] int position, [FromQuery] string id)
        {
            if (string.IsNullOrEmpty(filename))
            {
                return Ok(new { data = string.Empty, position = -1, length = -1 });
            }
            string filepath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", "discussion", id, filename);
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

            var discussionpath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", "discussion", meetingid);
            if (!Directory.Exists(discussionpath))
            {
                Directory.CreateDirectory(discussionpath);
            }
            var path = Path.Combine(discussionpath, filename);


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
            string filepath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", "discussion", id, filename);
            string thumbpath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", "discussion", id, filename.ToLower().Replace(Path.GetExtension(filename.ToLower()), "-thumb.jpg"));
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

        // DELETE: api/Discussions/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteDiscussion(string id)
        {
            var d = await _context.Discussions.FirstOrDefaultAsync(t => t.PublicID == id);
            if (d == null)
            {
                return NotFound();
            }
            var discussionpath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", "discussion", id);
            if (Directory.Exists(discussionpath))
            {
                Directory.Delete(discussionpath, true);
            }
            _context.Discussions.Remove(d);
            await _context.SaveChangesAsync();

            return Ok();
        }

        private bool DiscussionExists(int id)
        {
            return _context.Discussions.Any(e => e.ID == id);
        }
    }
}
