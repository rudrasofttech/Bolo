﻿using System;
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
        public async Task<ActionResult<Meeting>> GetMeeting(string id)
        {
            var meeting = await _context.Meetings.FirstOrDefaultAsync(t => t.PublicID.ToLower() == id.ToLower());

            if (meeting == null)
            {
                return NotFound();
            }

            return meeting;
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
        public async Task<ActionResult> PostMeeting(CreateMeetingDTO m)
        {
            Meeting meeting = new Meeting();
            meeting.CreateDate = DateTime.UtcNow;
            meeting.Status = RecordStatus.Active;
            meeting.Name = m.Name;
            meeting.Purpose = m.Purpose;
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
            return Ok(new { id = meeting.PublicID });
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


            string[] arr = f.Split(";base64,");
            if (arr.Length == 2)
            {
                //byte[] barr = br.ReadBytes((int)stream.Length);
                byte[] barr = Convert.FromBase64String(arr[1]);
                if (System.IO.File.Exists(path))
                {
                    using (FileStream fs = new FileStream(path, FileMode.Append))
                    {
                        fs.Write(barr, 0, barr.Length);
                    }
                }
                else
                {
                    using (FileStream fs = new FileStream(path, FileMode.OpenOrCreate))
                    {
                        fs.Write(barr, 0, barr.Length);
                    }
                }
            }


            return Ok(new { filename = filename });
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
