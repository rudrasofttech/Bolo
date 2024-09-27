using Bolo.Data;
using Bolo.Helper;
using Bolo.Hubs;
using Bolo.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
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
        private readonly IWebHostEnvironment _webHostEnvironment;
        private const int OrientationKey = 0x0112;
        private const int NotSpecified = 0;
        private const int NormalOrientation = 1;
        private const int MirrorHorizontal = 2;
        private const int UpsideDown = 3;
        private const int MirrorVertical = 4;
        private const int MirrorHorizontalAndRotateRight = 5;
        private const int RotateLeft = 6;
        private const int MirorHorizontalAndRotateLeft = 7;
        private const int RotateRight = 8;
        private const double PhotoMaxWidth = 700;


        public PostController(BoloContext context, IConfiguration config, IHubContext<UniversalHub> uhub, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _config = config;
            _webHostEnvironment = webHostEnvironment;
            nhelper = new NotificationHelper(context, uhub, config);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public PostDTO Get(Guid id)
        {
            Member currentMember = null;
            if (User.Identity.IsAuthenticated)
            {
                currentMember = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
            }
            var query = _context.Posts.Include(t => t.Photos).Include(t => t.Owner).Where(t => t.PublicID == id);
            if (!User.Identity.IsAuthenticated)
                query = query.Where(t => t.Owner.Visibility == MemberProfileVisibility.Public);

            //var p = _context.Posts.Include(t => t.Photos).Include(t => t.Owner).FirstOrDefault(t => t.PublicID == id);
            var p = query.FirstOrDefault();

            if (p == null)
                return null;
            else
            {
                p.ReactionCount = _context.Reactions.Count(t => t.Post.ID == p.ID);
                p.CommentCount = _context.Comments.Count(t => t.Post.ID == p.ID);
                _context.SaveChanges();
                var pdto = new PostDTO(p);
                if (currentMember != null)
                    pdto.HasReacted = _context.Reactions.Any(t => t.Post.ID == p.ID && t.ReactedBy.ID == currentMember.ID);
                foreach (var pp in pdto.Photos)
                {
                    if (pp.Photo.StartsWith("photos/"))
                    {
                        pp.Photo = $"//{Request.Host}/{pp.Photo}";
                    }
                }
                return pdto;
            }

        }

        /// <summary>
        /// This action will return post based on a hashtag or profile
        /// </summary>
        /// <param name="q"></param>
        /// <param name="ps"></param>
        /// <param name="p"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult> Get([FromQuery] string q = "", [FromQuery] int ps = 20, [FromQuery] int p = 0)
        {
            try
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
                        var count = _context.Followers.Any(t => t.Follower.ID == currentMember.ID && t.Following.ID == member.ID && t.Status == FollowerStatus.Active);
                        if (count || currentMember.ID == member.ID)
                        {
                            query = query.Where(t => t.Owner.ID == member.ID);
                        }
                    }
                    else if (member.Visibility == MemberProfileVisibility.Public)
                    {
                        query = query.Where(t => t.Owner.ID == member.ID);
                    }
                }
                else if (q.StartsWith("#") || !string.IsNullOrEmpty(q))
                {
                    query = query.Where(t => t.Describe.Contains(q));
                }
                else
                {
                    var MemberList = new List<Member>
                {
                    currentMember
                };
                    MemberList.AddRange(_context.Followers.Where(t => t.Follower.ID == currentMember.ID && t.Status == FollowerStatus.Active).Select(t => t.Following).ToList());
                    query = query.Where(t => MemberList.Contains(t.Owner));
                }
                query = query.OrderByDescending(t => t.PostDate);
                List<PostDTO> posts = new List<PostDTO>();
                var qresults = query.Skip(p * ps).Take(ps).ToList();
                foreach (MemberPost pd in qresults)
                {
                    PostDTO pdto = new PostDTO(pd);
                    if (currentMember != null)
                        pdto.HasReacted = _context.Reactions.Any(t => t.Post.ID == pd.ID && t.ReactedBy.ID == currentMember.ID);

                    posts.Add(pdto);
                }
                foreach(PostDTO pd in posts)
                {
                    foreach(var pp in pd.Photos)
                    {
                        if (pp.Photo.StartsWith("photos/"))
                        {
                            pp.Photo = $"//{Request.Host}/{pp.Photo}";
                        }
                    }
                }
                var model = new PostsPaged
                {
                    Current = p,
                    PageSize = ps,
                    Total = query.Count(),
                    Posts = posts
                };
                return Ok(model);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("hashtag")]
        [AllowAnonymous]
        public async Task<PostsPaged> HashTag([FromQuery] string q, [FromQuery] int ps = 20, [FromQuery] int p = 0)
        {
            Member? currentMember = null;
            var ignored = new List<Member>();
            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                currentMember = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
                ignored = _context.IgnoredMembers.Where(t => t.User.ID == currentMember.ID).Select(t => t.Ignored).ToList();
            }
                
            var query = _context.HashTags.Include(t => t.Post).Include(t => t.Post.Photos).Include(t => t.Post.Owner)
                .Where(t => t.Tag == q).Where(t => !ignored.Contains(t.Post.Owner)).Select(t => t.Post)
                .OrderByDescending(t => t.PostDate).Skip(p * ps).Take(ps).ToList();
            
            var posts = new List<PostDTO>();
            foreach (var pd in query)
            {
                var pdto = new PostDTO(pd);
                if (currentMember != null)
                    pdto.HasReacted = _context.Reactions.Any(t => t.Post.ID == pd.ID && t.ReactedBy.ID == currentMember.ID);

                posts.Add(pdto);
            }
            var model = new PostsPaged
            {
                Current = p,
                PageSize = ps,
                Total = query.Count(),
                Posts = posts
            };
            return model;
        }

        [HttpGet]
        [Route("hashtagpostcount")]
        [AllowAnonymous]
        public ActionResult HashtagPostCount([FromQuery] string q)
        {
            int c = _context.HashTags.Include(t => t.Post).Where(t => t.Tag.ToLower() == q.ToLower()).Select(t => t.Post).Count();
            bool b = false;
            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                Member currentMember = _context.Members.First(t => t.PublicID == new Guid(User.Identity.Name));
                b = _context.Followers.Any(t => t.Tag.ToLower() == q.ToLower() && t.Follower.ID == currentMember.ID);
            }

            return Ok(new { PostCount = c, Followed = b });
        }

        /// <summary>
        /// get post based on what is trending and what users likes
        /// </summary>
        /// <param name="ps"></param>
        /// <param name="p"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("explore")]
        [AllowAnonymous]
        public PostsPaged Explore([FromQuery] int ps = 20, [FromQuery] int p = 0)
        {
            var ignored = new List<Member>();
            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                var currentMember = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
                ignored.AddRange(_context.IgnoredMembers.Where(t => t.User.ID == currentMember.ID).Select(t => t.Ignored).ToList());
            }
            //List<int> queryview = _context.DiscoverPostView.Skip(ps * p).Take(ps).Select(t => t.ID).ToList();
            //var query = _context.Posts.Include(t => t.Owner).Include(t => t.Photos).Where(t => queryview.Contains(t.ID))
            //    .Where(t => !ignored.Contains(t.Owner)).Select(t => new PostDTO(t)).ToList();

            var q = _context.Posts.Include(t => t.Owner).Include(t => t.Photos).Where(t => t.Owner.Visibility == MemberProfileVisibility.Public);

            if (ignored.Count > 0)
                q = q.Where(t => !ignored.Contains(t.Owner));

                q = q.OrderByDescending(t => t.PostDate).OrderByDescending(t => t.Rank)
                .OrderByDescending(t => t.ReactionCount).OrderByDescending(t => t.CommentCount).OrderByDescending(t => t.ShareCount);
            var result = new PostsPaged()
            {
                Current = p,
                PageSize = ps,
                Total = q.Count(), //_context.DiscoverPostView.Count(),
                Posts = [.. q.Skip(ps * p).Take(ps).Select(t => new PostDTO(t))]
            };
            return result;
        }

        //get signed in user feed
        [HttpGet]
        [Route("feed")]
        public async Task<PostsPaged> FeedAsync([FromQuery] int ps = 36, [FromQuery] int p = 0)
        {
            Member currentMember = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));

            var ignored = _context.IgnoredMembers.Where(t => t.User.ID == currentMember.ID).Select(t => t.Ignored).ToList();
            var query = _context.Posts.Include(t => t.Photos).Include(t => t.Owner).Where(t => !ignored.Contains(t.Owner));
            
            List<Member> MemberList = new List<Member>
            {
                currentMember
            };
            MemberList.AddRange(_context.Followers.Where(t => t.Follower.ID == currentMember.ID && t.Status == FollowerStatus.Active && string.IsNullOrEmpty(t.Tag)).Select(t => t.Following).ToList());
            query = query.Where(t => MemberList.Contains(t.Owner));

            List<string> tags = new List<string>();
            tags.AddRange(_context.Followers.Where(t => t.Follower.ID == currentMember.ID && !string.IsNullOrEmpty(t.Tag) && t.Following == null).Select(t => t.Tag).ToList());
            if (tags.Count > 0)
            {
                var query2 = _context.Posts.Include(t => t.Photos).Include(t => t.Owner).Where(t => !ignored.Contains(t.Owner));
                foreach (string tag in tags)
                {
                    query2 = query2.Where(t => t.Describe.Contains(tag));
                }
                query = query.Union(query2);
            }
            var list = query.OrderByDescending(t => t.PostDate).Skip(p * ps).Take(ps).ToList();
            var posts = new List<PostDTO>();
            foreach (var pd in list)
            {
                var pDto = new PostDTO(pd);
                if (currentMember != null)
                    pDto.HasReacted = _context.Reactions.Any(t => t.Post.ID == pd.ID && t.ReactedBy.ID == currentMember.ID);

                posts.Add(pDto);
            }
            var model = new PostsPaged
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
                        mp.ReactionCount = _context.Reactions.Count(t => t.Post.ID == mp.ID);
                        await _context.SaveChangesAsync();
                        return Ok(new { ID = id, HasReacted = false, ReactionCount = _context.Reactions.Count(t => t.Post.ID == mp.ID) });
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
                        mp.ReactionCount = _context.Reactions.Count(t => t.Post.ID == mp.ID);
                        await _context.SaveChangesAsync();
                        try
                        {
                            nhelper.SaveNotification(mp.Owner, string.Empty, false, MemberNotificationType.PostReaction, mp, member, null);
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

        [HttpGet]
        [Route("share/{postid}")]
        public ActionResult Share(Guid postid, [FromQuery] Guid uid)
        {
            try
            {
                var currentmember = _context.Members.First(t => t.PublicID == new Guid(User.Identity.Name));
                var targetmember = _context.Members.FirstOrDefault(t => t.PublicID == uid);
                if (targetmember == null)
                    return BadRequest(new { error = "Could not find the person to share post." });
                var post = _context.Posts.Include(t => t.Photos).Include(t => t.Owner).Include(t => t.Modifier).FirstOrDefault(t => t.PublicID == postid);
                if (post == null)
                    return BadRequest(new { error = "Could not find the post." });

                try
                {
                    nhelper.SaveNotification(targetmember, "Post shared", false, MemberNotificationType.SharePost, post, currentmember, null);
                    post.ShareCount = post.ShareCount + 1;
                    _context.SaveChanges();
                }
                catch (Exception)
                {

                }
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = "Unable to process the request. " + ex.Message });
            }
        }

        // POST api/<PhotoController>
        [HttpPost]
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Interoperability", "CA1416:Validate platform compatibility", Justification = "<Pending>")]
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
                    AcceptComment = value.AcceptComment ?? false,
                    AllowShare = value.AllowShare ?? false,
                    PublicID = Guid.NewGuid()
                };
                foreach (string s in value.Photos.Where(t => !string.IsNullOrEmpty(t)))
                {
                    string substr = s.IndexOf(";base64,") > -1 ? s[(s.IndexOf(";base64,") + 8)..] : s;
                    byte[] data = System.Convert.FromBase64String(substr);
                    string filename = string.Format("{0}.jpg", Guid.NewGuid().ToString());
                    string webRootPath = _webHostEnvironment.WebRootPath;
                    string abspath = Path.Combine(webRootPath, "photos", filename);
                    string relpath = string.Format("photos/{0}", filename);
                    //System.IO.File.WriteAllBytes(abspath, data);
                    using (var stream = new MemoryStream(data, 0, data.Length))
                    {
                        System.Drawing.Image image = System.Drawing.Image.FromStream(stream, true, false);
                        if (image.PropertyIdList.Contains(OrientationKey))
                        {
                            var orientation = (int)image.GetPropertyItem(OrientationKey).Value[0];
                            switch (orientation)
                            {
                                case NotSpecified: // Assume it is good.
                                case NormalOrientation:
                                    // No rotation required.
                                    break;
                                case MirrorHorizontal:
                                    image.RotateFlip(RotateFlipType.RotateNoneFlipX);
                                    break;
                                case UpsideDown:
                                    image.RotateFlip(RotateFlipType.Rotate180FlipNone);
                                    break;
                                case MirrorVertical:
                                    image.RotateFlip(RotateFlipType.Rotate180FlipX);
                                    break;
                                case MirrorHorizontalAndRotateRight:
                                    image.RotateFlip(RotateFlipType.Rotate90FlipX);
                                    break;
                                case RotateLeft:
                                    image.RotateFlip(RotateFlipType.Rotate90FlipNone);
                                    break;
                                case MirorHorizontalAndRotateLeft:
                                    image.RotateFlip(RotateFlipType.Rotate270FlipX);
                                    break;
                                case RotateRight:
                                    image.RotateFlip(RotateFlipType.Rotate270FlipNone);
                                    break;
                                default:
                                    throw new NotImplementedException("An orientation of " + orientation + " isn't implemented.");
                            }
                        }
                        long quality = 75;
                        var qualityParam = new EncoderParameter(Encoder.Quality, quality);
                        ImageCodecInfo imageCodec = ImageCodecInfo.GetImageDecoders().FirstOrDefault(codec => codec.FormatID == ImageFormat.Jpeg.Guid);
                        var encoderParameters = new EncoderParameters(1);
                        encoderParameters.Param[0] = qualityParam;
                        if (image.Width > PhotoMaxWidth)
                        {
                            
                            double temp = PhotoMaxWidth / (double)image.Width;
                            temp *= 100;
                            System.Drawing.Image image2 = Bolo.Helper.Utility.ScaleByPercent(image, Percent: temp);
                            image2.Save(abspath,imageCodec, encoderParameters);
                            
                            p.Photos.Add(new PostPhoto() { Photo = relpath, Width = image2.Width, Height = image2.Height });
                        }
                        else
                        {
                            image.Save(abspath, imageCodec, encoderParameters);
                            
                            p.Photos.Add(new PostPhoto() { Photo = relpath, Width = image.Width, Height = image.Height });
                        }
                        

                    }
                    
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

                //var followers = _context.Followers.Include(t => t.Follower).Where(t => t.Following.ID == member.ID).ToList();
                //foreach (var f in followers)
                //{
                //    try
                //    {
                //        nhelper.SaveNotification(f.Follower, string.Empty, false, MemberNotificationType.NewPost, p, member, null);
                //    }
                //    catch (Exception)
                //    {

                //    }
                //}
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = $"Unable to process the request. {ex.Message} " });
            }
        }

        //[System.Diagnostics.CodeAnalysis.SuppressMessage("Interoperability", "CA1416:Validate platform compatibility", Justification = "<Pending>")]
        //private ImageCodecInfo GetEncoderInfo(string mimeType)
        //{
        //    ImageCodecInfo[] codecs = ImageCodecInfo.GetImageEncoders();
        //    for(int i = 0; i < codecs.Length;i++)
        //    {
        //        if (codecs[i].MimeType == mimeType)
        //            return codecs[i];
        //    }

        //    return null;
        //}

        //[System.Diagnostics.CodeAnalysis.SuppressMessage("Interoperability", "CA1416:Validate platform compatibility", Justification = "<Pending>")]
        //private System.Drawing.Image ScaleByPercent(System.Drawing.Image imgPhoto, int Percent)
        //{
        //    float nPercent = ((float)Percent / 100);

        //    int sourceWidth = imgPhoto.Width;
        //    int sourceHeight = imgPhoto.Height;
        //    int sourceX = 0;
        //    int sourceY = 0;

        //    int destX = 0;
        //    int destY = 0;
        //    int destWidth = (int)(sourceWidth * nPercent);
        //    int destHeight = (int)(sourceHeight * nPercent);

        //    Bitmap bmPhoto = new Bitmap(destWidth, destHeight,
        //                             PixelFormat.Format24bppRgb);
        //    bmPhoto.SetResolution(imgPhoto.HorizontalResolution,
        //                            imgPhoto.VerticalResolution);

        //    Graphics grPhoto = Graphics.FromImage(bmPhoto);
            
        //    grPhoto.InterpolationMode = InterpolationMode.Low;
        //    grPhoto.CompositingMode = CompositingMode.SourceCopy;
        //    grPhoto.CompositingQuality = CompositingQuality.HighSpeed;
        //    grPhoto.PixelOffsetMode = PixelOffsetMode.HighSpeed;
        //    grPhoto.SmoothingMode = SmoothingMode.HighSpeed;
            
        //    grPhoto.DrawImage(imgPhoto,
        //        new System.Drawing.Rectangle(destX, destY, destWidth, destHeight),
        //        new System.Drawing.Rectangle(sourceX, sourceY, sourceWidth, sourceHeight),
        //        GraphicsUnit.Pixel);

        //    grPhoto.Dispose();
        //    return bmPhoto;
        //}

        [HttpGet]
        [Route("updatedimension")]
        [AllowAnonymous]
        public ActionResult UpdateDimension()
        {
            try
            {
                var query = _context.PostPhotos.Where(t => t.Height == 0 || t.Width == 0);
                foreach (var item in query)
                {
                    System.Drawing.Image image = System.Drawing.Image.FromFile($"{_webHostEnvironment.WebRootPath}/{item.Photo}");
                    item.Width = image.Width;
                    item.Height = image.Height;
                }
                _context.SaveChanges();
                return Ok();
            }catch(Exception ex)
            {
                return BadRequest(new { ex.Message, ex.StackTrace});
            }
        }

        [HttpPost]
        [Route("postvideo")]
        [RequestFormLimits(MultipartBodyLengthLimit = 20971520)]
        public async Task<ActionResult> PostVideoAsync([FromForm] PostVideoDTO value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { error = "Invalid Input" });
            }
            try
            {
                if (value.Video.Length > 0 && value.Video.Length <= Bolo.Helper.Utility.MultipartBodyLengthLimit)
                {
                    var filePath = Path.GetTempFileName();
                    string filename = $"{Guid.NewGuid()}{Path.GetExtension(value.Video.FileName)}";
                    string webRootPath = _webHostEnvironment.WebRootPath;
                    string abspath = Path.Combine(webRootPath, "videos", filename);
                    string relpath = $"videos/{filename}";

                    using (var stream = System.IO.File.Create(abspath))
                    {
                        await value.Video.CopyToAsync(stream);
                    }
                    var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
                    MemberPost p = new MemberPost()
                    {
                        Describe = string.IsNullOrEmpty(value.Describe) ? "" : value.Describe,
                        Owner = member,
                        PostDate = DateTime.UtcNow,
                        PostType = MemberPostType.Video,
                        Status = RecordStatus.Active,
                        VideoURL = relpath,
                        AcceptComment = value.AcceptComment,
                        AllowShare = value.AllowShare,
                        PublicID = Guid.NewGuid()
                    };
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
                    return Ok(new { success = true });
                }
                else
                {
                    return BadRequest(new { error = "Video should not be more than 20MB in size" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Unable to process your request. " + ex.Message });
            }
        }

        [HttpPost]
        [Route("addcomment")]
        public async Task<ActionResult<CommentDTO>> AddComment([FromForm] PostCommentDTO value)
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
                post.CommentCount = _context.Comments.Count(t => t.Post.ID == post.ID);
                await _context.SaveChangesAsync();
                try
                {
                    nhelper.SaveNotification(post.Owner, string.Format("{0} commented on your post.", member.Name), false, MemberNotificationType.PostComment, post, member, mc);
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
                var comment = _context.Comments.Include(t => t.Post).FirstOrDefault(t => t.ID == id && t.CommentedBy.ID == member.ID);
                if (comment != null)
                {
                    int postid = comment.Post.ID;
                    var notifications = _context.Notifications.Where(t => t.Comment != null && t.Comment.ID == comment.ID);
                    _context.Notifications.RemoveRange(notifications);
                    _context.Comments.Remove(comment);
                    await _context.SaveChangesAsync();
                    var post = _context.Posts.FirstOrDefault(t => t.ID == postid);
                    if (post != null)
                    {
                        post.CommentCount = _context.Comments.Count(t => t.Post.ID == postid);
                        await _context.SaveChangesAsync();
                    }
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
            CommentListPaged result = new CommentListPaged()
            {
                Current = p,
                PageSize = ps,
                Total = query.Count(),
                CommentList = query.Skip(ps * p).Take(ps).Select(t => new CommentDTO(t)).ToList()
            };


            return result;
        }

        // PUT api/<PhotoController>/5
        [HttpPost]
        [Route("edit/{id}")]
        public async Task<ActionResult> EditAsync(Guid id, [FromBody] PutPhotoDTO value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { error = "Invalid Input" });
            }

            try
            {
                var member = _context.Members.First(t => t.PublicID == new Guid(User.Identity.Name));
                var p = _context.Posts.FirstOrDefault(t => t.PublicID == id && t.Owner.ID == member.ID);
                if (p != null)
                {
                    p.Modifier = member;
                    p.ModifyDate = DateTime.UtcNow;
                    p.AcceptComment = value.AcceptComment;
                    p.AllowShare = value.AllowShare;
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
                else
                {
                    return BadRequest(new { erro = "Post not found" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = "Unable to process the request. " + ex.Message });
            }
        }

        // DELETE api/<PhotoController>/5
        [HttpGet]
        [Route("delete/{id}")]
        public async Task<ActionResult> DeleteAsync(Guid id)
        {
            try
            {
                var member = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));

                MemberPost p = _context.Posts.Include(t => t.Photos).FirstOrDefault(t => t.PublicID == id && t.Owner.ID == member.ID);
                if (p != null)
                {
                    var comments = _context.Comments.Where(t => t.Post.ID == p.ID);
                    _context.Comments.RemoveRange(comments);
                    var hashtags = _context.HashTags.Where(t => t.Post.ID == p.ID);
                    _context.HashTags.RemoveRange(hashtags);
                    var reactions = _context.Reactions.Where(t => t.Post.ID == p.ID);
                    _context.Reactions.RemoveRange(reactions);
                    var notifications = _context.Notifications.Where(t => t.Post.ID == p.ID);
                    _context.Notifications.RemoveRange(notifications);

                    _context.PostPhotos.RemoveRange(p.Photos);

                    _context.Posts.Remove(p);
                    await _context.SaveChangesAsync();
                    foreach (var photo in p.Photos)
                    {
                        if (System.IO.File.Exists(string.Format("{0}/{1}", _webHostEnvironment.WebRootPath, photo.Photo)))
                            System.IO.File.Delete(string.Format("{0}/{1}", _webHostEnvironment.WebRootPath, photo.Photo));
                    }
                    if (!string.IsNullOrEmpty(p.VideoURL))
                    {
                        if (System.IO.File.Exists($"{_webHostEnvironment.WebRootPath}/{p.VideoURL}"))
                        {
                            System.IO.File.Delete($"{_webHostEnvironment.WebRootPath}/{p.VideoURL}");
                        }
                    }
                }

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

        [HttpGet]
        [Route("flag/{id}")]
        public ActionResult Flag(Guid id, [FromQuery] FlagTypeEnum type)
        {
            try
            {
                var member = _context.Members.FirstOrDefault(t => t.PublicID == new Guid(User.Identity.Name));
                var p = _context.Posts.FirstOrDefault(t => t.PublicID == id);

                if (p != null)
                {
                    var fi = _context.FlaggedItems.FirstOrDefault(t => t.User.ID == member.ID && t.PostID == p.ID);
                    if (fi == null)
                    {
                        fi = new FlaggedItem() { CreateDate = DateTime.UtcNow, PostID = p.ID, User = member, FlagType = type };
                        _context.FlaggedItems.Add(fi);
                        _context.SaveChanges();
                    }
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = "Unable to process the request. " + ex.Message });
            }
        }

        [HttpGet]
        [Route("count")]
        public ActionResult Count([FromQuery] RecordStatus status)
        {
            return Ok(new { count = _context.Posts.Count(t => t.Status == status) });
        }

        [HttpGet]
        [Route("reactioncount/{id}")]
        public int ReactionCount(Guid id)
        {
            return _context.Reactions.Count(t => t.Post.PublicID == id);
        }

        [HttpGet]
        [Route("commentcount/{id}")]
        public int CommentCount(Guid id)
        {
            return _context.Comments.Count(t => t.Post.PublicID == id);
        }
    }
}
