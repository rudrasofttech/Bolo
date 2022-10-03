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
using System.Text.RegularExpressions;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Bolo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PostController : ControllerBase
    {
        private readonly BoloContext _context;
        private readonly IConfiguration _config;
        private readonly NotificationHelper nhelper;
        
        public PostController(BoloContext context, IConfiguration config, IHubContext<UniversalHub> uhub)
        {
            _context = context;
            _config = config;
            nhelper = new NotificationHelper(context, uhub);
        }

        /// <summary>
        /// This action will return post based on a hashtag or profile
        /// </summary>
        /// <param name="q"></param>
        /// <param name="ps"></param>
        /// <param name="p"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<PostsPaged> Get([FromQuery] string q, [FromQuery] int ps = 20, [FromQuery] int p = 0)
        {
            Member currentMember = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            Member member = null;
            if (!string.IsNullOrEmpty(q))
            {
                member = await _context.Members.FirstOrDefaultAsync(t => t.UserName == q.TrimStart("@".ToCharArray()));
            }
            var query = _context.Posts.Include(t => t.Photos).Include(t => t.Owner).Where(t => true);

            if (member != null)
            {
                if (member.Visibility == MemberProfileVisibility.Private)
                {
                    var count = _context.Followers.Count(t => t.Follower.ID == currentMember.ID && t.Following.ID == member.ID && t.Status == FollowerStatus.Active);
                    if (count > 0)
                    {
                        query = query.Where(t => t.Owner.ID == member.ID);
                    }
                }
                else if (member.Visibility == MemberProfileVisibility.Public)
                {
                    query = query.Where(t => t.Owner.ID == member.ID);
                }
            }
            else
            {
                List<Member> MemberList = new List<Member>();
                MemberList.Add(currentMember);
                MemberList.AddRange(_context.Followers.Where(t => t.Follower.ID == currentMember.ID && t.Status == FollowerStatus.Active).Select(t => t.Following).ToList());
                query = query.Where(t => MemberList.Contains(t.Owner));
            }
            query = query.OrderByDescending(t => t.PostDate);
            List<PostDTO> posts = new List<PostDTO>();
            var qresults = query.Skip(p * ps).Take(ps);
            foreach (MemberPost pd in qresults)
            {
                PostDTO pdto = new PostDTO(pd)
                {
                    ReactionCount = _context.Reactions.Count(t => t.Post.ID == pd.ID),
                    CommentCount = _context.Comments.Count(t => t.Post.ID == pd.ID)
                };
                if (currentMember != null)
                    pdto.HasReacted = _context.Reactions.Count(t => t.Post.ID == pd.ID && t.ReactedBy.ID == currentMember.ID) > 0;

                posts.Add(pdto);
            }
            PostsPaged model = new PostsPaged
            {
                Current = p,
                PageSize = ps,
                Total = query.Count(),
                Posts = posts
            };
            return model;
        }

        [HttpGet]
        [Route("hashtag")]
        public async Task<PostsPaged> HashTag([FromQuery] string q, [FromQuery] int ps = 20, [FromQuery] int p = 0)
        {
            Member currentMember = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            var query = _context.HashTags.Include(t => t.Post).Include(t => t.Post.Photos).Include(t => t.Post.Owner)
                .Where(t => t.Tag == q).Select(t => t.Post).OrderByDescending(t => t.PostDate).Skip(p * ps).Take(ps);
            List<PostDTO> posts = new List<PostDTO>();
            foreach (MemberPost pd in query)
            {
                PostDTO pdto = new PostDTO(pd)
                {
                    ReactionCount = _context.Reactions.Count(t => t.Post.ID == pd.ID),
                    CommentCount = _context.Comments.Count(t => t.Post.ID == pd.ID)
                };
                if (currentMember != null)
                    pdto.HasReacted = _context.Reactions.Count(t => t.Post.ID == pd.ID && t.ReactedBy.ID == currentMember.ID) > 0;

                posts.Add(pdto);
            }
            PostsPaged model = new PostsPaged
            {
                Current = p,
                PageSize = ps,
                Total = query.Count(),
                Posts = posts
            };
            return model;
        }

        /// <summary>
        /// get post based on whats trending and what users likes
        /// </summary>
        /// <param name="ps"></param>
        /// <param name="p"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("explore")]
        public PostsPaged Explore([FromQuery] int ps = 20, [FromQuery] int p = 0)
        {
            var query = _context.Reactions.Include(t => t.Post).Include(t => t.Post.Owner).Include(t => t.Post.Photos).GroupBy(t => t.Post)
                    .Select(t => new PostDTO(t.Key) { ReactionCount = t.Count() }).OrderByDescending(t => t.ReactionCount).OrderByDescending(t => t.PostDate);
            PostsPaged result = new PostsPaged()
            {
                Current = p,
                PageSize = ps,
                Total = query.Count(),
                Posts = query.Skip(ps * p).Take(ps).ToList()
            };
            return result;
        }

        //get signed in user feed
        [HttpGet]
        [Route("feed")]
        public async Task<PostsPaged> FeedAsync([FromQuery] int ps = 20, [FromQuery] int p = 0)
        {
            Member currentMember = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            var query = _context.Posts.Include(t => t.Photos).Include(t => t.Owner).Where(t => true);
            List<string> tags = new List<string>();
            List<Member> MemberList = new List<Member>
            {
                currentMember
            };
            MemberList.AddRange(_context.Followers.Where(t => t.Follower.ID == currentMember.ID && t.Status == FollowerStatus.Active && string.IsNullOrEmpty(t.Tag)).Select(t => t.Following).ToList());
            tags.AddRange(_context.Followers.Where(t => t.Follower.ID == currentMember.ID && !string.IsNullOrEmpty(t.Tag) && t.Following == null).Select(t => t.Tag).ToList());
            query = query.Where(t => MemberList.Contains(t.Owner));
            foreach (string tag in tags)
            {
                query = query.Where(t => t.Describe.Contains(tag));
            }
            query = query.OrderByDescending(t => t.PostDate).Skip(p * ps).Take(ps);
            List<PostDTO> posts = new List<PostDTO>();
            foreach (MemberPost pd in query)
            {
                PostDTO pdto = new PostDTO(pd)
                {
                    ReactionCount = _context.Reactions.Count(t => t.Post.ID == pd.ID),
                    CommentCount = _context.Comments.Count(t => t.Post.ID == pd.ID)
                };
                if (currentMember != null)
                    pdto.HasReacted = _context.Reactions.Count(t => t.Post.ID == pd.ID && t.ReactedBy.ID == currentMember.ID) > 0;

                posts.Add(pdto);
            }
            PostsPaged model = new PostsPaged
            {
                Current = p,
                PageSize = ps,
                Total = query.Count(),
                Posts = posts
            };
            return model;
        }

        [HttpGet]
        [Route("addreaction/{id}")]
        public async Task<ActionResult> AddReaction(Guid id)
        {
            try
            {
                var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
                MemberPost mp = await _context.Posts.Include(t => t.Owner).FirstOrDefaultAsync(t => t.PublicID == id);
                if (mp != null && member != null)
                {
                    var reaction = _context.Reactions.FirstOrDefault(t => t.Post.ID == mp.ID && t.ReactedBy.ID == member.ID);
                    if (reaction != null)
                    {
                        _context.Reactions.Remove(reaction);
                        await _context.SaveChangesAsync();
                        return Ok(new { HasReacted = false, ReactionCount = _context.Reactions.Count(t => t.Post.ID == mp.ID) });
                    }
                    else
                    {
                        _context.Reactions.Add(new MemberReaction()
                        {
                            Post = mp,
                            ReactedBy = member,
                            Reaction = PostReactionType.Like,
                            ReactionDate = DateTime.UtcNow
                        });
                        await _context.SaveChangesAsync();
                        try
                        {
                            nhelper.SaveNotification(mp.Owner, member.Pic, "", string.Format("{0} reacted on your post.",  member.GetNameOrUsername()), "", MemberNotificationType.PostReaction, mp.ID);
                        }
                        catch (Exception)
                        {

                        }
                        return Ok(new { ID = id, HasReacted = true, ReactionCount = _context.Reactions.Count(t => t.Post.ID == mp.ID) });
                    }
                }
                return BadRequest();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST api/<PhotoController>
        [HttpPost]
        public async Task<ActionResult> PostAsync([FromForm] PostPhotoDTO value)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { error = "Invalid Input" });

            try
            {
                var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
                MemberPost p = new MemberPost()
                {
                    Describe = string.IsNullOrEmpty(value.Describe) ? "" : value.Describe,
                    Owner = member,
                    PostDate = DateTime.UtcNow,
                    PostType = MemberPostType.Photo,
                    Status = RecordStatus.Active,
                    VideoURL = string.Empty,
                    AcceptComment = value.AcceptComment,
                    PublicID = Guid.NewGuid()
                };
                foreach (string s in value.Photos.Where(t => !string.IsNullOrEmpty(t)))
                {
                    p.Photos.Add(new PostPhoto() { Photo = s });
                }
                _context.Posts.Add(p);
                if (!string.IsNullOrEmpty(p.Describe))
                {
                    var regex = new Regex(@"#\w+");
                    var matches = regex.Matches(p.Describe);
                    foreach (var match in matches)
                    {
                        HashTag ht = new HashTag() { Post = p, Tag = match.ToString() };
                        _context.HashTags.Add(ht);
                    }
                }
                await _context.SaveChangesAsync();

                var followers = _context.Followers.Include(t => t.Follower).Where(t => t.Following.ID == member.ID).ToList();
                foreach(var f in followers)
                {
                    try
                    {
                        nhelper.SaveNotification(f.Follower, member.Pic, "", string.Format("{0} posted a new photo.", member.GetNameOrUsername()), "", MemberNotificationType.NewPost, p.ID);
                    }
                    catch (Exception)
                    {

                    }
                }
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = "Unable to process the request. " + ex.Message });
            }
        }

        [HttpPost]
        [Route("addcomment")]
        public async Task<ActionResult<CommentDTO>> AddComment([FromForm]PostCommentDTO value)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { error = "Invalid Input" });

            try
            {
                var member = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
                var post = _context.Posts.Include(t => t.Owner).FirstOrDefault(t => t.PublicID == value.PostId);
                MemberComment mc = new MemberComment()
                {
                    Comment = value.Comment,
                    CommentDate = DateTime.UtcNow,
                    CommentedBy = member,
                    Post = post
                };
                _context.Comments.Add(mc);
                await _context.SaveChangesAsync();
                try
                {
                    nhelper.SaveNotification(post.Owner, member.Pic, "", string.Format("{0} commented on your post.", member.GetNameOrUsername()), "", MemberNotificationType.PostComment, post.ID);
                }
                catch (Exception)
                {

                }
                return new CommentDTO(mc);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = "Unable to process the request. " + ex.Message });
            }
        }

        [HttpPost]
        [Route("editcomment/{id}")]
        public async Task<ActionResult> EditComment(int id, PostCommentDTO value)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { error = "Invalid Input" });

            try
            {
                var member = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
                var post = _context.Comments.FirstOrDefault(t => t.ID == id && t.CommentedBy.ID == member.ID);
                if (post != null)
                {
                    post.Comment = value.Comment;
                    await _context.SaveChangesAsync();
                }
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = "Unable to process the request. " + ex.Message });
            }
        }

        [HttpGet]
        [Route("removecomment/{id}")]
        public async Task<ActionResult> RemoveComment(int id)
        {
            try
            {
                var member = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
                var post = _context.Comments.FirstOrDefault(t => t.ID == id && t.CommentedBy.ID == member.ID);
                if (post != null)
                {
                    _context.Comments.Remove(post);
                    await _context.SaveChangesAsync();
                }
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = "Unable to process the request. " + ex.Message });
            }
        }

        [HttpGet]
        [Route("comments/{id}")]
        public CommentListPaged GetComments(Guid id, [FromQuery] int ps = 20, [FromQuery] int p = 0)
        {
            var query = _context.Comments.Include(t => t.CommentedBy).Include(t => t.Post)
                .Where(t => t.Post.PublicID == id).OrderByDescending(t => t.ID);
            CommentListPaged result = new CommentListPaged() {
                Current = p,
                PageSize = ps,
                Total = query.Count(),
                CommentList = query.Skip(ps * p).Take(ps).Select(t => new CommentDTO(t)).ToList()
            };


            return result;
        }

        // PUT api/<PhotoController>/5
        [HttpPut("{id}")]
        public async Task<ActionResult> PutAsync(int id, [FromBody] PutPhotoDTO value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { error = "Invalid Input" });
            }

            try
            {
                var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
                MemberPost p = await _context.Posts.FirstOrDefaultAsync(t => t.ID == id && t.Owner.ID == member.ID);
                p.Modifier = member;
                p.ModifyDate = DateTime.UtcNow;
                p.Describe = string.IsNullOrEmpty(value.Describe) ? "" : value.Describe;
                var tags = _context.HashTags.Where(t => t.Post.ID == p.ID);
                _context.HashTags.RemoveRange(tags);

                var regex = new Regex(@"#\w+");
                var matches = regex.Matches(p.Describe);
                foreach (var match in matches)
                {
                    HashTag ht = new HashTag() { Post = p, Tag = match.ToString() };
                    _context.HashTags.Add(ht);
                }

                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = "Unable to process the request. " + ex.Message });
            }
        }

        // DELETE api/<PhotoController>/5
        [HttpPost("{id}")]
        [Route("Delete/{id}")]
        public async Task<ActionResult> DeleteAsync(int id)
        {
            try
            {
                var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
                MemberPost p = await _context.Posts.FirstOrDefaultAsync(t => t.ID == id && t.Owner.ID == member.ID);
                _context.Posts.Remove(p);
                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = "Unable to process the request. " + ex.Message });
            }
        }

        [HttpGet]
        [Route("reactionlist/{id}")]
        public async Task<ActionResult<ReactionListPaged>> GetReactionListAsync(Guid id, [FromQuery] string q = "", [FromQuery] int ps = 20, [FromQuery] int p = 0)
        {
            var currentMember = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
            var query = _context.Reactions.Where(t => t.Post.PublicID == id);
            if (!string.IsNullOrEmpty(q))
            {
                query = query.Where(t => t.ReactedBy.UserName.Contains(q) || t.ReactedBy.Name.Contains(q));
            }
            query = query.OrderByDescending(t => t.ReactionDate);

            ReactionListPaged model = new ReactionListPaged()
            {
                Current = p,
                PageSize = ps,
                Total = query.Count(),
                Reactions = query.Skip(ps * p).Take(ps).Select(t => new ReactionMemberFollowerDTO() { Member = new MemberSmallDTO(t.ReactedBy) }).ToList()
            };
            foreach (var m in model.Reactions)
            {
                var mf = await _context.Followers.FirstOrDefaultAsync(t => t.Follower.ID == currentMember.ID && t.Following.PublicID == m.Member.ID);
                if (mf != null)
                {
                    m.Status = mf.Status;
                }
            }

            return model;
        }
    }
}
