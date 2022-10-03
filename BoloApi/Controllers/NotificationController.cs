using Bolo.Data;
using Bolo.Helper;
using Bolo.Hubs;
using Bolo.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BoloWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly BoloContext _context;
        private readonly IConfiguration _config;
        private readonly IHubContext<UniversalHub> _hubContext;
        private NotificationHelper nhelper;
        public NotificationController(BoloContext context, IConfiguration config, IHubContext<UniversalHub> hubContext)
        {
            _context = context;
            _config = config;
            _hubContext = hubContext;
            nhelper = new NotificationHelper(context, hubContext);
        }

        [HttpGet]
        [Route("setseen/{id}")]
        public async Task<ActionResult<IActionResult>> SetSeenAsync(Guid id)
        {
            Member currentMember = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            nhelper.SetSeen(id, currentMember);
            return Ok();
        }

        [HttpGet]
        [Route("setseenall")]
        public ActionResult SetSeenAll()
        {
            Member currentMember = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
            nhelper.SetSeen(currentMember);
            return Ok();
        }

        [HttpGet]
        public async Task<NotificationListPaged> GetAsync()
        {
            NotificationListPaged model = new NotificationListPaged();
            Member currentMember = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            nhelper.TargetUser = currentMember;
            model.Notifications.AddRange(nhelper.GetNotifications().Select(t => new NotificationSmallDTO(t)).ToList());
            model.PageSize = 10000;
            model.Total = model.Notifications.Count();
            model.Current = 0;

            return model;
        }
    }
}
