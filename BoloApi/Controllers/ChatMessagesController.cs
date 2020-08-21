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

namespace Bolo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatMessagesController : ControllerBase
    {
        private readonly BoloContext _context;
        private readonly IHubContext<PersonChatHub> _hubContext;
        public ChatMessagesController(BoloContext context, IHubContext<PersonChatHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        // GET: api/ChatMessages
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ChatMessage>>> GetChatMessages()
        {
            return await _context.ChatMessages.ToListAsync();
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

        // POST: api/ChatMessages
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPost]
        public async Task<ActionResult<ChatMessageDTO>> PostChatMessage([FromForm] ChatMessagePostDTO chatMessage)
        {
            var sender = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
            if(sender != null)
            {
                var receiver = _context.Members.FirstOrDefault(t => t.PublicID == chatMessage.SentTo);
                //TODO: you can also check for blocked user here before saveing the message
                if(receiver != null)
                {
                    bool isContactSenderReceiver = _context.Contacts.Count(t => t.Owner.ID == sender.ID && t.Person.ID == receiver.ID) > 0;
                    //if receiver is not in contact list of sender than add as temporary contact
                    if (!isContactSenderReceiver)
                    {
                        Contact c = new Contact() { BoloRelation = BoloRelationType.Temporary, 
                            CreateDate = DateTime.UtcNow, 
                            Owner = sender, Person = receiver };
                        _context.Contacts.Add(c);
                        await _context.SaveChangesAsync();
                        ContactDTO cdto = new ContactDTO(c)
                        {
                            RecentMessage = chatMessage.Text,
                            RecentMessageDate = DateTime.UtcNow
                        };
                        _ = _hubContext.Clients.User(sender.PublicID.ToString().ToLower()).SendAsync("ContactSaved", cdto);
                        //await Clients.User(sender.ToString().ToLower()).SendAsync("ContactSaved", cdto);
                    }

                    bool isContactReceiverSender = _context.Contacts.Count(t => t.Owner.ID == receiver.ID && t.Person.ID == sender.ID) > 0;
                    //if sender in not in contact list of receiver than add as temporary conact
                    if (!isContactReceiverSender)
                    {
                        Contact c = new Contact() { BoloRelation = BoloRelationType.Temporary, CreateDate = DateTime.UtcNow, Owner = receiver, Person = sender };
                        _context.Contacts.Add(c);
                        await _context.SaveChangesAsync();
                        ContactDTO cdto = new ContactDTO(c)
                        {
                            RecentMessage = chatMessage.Text,
                            RecentMessageDate = DateTime.UtcNow
                        };
                        _ = _hubContext.Clients.User(receiver.PublicID.ToString().ToLower()).SendAsync("ContactSaved", cdto);
                        //await Clients.User(receiver.ToString().ToLower()).SendAsync("ContactSaved", cdto);
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
                    _context.ChatMessages.Add(cm);
                    await _context.SaveChangesAsync();
                    _ = _hubContext.Clients.User(receiver.PublicID.ToString().ToLower()).SendAsync("ReceiveTextMessage", sender.PublicID.ToString().ToLower(), cm.Message, cm.SentDate, cm.PublicID);

                    MemberDTO recedto = new MemberDTO(receiver);
                    if (recedto.Activity == ActivityStatus.Offline || recedto.Activity == ActivityStatus.Meeting)
                    {
                        string email = System.IO.File.ReadAllText(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "emails", "newmessage.html"));
                        Utility.SendEmail(receiver.Email, receiver.Name, sender.Email, sender.Name, String.Format("{0} sent a message on Waarta.", sender.Name), email);
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
