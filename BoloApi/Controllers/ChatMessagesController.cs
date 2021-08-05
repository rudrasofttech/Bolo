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
using System.Security.AccessControl;
using Microsoft.AspNetCore.SignalR;
using Bolo.Hubs;
using System.IO;
using Bolo.Helper;
using Microsoft.Extensions.Configuration;

namespace Bolo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatMessagesController : ControllerBase
    {
        private readonly BoloContext _context;
        private readonly IConfiguration _config;
        private readonly IHubContext<PersonChatHub> _hubContext;
        public ChatMessagesController(BoloContext context, IConfiguration config, IHubContext<PersonChatHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
            _config = config;
        }

        // GET: api/ChatMessages
        [HttpGet]
        public ActionResult<List<ChatMessageDTO>> GetChatMessages([FromQuery] Guid sender)
        {
            List<ChatMessageDTO> result = new List<ChatMessageDTO>();
            var member = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
            var query = _context.ChatMessages.Where(t => 
            (t.SentBy.PublicID == sender && t.SentTo.PublicID == member.PublicID) || 
            (t.SentBy.PublicID == member.PublicID && t.SentTo.PublicID == sender))
                .Include(t => t.SentBy).Include(t => t.SentTo).OrderBy(t => t.SentDate);
            foreach(ChatMessage cm in query)
            {
                ChatMessageDTO cmdto = new ChatMessageDTO(cm);
                cmdto.SentBy.Bio = "";
                cmdto.SentBy.Pic = "";
                cmdto.SentBy.ThoughtStatus = "";

                result.Add(cmdto);
            }

            return result;
        }

        // GET: api/ChatMessages/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ChatMessage>> GetChatMessage(int id)
        {
            var chatMessage = await _context.ChatMessages.FindAsync(id);

            if (chatMessage == null)
            {
                return NotFound();
            }

            return chatMessage;
        }

        [HttpGet()]
        [Route("SentMessages")]
        public ActionResult<IEnumerable<ChatMessageDTO>> GetSentChatMessages([FromQuery] Guid sender)
        {
            var chatMessages = _context.ChatMessages.Include(t => t.SentBy).Include(m => m.SentTo).Where(t => t.SentBy.PublicID == sender && t.SentTo.PublicID == new Guid(User.Identity.Name) && t.SentStatus == ChatMessageSentStatus.Sent).OrderByDescending(t => t.ID);

            if (chatMessages == null)
            {
                return NotFound();
            }
            List<ChatMessageDTO> result = new List<ChatMessageDTO>();
            foreach (ChatMessage cm in chatMessages)
            {
                result.Add(new ChatMessageDTO(cm));
            }

            return result;
        }

        [HttpGet()]
        [Route("SetReceived")]
        public async Task<ActionResult> SetReceivedAsync([FromQuery] Guid mid)
        {
            var cm = await _context.ChatMessages.Include(t => t.SentBy).Include(m => m.SentTo).FirstOrDefaultAsync(t => t.SentTo.PublicID == new Guid(User.Identity.Name) && t.PublicID == mid);
            if (cm == null)
            {
                return NotFound();
            }
            if (cm.SentStatus == ChatMessageSentStatus.Sent)
            {
                cm.SentStatus = ChatMessageSentStatus.Received;
                await _context.SaveChangesAsync();
                _ = _hubContext.Clients.User(cm.SentBy.PublicID.ToString().ToLower()).SendAsync("MessageStatus", mid, cm.SentTo.PublicID.ToString().ToLower(), ChatMessageSentStatus.Received);
            }

            return Ok();
        }

        [HttpGet()]
        [Route("SetSeen")]
        public async Task<ActionResult> SetSeenAsync([FromQuery] Guid mid)
        {
            var cm = await _context.ChatMessages.Include(t => t.SentBy).Include(m => m.SentTo).FirstOrDefaultAsync(t => t.SentTo.PublicID == new Guid(User.Identity.Name) && t.PublicID == mid);
            if (cm == null)
            {
                return NotFound();
            }

            cm.SentStatus = ChatMessageSentStatus.Seen;
            await _context.SaveChangesAsync();
            _ = _hubContext.Clients.User(cm.SentBy.PublicID.ToString().ToLower()).SendAsync("MessageStatus", mid, cm.SentTo.PublicID.ToString().ToLower(), ChatMessageSentStatus.Seen);
            return Ok();
        }


        // POST: api/ChatMessages
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPost]
        public async Task<ActionResult<ChatMessageDTO>> PostChatMessage([FromForm] ChatMessagePostDTO chatMessage)
        {
            var sender = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
            if (sender != null)
            {
                var receiver = _context.Members.FirstOrDefault(t => t.PublicID == chatMessage.SentTo);
                //TODO: you can also check for blocked user here before saving the message
                if (receiver != null)
                {
                    Contact c = await _context.Contacts.FirstOrDefaultAsync(t => t.Owner.ID == sender.ID && t.Person.ID == receiver.ID);
                    //if receiver is not in contact list of sender than add as temporary contact
                    if (c == null)
                    {
                        c = new Contact()
                        {
                            BoloRelation = BoloRelationType.Confirmed,
                            CreateDate = DateTime.UtcNow,
                            Owner = sender,
                            Person = receiver
                        };
                        _context.Contacts.Add(c);
                        await _context.SaveChangesAsync();
                        ContactDTO cdto = new ContactDTO(c)
                        {
                            RecentMessage = chatMessage.Text,
                            RecentMessageDate = DateTime.UtcNow
                        };
                        _ = _hubContext.Clients.User(sender.PublicID.ToString().ToLower()).SendAsync("ContactSaved", cdto);
                    }
                    

                    Contact c2 = await _context.Contacts.FirstOrDefaultAsync(t => t.Owner.ID == receiver.ID && t.Person.ID == sender.ID);
                    //if sender in not in contact list of receiver than add as temporary contact
                    if (c2 == null)
                    {
                        c2 = new Contact() { BoloRelation = BoloRelationType.Temporary, CreateDate = DateTime.UtcNow, Owner = receiver, Person = sender };
                        _context.Contacts.Add(c2);
                        await _context.SaveChangesAsync();
                        ContactDTO cdto = new ContactDTO(c2)
                        {
                            RecentMessage = chatMessage.Text,
                            RecentMessageDate = DateTime.UtcNow
                        };
                        _ = _hubContext.Clients.User(receiver.PublicID.ToString().ToLower()).SendAsync("ContactSaved", cdto);
                    }

                    ChatMessage cm = new ChatMessage()
                    {
                        Message = chatMessage.Text,
                        MessageType = ChatMessageType.Text,
                        PublicID = chatMessage.PublicID != Guid.Empty ? chatMessage.PublicID : Guid.NewGuid(),
                        SentBy = sender,
                        SentDate = DateTime.UtcNow,
                        SentStatus = ChatMessageSentStatus.Sent,
                        SentTo = receiver
                    };
                    //send and save this message only if receiver has not blocked you
                    if (c2.BoloRelation != BoloRelationType.Blocked)
                    {
                        _context.ChatMessages.Add(cm);
                        await _context.SaveChangesAsync();
                        _ = _hubContext.Clients.User(receiver.PublicID.ToString().ToLower()).SendAsync("ReceiveTextMessage", sender.PublicID.ToString().ToLower(), cm.Message, cm.SentDate, cm.PublicID);

                        MemberDTO recedto = new MemberDTO(receiver);
                        if (recedto.Activity == ActivityStatus.Offline || recedto.Activity == ActivityStatus.Meeting)
                        {
                            string email = System.IO.File.ReadAllText(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "emails", "newmessage.html"));
                            email = email.Replace("{sender}", sender.Name).Replace("{message}", cm.Message);
                            EmailUtility eu = new EmailUtility(_config);
                            eu.SendEmail(receiver.Email, receiver.Name, sender.Email, sender.Name, String.Format("{0} sent a message on Waarta.", sender.Name), email);
                        }
                    }
                    return Ok(new ChatMessageDTO(cm));
                }
                else
                {
                    return BadRequest("UserNotFound");
                }
            }
            else
            {
                return Unauthorized();
            }
        }

        [HttpPost]
        [Route("MemberMessages/{id}")]
        public async Task<ActionResult> DeleteMemberMessages(Guid id)
        {
            var msgs = await _context.ChatMessages.Where(t => t.SentBy.PublicID == id && t.SentTo.PublicID == new Guid(User.Identity.Name)).ToListAsync();
            _context.ChatMessages.RemoveRange(msgs);
            await _context.SaveChangesAsync();

            return Ok();

        }

        // DELETE: api/ChatMessages/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<ChatMessage>> DeleteChatMessage(int id)
        {
            var chatMessage = await _context.ChatMessages.FindAsync(id);
            if (chatMessage == null)
            {
                return NotFound();
            }

            _context.ChatMessages.Remove(chatMessage);
            await _context.SaveChangesAsync();

            return chatMessage;
        }

        //private bool ChatMessageExists(int id)
        //{
        //    return _context.ChatMessages.Any(e => e.ID == id);
        //}
    }
}
