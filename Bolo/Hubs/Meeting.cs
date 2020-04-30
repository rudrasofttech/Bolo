using Bolo.Models;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Bolo.Hubs
{
    public class MeetingHub : Hub
    {
        public async Task JoinMeeting(string room, string name)
        {
             await Groups.AddToGroupAsync(Context.ConnectionId, room);
            UserInfo ui = new UserInfo() { ConnectionID = Context.ConnectionId, Name =  name, MemberID = Context.User.Identity.IsAuthenticated ? 
                Context.User.Identity.Name : Guid.Empty.ToString() };
            await Clients.Client(Context.ConnectionId).SendAsync("SetMyself", ui);
            await Clients.OthersInGroup(room).SendAsync("NewUserArrived", ui);
            
        }

        public async Task UpdateName(string room, string name) {
            await Clients.Group(room).SendAsync("UpdateName", Context.ConnectionId, name);
        }

        public async Task LeaveMeeting(string room)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, room);
            await Clients.OthersInGroup(room).SendAsync("UserLeft", Context.ConnectionId);
        }


        public async Task HelloUser(string room, UserInfo Sender, string target)
        {
            await Clients.Client(target).SendAsync("UserSaidHello", Sender);
        }

        public async Task SendTextMessage(string room, UserInfo sender, string text)
        {
            await Clients.Group(room).SendAsync("ReceiveTextMessage", sender, text, DateTime.UtcNow);
        }

        public async Task Test(string t)
        {
            await Clients.Caller.SendAsync("Test", t);
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            return base.OnDisconnectedAsync(exception);
        }

        //public async Task SendSignal(string signal, string cid)
        //{
        //    await Clients.Client(cid).SendAsync("SendSignal", Context.ConnectionId, signal);
        //}

    }
}
