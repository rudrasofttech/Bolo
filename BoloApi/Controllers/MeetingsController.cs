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

namespace Bolo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MeetingsController : ControllerBase
    {
        private readonly BoloContext _context;

        public MeetingsController(BoloContext context)
        {
            _context = context;
        }

        // GET: api/Meetings
        [HttpGet]

        public async Task<ActionResult<IEnumerable<Meeting>>> GetMeetings()
        {
            return await _context.Meetings.ToListAsync();
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
                MeetingDTO result = new MeetingDTO() { ID = meeting.PublicID, CreateDate = meeting.CreateDate, Name = meeting.Name, Purpose = meeting.Purpose };
                if (meeting.Owner != null)
                {
                    result.Owner = new MemberDTO(meeting.Owner);
                }
                return result;
            }

            
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

        // POST: api/Meetings
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult<MeetingDTO>> PostMeeting(CreateMeetingDTO m)
        {
            Meeting meeting = new Meeting
            {
                CreateDate = DateTime.UtcNow,
                Status = RecordStatus.Active,
                Name = m.Name,
                Purpose = m.Purpose
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
            string id = Guid.NewGuid().ToString().Replace("-", "");
            id = string.Format("{0}{1}{2}", id.Substring(0, 8), meeting.ID, id.Substring(8, 4));
            meeting.PublicID = id;
            await _context.SaveChangesAsync();

            MeetingDTO result = new MeetingDTO() { ID = meeting.PublicID, CreateDate = meeting.CreateDate, Name = meeting.Name, Purpose = meeting.Purpose };
            if (meeting.Owner != null)
            {
                result.Owner = new MemberDTO(meeting.Owner);
            }
            return result;
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("media/{id}")]
        public ActionResult GetMedia(string id,[FromQuery]string f)
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
        public ActionResult DownloadFile([FromQuery] string filename, [FromQuery] int position, [FromQuery]string id)
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
        public ActionResult GenerateThumbnail([FromQuery] string filename, [FromQuery]string id)
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
        [HttpDelete("{id}")]
        public async Task<ActionResult<Meeting>> DeleteMeeting(int id)
        {
            var meeting = await _context.Meetings.FindAsync(id);
            if (meeting == null)
            {
                return NotFound();
            }

            _context.Meetings.Remove(meeting);
            await _context.SaveChangesAsync();

            return meeting;
        }

        private bool MeetingExists(int id)
        {
            return _context.Meetings.Any(e => e.ID == id);
        }
    }
}
