using Bolo.Data;
using Bolo.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace BoloWeb.Helper
{
    public class PostHelper
    {
        private readonly BoloContext _context;
        
        public PostHelper(BoloContext context)
        {
            _context = context;
        }
    }
}
