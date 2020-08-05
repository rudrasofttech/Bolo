using Bolo.Data;
using Bolo.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using System.Web;

namespace Bolo.Hubs
{
    //[Authorize]
    public class MeetingHub : Hub
    {
        private readonly BoloContext _context;

        public MeetingHub(BoloContext context)
        {
            _context = context;
        }
        /// <summary>
        /// First server function that any client should invoke to join the meeting
        /// </summary>
        /// <param name="room">Unique Meeting ID</param>
        /// <param name="name">Member Name</param>
        /// <returns>It will invoke SetMySelf function on the client, so that client can set itself</returns>
        public async Task JoinMeeting(string room, string name)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, room);
            UserInfo ui = new UserInfo()
            {
                ConnectionID = string.Empty, //Context.ConnectionId,
                Name = name,
                MemberID = Context.User.Identity.IsAuthenticated ?
                Context.User.Identity.Name : Guid.Empty.ToString()
            };
            //This client function will set User detail in browser memory.
            await Clients.Client(Context.ConnectionId).SendAsync("SetMyself", ui);
            
        }

        /// <summary>
        /// Once JoinMeeting is called and SetMySelf is executed on the client 
        /// its time to Notify others on the users presence in meeting. Client will 
        /// invoke this server function to notify other member of meeting of his/her presence
        /// </summary>
        /// <param name="room">Unique Meeting ID</param>
        /// <param name="name">Member Name</param>
        /// <returns>It will call NewUserArrived function on all client in the group except self.</returns>
        public async Task NotifyPresence(string room, UserInfo u)
        {
            UserInfo ui = new UserInfo()
            {
                ConnectionID = string.Empty, //Context.ConnectionId,
                Name = u.Name,
                VideoCapable = u.VideoCapable,
                PeerCapable = u.PeerCapable,
                MemberID = u.MemberID,
                Pic = u.Pic
            };
            await Clients.OthersInGroup(room).SendAsync("NewUserArrived", ui);
        }

        /// <summary>
        /// As name suggest this server function notifies the whole group that a particular 
        /// member has changed name in meeting
        /// </summary>
        /// <param name="room"></param>
        /// <param name="name"></param>
        /// <returns></returns>
        public async Task UpdateUser(string room, UserInfo u)
        {
            await Clients.Group(room).SendAsync("UpdateUser", u);
        }

        public async Task NotifyAction(string room, UserInfo u, string action)
        {
            await Clients.OthersInGroup(room).SendAsync("ReceiveActionNotification", u, action);
        }

        /// <summary>
        /// This server function will remove a member from meeting and let other client 
        /// know that a user has left
        /// </summary>
        /// <param name="room"></param>
        /// <returns></returns>
        public async Task LeaveMeeting(string room, string memberid)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, room);
            await Clients.OthersInGroup(room).SendAsync("UserLeft", memberid);
            if (Context.User.Identity.IsAuthenticated)
            {
                Member m = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(Context.User.Identity.Name));
                if (m != null)
                {
                    m.Activity = ActivityStatus.Online;
                    await _context.SaveChangesAsync();
                }
            }
        }


        /// <summary>
        /// This server function is invoked by a member to notify a particular client that they are already present.
        /// It should be called on the client after the execution of NewUserArrived function.
        /// </summary>
        /// <param name="room"></param>
        /// <param name="Sender"></param>
        /// <param name="target"></param>
        /// <returns></returns>
        public async Task HelloUser(string room, UserInfo Sender, UserInfo Receiver)
        {
            //await Clients.Client(target).SendAsync("UserSaidHello", Sender);
            await Clients.Group(room).SendAsync("UserSaidHello", Sender, Receiver);
        }

        /// <summary>
        /// Function is relays a text message to other member of the group
        /// </summary>
        /// <param name="room"></param>
        /// <param name="sender"></param>
        /// <param name="text"></param>
        /// <returns></returns>
        public async Task SendTextMessage(string room, UserInfo sender, string text)
        {
            await Clients.Group(room).SendAsync("ReceiveTextMessage", sender, text, DateTime.UtcNow);
        }

        public async Task SendTextMessageWithID(string room, UserInfo sender, string text, Guid Id)
        {
            await Clients.OthersInGroup(room).SendAsync("ReceiveTextMessage", sender, text, DateTime.UtcNow);
        }


        public override Task OnDisconnectedAsync(Exception exception)
        {
            return base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// Function is used to relay SimplePeer(WebRTC Plugin) data between peers.
        /// </summary>
        /// <param name="signal">Data generated by a peer object</param>
        /// <param name="target">Connection ID to where to send the data</param>
        /// <param name="sender">Who is sending the data</param>
        /// <param name="room">Meeting ID</param>
        /// <returns></returns>
        public async Task SendSignal(object signal, string target, UserInfo sender, string room)
        {
            
                //ReceiveSignal Who sent, data
                await Clients.Group(room).SendAsync("ReceiveSignal", target, sender, signal);
            
        }

        /// <summary>
        /// This function should be called by each client in meeting at regular interval to notify other of their presence.
        /// </summary>
        /// <param name="room">Meeting ID</param>
        /// <returns></returns>
        public async Task SendPulse(string room, string sender)
        {
            await Clients.OthersInGroup(room).SendAsync("ReceivePulse", sender);
        }

    }
}
