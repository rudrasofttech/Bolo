using Bolo.Data;
using Bolo.Hubs;
using Bolo.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BoloWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MeetingMessageController : ControllerBase
    {
        private readonly BoloContext _context;
        private readonly IConfiguration _config;
        private readonly IHubContext<PersonChatHub> _hubContext;

        public MeetingMessageController(BoloContext context, IConfiguration config, IHubContext<PersonChatHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
            _config = config;
        }

        // GET: api/<MeetingMessageController>
        [HttpGet]
        public IList<MeetingMessageDTO> Get([FromQuery] string mid)
        {
            var cmember = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
            var meeting = _context.Meetings.Include(t => t.Owner).FirstOrDefault(t => t.PublicID == mid);
            if (cmember == null || meeting == null)
            {
                return null;
            }
            else
            {
                var mm = _context.MeetingMembers.FirstOrDefault(t => t.Meeting.PublicID == mid && t.Member.ID == cmember.ID);
                if (mm == null && meeting.Owner.ID != cmember.ID)
                {
                    return null;
                }
                else
                {
                    var query = _context.MeetingMessages.Include(t => t.SentBy).Where(t => t.Meeting.ID == meeting.ID).OrderBy(t => t.SentDate);
                    List<MeetingMessageDTO> result = new List<MeetingMessageDTO>();
                    foreach(var temp in query)
                    {
                        result.Add(new MeetingMessageDTO() { ID = temp.ID, Message = temp.Message, SentBy = new MemberDTO(temp.SentBy), SentDate = temp.SentDate });
                    }
                    return result;
                }
            }
        }

        // GET api/<MeetingMessageController>/5
        [HttpGet("{id}")]
        public MeetingMessageDTO Get(Guid id, [FromQuery] string mid)
        {
            var cmember = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
            var meeting = _context.Meetings.FirstOrDefault(t => t.PublicID == mid);
            if (cmember == null || meeting == null)
            {
                return null;
            }
            else
            {
                var mm = _context.MeetingMembers.FirstOrDefault(t => t.Meeting.PublicID == mid && t.Member.ID == cmember.ID);
                if (mm == null)
                {
                    return null;
                }
                else
                {
                    var mmsg = _context.MeetingMessages.FirstOrDefault(t => t.ID == id);
                    if (mmsg == null)
                    {
                        return null;
                    }
                    else
                    {
                        return new MeetingMessageDTO() { ID = mmsg.ID, Message = mmsg.Message, SentBy = new MemberDTO(mmsg.SentBy), SentDate = mmsg.SentDate };
                    }
                }
            }
        }

        // POST api/<MeetingMessageController>
        [HttpPost]
        public ActionResult<MeetingMessageDTO> Post([FromBody] MeetingSendMessageDTO value)
        {
            string mid = value.meetingid;
            var sender = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
            if (sender != null)
            {
                var meeting = _context.Meetings.Include(t => t.Owner).FirstOrDefault(t => t.PublicID == mid);
                var meetingmember = _context.MeetingMembers.FirstOrDefault(t => t.Meeting.PublicID == mid && t.Member.ID == sender.ID && !(t.MemberType == MeetingMemberType.Blocked || t.MemberType == MeetingMemberType.Pending));
                //TODO: you can also check for blocked user here before saving the message
                if (meeting != null && (meetingmember != null || meeting.Owner.ID == sender.ID))
                {
                    MeetingMessage mm = new MeetingMessage()
                    {
                        Message = value.message,
                        ID = Guid.NewGuid(),
                        SentBy = sender,
                        SentDate = DateTime.UtcNow,
                        Meeting = meeting
                    };
                    _context.MeetingMessages.Add(mm);
                    _context.SaveChanges();
                    MeetingMessageDTO mmdto = new MeetingMessageDTO() { ID = mm.ID, Message = mm.Message, SentBy = new MemberDTO(mm.SentBy), SentDate = mm.SentDate };
                    _ = _hubContext.Clients.User(meeting.Owner.PublicID.ToString().ToLower()).SendAsync("ReceiveDiscussionMessage", meeting.PublicID, mmdto);
                    
                    var mmquery = _context.MeetingMembers.Include(t => t.Member).Where(t => t.Meeting.PublicID == mid && 
                    (t.MemberType != MeetingMemberType.Blocked && t.MemberType != MeetingMemberType.Pending));
                    foreach (MeetingMember mmem in mmquery)
                    {
                        _ = _hubContext.Clients.User(mmem.Member.PublicID.ToString().ToLower()).SendAsync("ReceiveDiscussionMessage", meeting.PublicID, mmdto);
                    }

                    return Ok(mmdto);
                }
                else
                {
                    return BadRequest("MeetingNotFound");
                }
            }
            else
            {
                return Unauthorized();
            }
        }


        // DELETE api/<MeetingMessageController>/5
        [HttpDelete("{id}")]
        public void Delete(Guid id, [FromQuery] string mid)
        {
            var cmember = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
            var meeting = _context.Meetings.FirstOrDefault(t => t.PublicID == mid);
            if (!(cmember == null || meeting == null))
            {
                var mm = _context.MeetingMembers.FirstOrDefault(t => t.Meeting.PublicID == mid && t.Member.ID == cmember.ID );
                var mmsg = _context.MeetingMessages.FirstOrDefault(t => t.ID == id);
                if (mm != null && mmsg != null)
                {   
                    if (mm.MemberType == MeetingMemberType.Admin || mmsg.SentBy.ID == cmember.ID)
                    {
                        _context.MeetingMessages.Remove(mmsg);
                        _context.SaveChanges();
                    }
                }
            }
        }
    }
}
