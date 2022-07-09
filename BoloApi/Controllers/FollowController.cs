using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Bolo.Data;
using Bolo.Models;
using BoloWeb.Helper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BoloWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FollowController : ControllerBase
    {
        private readonly BoloContext _context;

        public FollowController(BoloContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Route("Status/{id}")]
        public async Task<MemberFollowerDTO> GetStatusAsync(Guid id)
        {
            Member currentMember = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            Member target = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == id);
            if (target != null)
            {
                var query = await _context.Followers.FirstOrDefaultAsync(t => t.Following.ID == target.ID && t.Follower.ID == currentMember.ID);
                if( query != null)
                {
                    return new MemberFollowerDTO(query);
                }
                else
                {
                    return new MemberFollowerDTO();
                }
                
            }

            return null;
        }

        [HttpGet]
        [Route("Requests")]
        public async Task<List<MemberSmallDTO>> GetRequestsAsync()
        {
            Member currentMember = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            var query = _context.Followers.Where(t => t.Following.ID == currentMember.ID && t.Status == FollowerStatus.Requested).Select(t => new MemberSmallDTO(t.Follower)).ToList();
            return query;
        }

        [HttpGet]
        [Route("Follower/{id}")]
        public async Task<FollowerListPaged> GetFollowerAsync(Guid id, [FromQuery] string q = "", [FromQuery] int ps = 20, [FromQuery] int p = 0)
        {
            bool allowList = false;
            Member currentMember = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            Member target = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == id);

            if (target.ID != currentMember.ID)
                allowList = _context.Followers.Count(t => t.Following.ID == target.ID && t.Follower.ID == currentMember.ID && t.Status == FollowerStatus.Active) > 0;
            else if (target.ID == currentMember.ID)
                allowList = true;


            var query = _context.Followers.Include(t => t.Follower).Include(t => t.Following).Where(t => t.Following.ID == target.ID && t.Status == FollowerStatus.Active);
            if (!string.IsNullOrEmpty(q))
                query = query.Where(t => t.Follower.UserName.Contains(q) || t.Follower.Name.Contains(q));
            if (!allowList)
                query = query.Where(t => false);
            FollowerListPaged result = new FollowerListPaged()
            {
                Current = p,
                Total = query.Count(),
                PageSize = ps,
                FollowList = query.Skip(ps * p).Take(ps).Select(t => new MemberFollowerDTO(t)).ToList()
            };
            
            return result;
        }

        [HttpGet]
        [Route("Following/{id}")]
        public async Task<FollowerListPaged> GetFollowingAsync(Guid id, [FromQuery] string q = "", [FromQuery] int ps = 20, [FromQuery] int p = 0)
        {
            bool allowList = false;
            Member currentMember = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            Member target = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == id);

            if (target.ID != currentMember.ID)
                allowList = _context.Followers.Count(t => t.Follower.ID == target.ID && t.Following.ID == currentMember.ID && t.Status == FollowerStatus.Active) > 0;
            else if (target.ID == currentMember.ID)
                allowList = true;


            var query = _context.Followers.Include(t => t.Follower).Include(t => t.Following).Where(t => t.Follower.ID == target.ID);
            if (!string.IsNullOrEmpty(q))
                query = query.Where(t => t.Following.UserName.Contains(q) || t.Following.Name.Contains(q));
            if (!allowList)
                query = query.Where(t => false);
            FollowerListPaged result = new FollowerListPaged()
            {
                Current = p,
                Total = query.Count(),
                PageSize = ps,
                FollowList = query.Skip(ps * p).Take(ps).Select(t => new MemberFollowerDTO(t)).ToList()
            };
            

            return result;
        }

        [HttpGet]
        [Route("Ask/{id}")]
        public async Task<MemberFollowerDTO> AskAsync(Guid id)
        {
            Member currentMember = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            Member target = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == id);
            MemberFollower mf = _context.Followers.Include(t => t.Follower).Include(t => t.Following).FirstOrDefault(t => t.Following.ID == target.ID && t.Follower.ID == currentMember.ID);
            if (mf == null)
            {
                mf = new MemberFollower()
                {
                    FollowedDate = DateTime.UtcNow,
                    Follower = currentMember,
                    Following = target,
                    Status = target.Visibility == MemberProfileVisibility.Public ? FollowerStatus.Active : FollowerStatus.Requested,
                    Tag = ""
                };
                _context.Followers.Add(mf);
                await _context.SaveChangesAsync();

                return new MemberFollowerDTO(mf);
            }
            else
            {
                return new MemberFollowerDTO(mf);
            }
        }

        [HttpGet]
        [Route("Unfollow/{id}")]
        public async Task<MemberFollowerDTO> UnfollowAsync(Guid id)
        {
            Member currentMember = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            Member target = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == id);
            MemberFollower mf = _context.Followers.Include(t => t.Follower).Include(t => t.Following).FirstOrDefault(t => t.Following.ID == target.ID && t.Follower.ID == currentMember.ID);
            _context.Followers.Remove(mf);
            await _context.SaveChangesAsync();
            return new MemberFollowerDTO();
        }

        [HttpGet]
        [Route("Remove/{id}")]
        public async Task<ActionResult> RemoveAsync(Guid id)
        {
            Member currentMember = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            Member target = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == id);
            MemberFollower mf = _context.Followers.Include(t => t.Follower).Include(t => t.Following)
                .FirstOrDefault(t => t.Follower.ID == target.ID && t.Following.ID == currentMember.ID);
            _context.Followers.Remove(mf);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
