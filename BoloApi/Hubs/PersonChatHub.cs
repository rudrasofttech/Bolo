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
using System.Web;

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
            string encodedtext = HttpUtility.HtmlEncode(text);
            DateTime dt = DateTime.UtcNow;
            Guid d = Guid.NewGuid();
            _ = Clients.User(receiver).SendAsync("ReceiveTextMessage", sender, encodedtext, dt, d);
            await Clients.User(sender).SendAsync("MessageSent", receiver, encodedtext, dt, d);
            //check if sender and receiver are valid
            var msender = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(sender));
            var mreceiver = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(receiver));
            if (msender != null && mreceiver != null && !string.IsNullOrEmpty(text))
            {
                bool isContactSenderReceiver = _context.Contacts.Count(t => t.Owner.ID == msender.ID && t.Person.ID == mreceiver.ID) > 0 ? true : false;
                //if receiver is not in contact list of sender than add as temporary contact
                if (!isContactSenderReceiver)
                {
                    Contact c = new Contact() { BoloRelation = BoloRelationType.Temporary, CreateDate = DateTime.UtcNow, Owner = msender, Person = mreceiver };
                    _context.Contacts.Add(c);
                    await _context.SaveChangesAsync();
                    ContactDTO cdto = new ContactDTO(c);
                    cdto.RecentMessage = text;
                    cdto.RecentMessageDate = dt;
                    await Clients.User(sender).SendAsync("ContactSaved", cdto);
                }

                bool isContactReceiverSender = _context.Contacts.Count(t => t.Owner.ID == mreceiver.ID && t.Person.ID == msender.ID) > 0 ? true : false;
                //if sender in not in contact list of receiver than add as temporary conact
                if (!isContactReceiverSender)
                {
                    Contact c = new Contact() { BoloRelation = BoloRelationType.Temporary, CreateDate = DateTime.UtcNow, Owner = mreceiver, Person = msender };
                    _context.Contacts.Add(c);
                    await _context.SaveChangesAsync();
                    ContactDTO cdto = new ContactDTO(c);
                    cdto.RecentMessage = text;
                    cdto.RecentMessageDate = dt;
                    await Clients.User(receiver).SendAsync("ContactSaved", cdto);
                }

                MemberDTO recedto = new MemberDTO(mreceiver);
                if(recedto.Activity == ActivityStatus.Offline)
                {
                    //add to database here
                    ChatMessage cm = new ChatMessage() { 
                    Message = text,
                    MessageType= ChatMessageType.Text,
                    PublicID = d,
                    SentBy = msender,
                    SentDate = dt,
                    SentStatus = ChatMessageSentStatus.Sent,
                    SentTo = mreceiver
                    };
                    _context.ChatMessages.Add(cm);
                    await _context.SaveChangesAsync();
                }
            }
        }

        public async Task MessageStatus(string messageid, string sentby, string receivedby, int status)
        {
            //notify the sender of original message that it has been received
            await Clients.User(sentby).SendAsync("MessageStatus", messageid, receivedby, status);
        }

        public async Task SendSignal(object signal, string target, string sender)
        {
            //ReceiveSignal Who sent, data
            await Clients.User(target).SendAsync("ReceiveSignal", sender, signal);
        }

        /// <summary>
        /// One who initiates the call
        /// </summary>
        /// <param name="caller">Who initiated the call</param>
        /// <param name="callee">Who is suppose to answer</param>
        /// <returns></returns>
        public async Task SayHello(string caller, string callee)
        {
            //Notify callee that a call is initiated and its response is expected
            await Clients.User(callee).SendAsync("SaysHello", caller);
        }

        /// <summary>
        /// Answer an initated call
        /// </summary>
        /// <param name="initiater">Who initiated the call</param>
        /// <param name="responder">Who is answering the call</param>
        /// <returns></returns>
        public async Task AnswerHello(string initiater, string responder)
        {
            await Clients.User(initiater).SendAsync("AnswerHello", responder);
        }

        public async Task EndPeer(string caller, string callee)
        {
            await Clients.User(callee).SendAsync("EndPeer", caller);
        }

    }
}
