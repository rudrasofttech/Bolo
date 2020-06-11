using Bolo.Data;
using Bolo.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.Xml;
using System.Threading.Tasks;

namespace Bolo.Hubs
{
    [Authorize]
    public class PersonChatHub : Hub
    {
        private readonly BoloContext _context;

        public PersonChatHub(BoloContext context)
        {
            _context = context;
        }

        public async Task SendTextMessage(string receiver, string sender, string text)
        {
            DateTime dt = DateTime.UtcNow;
            Guid d = Guid.NewGuid();
            await Clients.User(receiver).SendAsync("ReceiveTextMessage", sender, text, dt, d);
            await Clients.User(sender).SendAsync("ReceiveTextMessage", sender, text, dt, d);
            //check if sender and receiver are valid
            var msender = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(sender));
            var mreceiver = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(receiver));
            if (msender != null && mreceiver != null && !string.IsNullOrEmpty(text))
            {
                //then try to save the message to database
                ChatMessage cm = new ChatMessage()
                {
                    Message = text,
                    MessageType = ChatMessageType.Text,
                    SentBy = msender,
                    SentDate = DateTime.UtcNow,
                    SentStatus = ChatMessageSentStatus.Sent,
                    SentTo = mreceiver,
                    PublicID = d
                };
                _context.ChatMessages.Add(cm);
                await _context.SaveChangesAsync();
                
            }
        }

        public async Task MessageReceived(string id, string to)
        {
            //notify the sender of original message that it has been received
            await Clients.User(to).SendAsync("MessageDelivered", id);
            //try to remove message from data base,
            //we do not keep copy of the message
            //Guid g;
            //if (Guid.TryParse(id, out g))
            //{
            //    var cm = _context.ChatMessages.FirstOrDefault(t => t.PublicID == g);
            //    if (cm != null)
            //    {
            //        _context.ChatMessages.Remove(cm);
            //        await _context.SaveChangesAsync();
            //    }
            //}
        }
    }
}
