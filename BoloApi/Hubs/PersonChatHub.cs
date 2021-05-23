using Bolo.Data;
using Bolo.Helper;
using Bolo.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
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

        /// <summary>
        /// Use this function in client which do have capability to genereate messageids
        /// </summary>
        /// <param name="receiver"></param>
        /// <param name="sender"></param>
        /// <param name="text"></param>
        /// <returns></returns>
        public async Task SendTextMessage(string receiver, string sender, string text)
        {
            DateTime dt = DateTime.UtcNow;
            Guid d = Guid.NewGuid();
            _ = Clients.User(receiver).SendAsync("ReceiveTextMessage", sender, text, dt, d);
            await Clients.User(sender).SendAsync("MessageSent", receiver, text, dt, d);
            SendMessage(new Guid(receiver), new Guid(sender), text, d, dt);
        }

        public void SendTextMessageWithID(string receiver, string sender, string text, string id)
        {
            DateTime dt = DateTime.UtcNow;
            _ = Clients.User(receiver).SendAsync("ReceiveTextMessage", sender, text, dt, new Guid(id));
            _ = Clients.User(sender).SendAsync("MessageSent", receiver, text, dt, new Guid(id) );
            SendMessage(new Guid(receiver), new Guid(sender), text, new Guid(id), dt);
        }

        /// <summary>
        /// Create contact and save message in db if receiver is offline
        /// </summary>
        /// <param name="receiver"></param>
        /// <param name="sender"></param>
        /// <param name="text"></param>
        /// <param name="id"></param>
        /// <param name="dt"></param>
        private async void SendMessage(Guid receiver, Guid sender, string text, Guid id, DateTime dt)
        {
            //check if sender and receiver are valid
            var msender = _context.Members.FirstOrDefault(t => t.PublicID == sender);
            var mreceiver = _context.Members.FirstOrDefault(t => t.PublicID == receiver);
            if (msender != null && mreceiver != null && !string.IsNullOrEmpty(text))
            {
                bool isContactSenderReceiver = _context.Contacts.Count(t => t.Owner.ID == msender.ID && t.Person.ID == mreceiver.ID) > 0;
                //if receiver is not in contact list of sender than add as temporary contact
                if (!isContactSenderReceiver)
                {
                    Contact c = new Contact() { BoloRelation = BoloRelationType.Temporary, CreateDate = DateTime.UtcNow, Owner = msender, Person = mreceiver };
                    _context.Contacts.Add(c);
                    await _context.SaveChangesAsync();
                    ContactDTO cdto = new ContactDTO(c)
                    {
                        RecentMessage = text,
                        RecentMessageDate = dt
                    };
                    await Clients.User(sender.ToString().ToLower()).SendAsync("ContactSaved", cdto);
                }

                bool isContactReceiverSender = _context.Contacts.Count(t => t.Owner.ID == mreceiver.ID && t.Person.ID == msender.ID) > 0;
                //if sender in not in contact list of receiver than add as temporary conact
                if (!isContactReceiverSender)
                {
                    Contact c = new Contact() { BoloRelation = BoloRelationType.Temporary, CreateDate = DateTime.UtcNow, Owner = mreceiver, Person = msender };
                    _context.Contacts.Add(c);
                    await _context.SaveChangesAsync();
                    ContactDTO cdto = new ContactDTO(c)
                    {
                        RecentMessage = text,
                        RecentMessageDate = dt
                    };
                    await Clients.User(receiver.ToString().ToLower()).SendAsync("ContactSaved", cdto);
                }

                MemberDTO recedto = new MemberDTO(mreceiver);
                if (recedto.Activity == ActivityStatus.Offline || recedto.Activity == ActivityStatus.Meeting)
                {
                    //add to database here
                    ChatMessage cm = new ChatMessage()
                    {
                        Message = text,
                        MessageType = ChatMessageType.Text,
                        PublicID = id,
                        SentBy = msender,
                        SentDate = dt,
                        SentStatus = ChatMessageSentStatus.Sent,
                        SentTo = mreceiver
                    };
                    _context.ChatMessages.Add(cm);
                    await _context.SaveChangesAsync();
                    string email = File.ReadAllText(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "emails", "newmessage.html"));
                    
                    //Utility.SendEmail(mreceiver.Email, mreceiver.Name, msender.Email, msender.Name, String.Format("{0} sent a message on Waarta.", msender.Name), email);
                }
            }
        }

        //public async Task MessageStatus(string messageid, string sentby, string receivedby, int status)
        //{
        //    var cm = _context.ChatMessages.FirstOrDefault(t => t.PublicID == new Guid(messageid));
        //    if(cm != null)
        //    {
        //        cm.SentStatus = ChatMessageSentStatus.Received;
        //        await _context.SaveChangesAsync();
        //    }
        //    //notify the sender of original message that it has been received
        //    await Clients.User(sentby).SendAsync("MessageStatus", messageid, receivedby, status);
        //}

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
