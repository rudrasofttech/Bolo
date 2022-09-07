using Bolo.Data;
using Bolo.Helper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Bolo.Hubs
{
    [Authorize]
    public class UniversalHub : Hub
    {
        private readonly BoloContext _context;


        public UniversalHub(BoloContext context)
        {
            _context = context;
        }

        public async Task NotifyPresence(Guid userid)
        {
            await Clients.OthersInGroup(Utility.UniversalGroup).SendAsync("NotifyPresence", userid);
        }

        public async Task JoinUniversalGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, Utility.UniversalGroup);
        }
    }
}
