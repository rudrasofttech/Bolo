using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Bolo.Data;
using Bolo.Helper;
using Bolo.Hubs;
using Bolo.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Bolo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FollowController : ControllerBase
    {
        private readonly BoloContext _context;
        private readonly NotificationHelper nhelper;

        public FollowController(BoloContext context, IHubContext<UniversalHub> uhub, IConfiguration config)
        {
            _context = context;
            nhelper = new NotificationHelper(context, uhub, config);
        }

        [HttpGet]
        [Route("Status/{id}")]
        public async Task<MemberFollowerDTO> GetStatusAsync(Guid id)
        {
            var currentMember = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            var target = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == id);
            if (target != null)
            {
                var query = await _context.Followers.FirstOrDefaultAsync(t => t.Following.ID == target.ID && t.Follower.ID == currentMember.ID);
                if (query != null)
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
            var currentMember = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            var query = _context.Followers.Where(t => t.Following.ID == currentMember.ID && t.Status == FollowerStatus.Requested).Select(t => new MemberSmallDTO(t.Follower)).ToList();
            return query;
        }

        [HttpGet]
        [Route("HasRequest/{id}")]
        public ActionResult HasRequest(Guid id)
        {
            try
            {
                bool result = _context.Followers.Any(t => t.Following.PublicID == new Guid(User.Identity.Name) &&
                t.Follower.PublicID == id && t.Status == FollowerStatus.Requested);
                if (result)
                    return Ok();
                else
                    return NotFound();

            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet]
        [Route("Allow/{id}")]
        public ActionResult Allow(Guid id)
        {
            try
            {
                var currentMember = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
                var f = _context.Followers.FirstOrDefault(t => t.Follower.PublicID == id && t.Following.ID == currentMember.ID && t.Status == FollowerStatus.Requested);
                if (f != null)
                {
                    f.Status = FollowerStatus.Active;
                    _context.SaveChanges();
                    return Ok();
                }

                return BadRequest();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet]
        [Route("Reject/{id}")]
        public ActionResult Reject(Guid id)
        {
            try
            {
                var currentMember = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
                var f = _context.Followers.FirstOrDefault(t => t.Follower.PublicID == id && t.Following.ID == currentMember.ID && t.Status == FollowerStatus.Requested);
                if (f != null)
                {
                    _context.Followers.Remove(f);
                    _context.SaveChanges();
                    return Ok();
                }

                return BadRequest();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Get followers of target member id
        /// </summary>
        /// <param name="id"></param>
        /// <param name="q"></param>
        /// <param name="ps"></param>
        /// <param name="p"></param>
        /// <returns></returns>
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
            var list = query.Skip(ps * p).Take(ps).Select(t => new MemberFollowerDTO(t)).ToList();

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
        [Route("followerlist")]
        public async Task<FollowerListPaged> GetFollowersAsync([FromQuery] string q = "", [FromQuery] int ps = 50, [FromQuery] int p = 0)
        {
            Member currentMember = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));

            var query = _context.Followers.Include(t => t.Follower).Include(t => t.Following).Where(t => t.Following.ID == currentMember.ID && t.Status == FollowerStatus.Active);
            if (!string.IsNullOrEmpty(q))
                query = query.Where(t => t.Follower.UserName.Contains(q) || t.Follower.Name.Contains(q));
            var list = query.Skip(ps * p).Take(ps).Select(t => new MemberFollowerDTO(t)).ToList();

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
        [Route("followinglist")]
        public async Task<FollowerListPaged> GetFollowingAsync([FromQuery] string q = "", [FromQuery] int ps = 20, [FromQuery] int p = 0)
        {
            Member currentMember = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));

            var query = _context.Followers.Include(t => t.Follower).Include(t => t.Following).Where(t => t.Follower.ID == currentMember.ID);
            if (!string.IsNullOrEmpty(q))
                query = query.Where(t => (t.Following != null && (t.Following.UserName.Contains(q) || t.Following.Name.Contains(q))) || t.Tag.Contains(q));
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
                allowList = _context.Followers.Count(t => (t.Follower.ID == target.ID && t.Following.ID == currentMember.ID && t.Status == FollowerStatus.Active) ||
                (t.Follower.ID == currentMember.ID && t.Following.ID == target.ID && t.Status == FollowerStatus.Active)) > 0;
            else if (target.ID == currentMember.ID)
                allowList = true;

            //if (target.Visibility == MemberProfileVisibility.Public)
            //    allowList = true;

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
            var currentMember = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            var target = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == id);
            var mf = _context.Followers.Include(t => t.Follower).Include(t => t.Following).FirstOrDefault(t => t.Following.ID == target.ID && t.Follower.ID == currentMember.ID);
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
                try
                {
                    nhelper.SaveNotification(target, string.Empty, false, MemberNotificationType.FollowRequest, null, currentMember, null);
                }
                catch (Exception)
                {

                }
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

        [HttpGet]
        [Route("Recommended")]
        public List<MemberDTO> Recommended([FromQuery] int take = 10)
        {
            if (take > 100) take = 100;
            if (take < 1) take = 1;
            var currentMember = _context.Members.First(t => t.PublicID == new Guid(User.Identity.Name));
            var followings = _context.Followers.Where(t => t.Follower.ID == currentMember.ID && t.Following != null).Select(t => t.Following.ID).ToList();

            var query = _context.PopularPublicAccountViews.Where(t => t.ID != currentMember.ID && !followings.Contains(t.ID));
            if (!string.IsNullOrEmpty(currentMember.Country))
                query = query.Where(t => t.Country.ToLower() == currentMember.Country.ToLower());

            var accounts = query.Take(take).ToList();
            List<MemberDTO> result = new List<MemberDTO>();
            foreach (var item in accounts)
            {
                result.Add(new MemberDTO()
                {
                    Activity = item.Activity,
                    Bio = item.Bio,
                    BirthYear = item.BirthYear,
                    City = item.City,
                    Country = item.Country,
                    Email = item.Email,
                    Gender = item.Gender,
                    ID = item.PublicID,
                    LastPulse = item.LastPulse,
                    Name = item.Name,
                    Phone = item.Phone,
                    Pic = item.Pic,
                    State = item.State,
                    Status = item.Status,
                    ThoughtStatus = item.ThoughtStatus,
                    UserName = item.UserName,
                    Visibility = item.Visibility
                });
            }
            return result;
        }

        [HttpGet]
        [Route("FollowHashtag")]
        public MemberFollowerDTO FollowHashtag(string q)
        {
            var currentMember = _context.Members.First(t => t.PublicID == new Guid(User.Identity.Name));

            var hf = _context.Followers.FirstOrDefault(t => t.Tag.ToLower() == q.ToLower() && t.Follower.ID == currentMember.ID);
            if (hf == null)
            {
                hf = new MemberFollower()
                {
                    FollowedDate = DateTime.UtcNow,
                    Follower = currentMember,
                    Following = null,
                    Status = FollowerStatus.Active,
                    Tag = q
                };
                _context.Followers.Add(hf);
                _context.SaveChanges();
                return new MemberFollowerDTO(hf);
            }

            return new MemberFollowerDTO(hf);
        }

        [HttpGet]
        [Route("UnfollowHashtag")]
        public void UnfollowHashtag(string q)
        {
            var currentMember = _context.Members.First(t => t.PublicID == new Guid(User.Identity.Name));
            var hf = _context.Followers.FirstOrDefault(t => t.Tag.ToLower() == q.ToLower() && t.Follower.ID == currentMember.ID);
            _context.Followers.Remove(hf);
            _context.SaveChanges();
        }
    }
}
