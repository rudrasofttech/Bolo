using Bolo.Data;
using Bolo.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Bolo.Hubs
{
    [Authorize]
    public class BroadcastHub : Hub
    {
        //private readonly BoloContext _context;
        public BroadcastHub(BoloContext context)
        {
            //_context = context;
        }
        public async Task StartBroadcast(string room)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, room);
            //This client function will set User detail in browser memory.
            await Clients.Client(Context.ConnectionId).SendAsync("SetConnectionID", Context.ConnectionId);
        }

        public async Task JoinBroadcast(string room, string userid, string name,bool peercapable)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, room);

            await Clients.OthersInGroup(room).SendAsync("ViewerJoined", Context.ConnectionId, name, peercapable);
        }

        public async Task HelloUser(string room, string Sender, string target)
        {
            await Clients.Client(target).SendAsync("BroadcasterSentHello", Context.ConnectionId);
        }

        public async Task SendSignal(object signal, string sender, string target, string room)
        {
            if (!string.IsNullOrEmpty(room))
            {
                //ReceiveSignal Who sent, data
                await Clients.Client(target).SendAsync("ReceiveSignal", Context.ConnectionId, signal);
            }
        }

        public async Task SendPulse(string room, string target)
        {
            await Clients.Client(target).SendAsync("ReceivePulse", Context.ConnectionId);
        }

        public async Task SendTextMessage(string room, UserInfo sender,  string text)
        {
            await Clients.Group(room).SendAsync("ReceiveTextMessage", sender, text, DateTime.UtcNow);
        }
    }
}
