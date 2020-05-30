using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Bolo.Hubs
{
    public class StreamHub : Hub
    {
        public Task SendImage(string img)
        {
            return Clients.Others.SendAsync("ReceiveImage", img, Context.ConnectionId);
        }
    }
}
