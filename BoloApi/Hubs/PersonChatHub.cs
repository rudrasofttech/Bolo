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
                bool iscontact = _context.Contacts.Count(t => t.Owner.ID == msender.ID && t.Person.ID == mreceiver.ID) > 0 ? true : false;
                //if receiver is not in contact list than add as contact
                if (!iscontact)
                {
                    Contact c = new Contact() { BoloRelation = BoloRelationType.Temporary, CreateDate = DateTime.UtcNow, Owner = msender, Person = mreceiver };
                    _context.Contacts.Add(c);
                    await _context.SaveChangesAsync();
                    ContactDTO cdto = new ContactDTO()
                    {
                        ID = c.ID,
                        BoloRelation = BoloRelationType.Temporary,
                        CreateDate = c.CreateDate,
                        Person = new MemberDTO()
                        {
                            ID = c.Person.PublicID,
                            Name = c.Person.Name,
                            ChannelName = string.IsNullOrEmpty(c.Person.Channelname) ? "" : c.Person.Channelname.ToLower(),
                            Bio = string.IsNullOrEmpty(c.Person.Bio) ? "" : c.Person.Bio,
                            BirthYear = c.Person.BirthYear,
                            Gender = c.Person.Gender,
                            Activity = c.Person.Activity,
                            Visibility = c.Person.Visibility,
                            Pic = string.IsNullOrEmpty(c.Person.Pic) ? "" : c.Person.Pic,
                            Country = string.IsNullOrEmpty(c.Person.Country) ? "" : c.Person.Country,
                            State = string.IsNullOrEmpty(c.Person.State) ? "" : c.Person.State,
                            City = string.IsNullOrEmpty(c.Person.City) ? "" : c.Person.City,
                            ThoughtStatus = string.IsNullOrEmpty(c.Person.ThoughtStatus) ? "" : c.Person.ThoughtStatus
                        },
                        RecentMessage = text,
                        RecentMessageDate = dt
                    };
                    await Clients.User(sender).SendAsync("ContactSaved", cdto);
                }
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
