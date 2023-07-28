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

namespace BoloWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class IgnoredController : ControllerBase
    {
        private readonly BoloContext _context;
        private readonly NotificationHelper nhelper;

        public IgnoredController(BoloContext context, IHubContext<UniversalHub> uhub, IConfiguration config)
        {
            _context = context;
            nhelper = new NotificationHelper(context, uhub, config);
        }

        [HttpGet]
        public List<MemberSmallDTO> Get([FromQuery]string q = "")
        {
            var currentMember = _context.Members.First(t => t.PublicID == new Guid(User.Identity.Name));
            var query = _context.IgnoredMembers.Where(t => t.User.ID == currentMember.ID);
            if (!string.IsNullOrEmpty(q))
            {
                query = query.Where(t => t.Ignored.UserName.Contains(q) || t.Ignored.Email.Contains(q) || t.Ignored.Name.Contains(q));
            }
            var list = query.OrderByDescending(t => t.CreateDate).Select(t => new MemberSmallDTO(t.Ignored)).ToList();
            return list;
        }

        [HttpGet("{id}")]
        public MemberSmallDTO Get(Guid id)
        {
            var currentMember = _context.Members.First(t => t.PublicID == new Guid(User.Identity.Name));
            var bm = _context.IgnoredMembers.FirstOrDefault(t => t.Ignored.PublicID == id && t.User.ID == currentMember.ID);
            if (bm != null)
            {
                return new MemberSmallDTO(bm.Ignored);
            }
            else
            {
                return null;
            }
        }

        [HttpPost("{id}")]
        public bool Post(Guid id)
        {
            var currentMember = _context.Members.First(t => t.PublicID == new Guid(User.Identity.Name));
            var targetMember = _context.Members.FirstOrDefault(t => t.PublicID == id);
            if (targetMember != null)
            {
                if (targetMember.ID != currentMember.ID)
                {
                    var bm = new IgnoredMember()
                    {
                        Ignored = targetMember,
                        CreateDate = DateTime.UtcNow,
                        User = currentMember
                    };
                    _context.IgnoredMembers.Add(bm);
                    _context.SaveChanges();
                    return true;
                }
                else
                {
                    return false;
                }
            }
            else
            {
                return false;
            }
        }

        [HttpGet]
        [Route("remove/{id}")]
        public bool Remove(Guid id)
        {
            var currentMember = _context.Members.First(t => t.PublicID == new Guid(User.Identity.Name));
            var targetMember = _context.IgnoredMembers.Include(t => t.Ignored).FirstOrDefault(t => t.Ignored.PublicID == id && t.User.ID == currentMember.ID);
            if (targetMember != null)
            {
                _context.IgnoredMembers.Remove(targetMember);
                _context.SaveChanges();
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}
