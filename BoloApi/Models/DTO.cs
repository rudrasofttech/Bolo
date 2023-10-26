using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Policy;
using System.Threading.Tasks;

namespace Bolo.Models
{
    public class ChatMessageDTO
    {
        public Guid ID { get; set; }
        public MemberDTO SentBy { get; set; }
        public DateTime SentDate { get; set; }
        public string Message { get; set; } = string.Empty;
        public ChatMessageType MessageType { get; set; }
        public ChatMessageSentStatus SentStatus { get; set; }

        public ChatMessageDTO()
        {

        }

        public ChatMessageDTO(ChatMessage cm)
        {
            ID = cm.PublicID;
            SentBy = new MemberDTO(cm.SentBy);
            SentDate = cm.SentDate;
            SentStatus = cm.SentStatus;
            Message = cm.Message;
            MessageType = cm.MessageType;

        }
    }

    public class ChatMessagePostDTO
    {
        public string Text { get; set; }
        public Guid SentTo { get; set; }
        public Guid PublicID { get; set; }

        public ChatMessagePostDTO()
        {
            PublicID = Guid.Empty;
        }
    }

    public class ContactDTO
    {
        public int ID { get; set; }
        public MemberDTO Person { get; set; }
        public DateTime CreateDate { get; set; }
        public BoloRelationType BoloRelation { get; set; }
        public string RecentMessage { get; set; }
        public DateTime RecentMessageDate { get; set; }
        public int UnseenMessageCount { get; set; }

        public List<ChatMessageDTO> MessagesOnServer { get; set; }

        public ContactDTO(Contact c)
        {
            ID = c.ID;
            if (c.Person != null)
            {
                Person = new MemberDTO(c.Person);
            }
            CreateDate = c.CreateDate;
            this.BoloRelation = c.BoloRelation;
            this.RecentMessage = string.Empty;
            this.RecentMessageDate = DateTime.MinValue;
            this.MessagesOnServer = new List<ChatMessageDTO>();
        }
    }

    public class MemberSmallDTO
    {
        public Guid ID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Pic { get; set; } = string.Empty;
        /// <summary>
        /// Should be true if the member seeing this member info is a follower or not
        /// </summary>
        public MemberSmallDTO()
        {
            ID = Guid.Empty;
            Name = string.Empty;
            UserName = string.Empty;
            Pic = string.Empty;
        }

        public MemberSmallDTO(Member m)
        {
            ID = m.PublicID;
            Name = m.Name;
            UserName = string.IsNullOrEmpty(m.UserName) ? "" : m.UserName;
            Pic = string.IsNullOrEmpty(m.Pic) ? "" : m.Pic;
        }
    }

    public class ReactionMemberFollowerDTO
    {
        public MemberSmallDTO Member { get; set; }
        public FollowerStatus Status { get; set; }

        public ReactionMemberFollowerDTO()
        {
        }
    }

    public class MemberFollowerDTO
    {
        public DateTime FollowedDate { get; set; }
        [MaxLength(200)]
        public string Tag { get; set; }
        public MemberSmallDTO Follower { get; set; }
        public MemberSmallDTO Following { get; set; }
        public FollowerStatus Status { get; set; }

        public bool IsHashtag
        {
            get
            {
                return (!string.IsNullOrEmpty(Tag) && Following == null);
            }
        }

        public MemberFollowerDTO() { }
        public MemberFollowerDTO(MemberFollower mf)
        {
            FollowedDate = mf.FollowedDate;
            Tag = mf.Tag;
            Follower = new MemberSmallDTO(mf.Follower);
            if (mf.Following != null)
                Following = new MemberSmallDTO(mf.Following);
            Status = mf.Status;
        }
    }

    public class MemberDTO
    {
        public Guid ID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public int BirthYear { get; set; }
        public Gender Gender { get; set; }
        public ActivityStatus Activity { get; set; }
        public MemberProfileVisibility Visibility { get; set; }
        public string Pic { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string ThoughtStatus { get; set; }
        public int FollowerCount { get; set; }
        public int FollowingCount { get; set; }
        public int PostCount { get; set; }
        public int FollowRequestCount { get; set; }
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string SecurityQuestion { get; set; } = string.Empty;
        public string SecurityAnswer { get; set; } = string.Empty;
        public int ProfileCompletePercent { get; set; }
        public string EmptyFields { get; set; } = string.Empty;
        public DateTime LastPulse { get; set; }
        public RecordStatus Status { get; set; }
        public bool IsEmailVerified { get; set; }

        public List<ProfileEmail> Emails { get; set; } = new List<ProfileEmail>();
        public List<ProfilePhone> Phones { get; set; } = new List<ProfilePhone>();
        public List<ProfileLink> Links { get; set; } = new List<ProfileLink> { };

        public string PicFormedURL
        {
            get
            {
                if (string.IsNullOrEmpty(Pic))
                    return string.Empty;
                else if (Pic.ToLower().StartsWith("http://") || Pic.ToLower().StartsWith("https://") || Pic.ToLower().StartsWith("data"))
                    return Pic;
                else
                    return $"https://www.yocail.com/{Pic}";
            }
        }

        public MemberDTO()
        {
            ID = Guid.Empty;
            Name = string.Empty;
            UserName = string.Empty;
            Bio = "";
            Pic = "";
            Country = "";
            State = "";
            City = "";
            ThoughtStatus = "";
        }

        public MemberDTO(Member m)
        {
            ID = m.PublicID;
            Name = m.Name;
            UserName = string.IsNullOrEmpty(m.UserName) ? "" : m.UserName;
            Bio = string.IsNullOrEmpty(m.Bio) ? "" : m.Bio;
            BirthYear = m.BirthYear;
            Gender = m.Gender;
            Activity = (m.LastPulse.AddSeconds(3) > DateTime.UtcNow) ? m.Activity : ActivityStatus.Offline;
            LastPulse = m.LastPulse;
            Visibility = m.Visibility;
            Pic = string.IsNullOrEmpty(m.Pic) ? "" : m.Pic;
            Country = string.IsNullOrEmpty(m.Country) ? "" : m.Country;
            State = string.IsNullOrEmpty(m.State) ? "" : m.State;
            City = string.IsNullOrEmpty(m.City) ? "" : m.City;
            ThoughtStatus = string.IsNullOrEmpty(m.ThoughtStatus) ? "" : m.ThoughtStatus;
            Phone = "";
            Email = m.Email;
            SecurityQuestion = m.SecurityQuestion;
            Status = m.Status;
            IsEmailVerified = m.IsEmailVerified;
        }
    }

    public class RegisterDTO
    {
        [MaxLength(50)]
        [Required]
        public string UserName { get; set; } = string.Empty;
        [MinLength(8)]
        [Required]
        public string Password { get; set; } = string.Empty;

        [MaxLength(250)]
        public string Email { get; set; } = string.Empty;
        [Required]
        [MaxLength(300)]
        public string SecurityQuestion { get; set; }
        [Required]
        [MaxLength(100)]
        public string SecurityAnswer { get; set; }
        //[MaxLength(4)]
        //public string Country { get; set; } = string.Empty;
        //[MaxLength(15)]
        //public string Phone { get; set; }
    }

    public class LoginDTO
    {
        [MaxLength(250)]
        [Required]
        public string UserName { get; set; }

        [Required]
        public string Password { get; set; }
    }

    public class LoginReturnDTO
    {
        public MemberDTO Member { get; set; }
        public string Token { get; set; }
    }

    public class PostVideoDTO
    {
        [MaxLength(7000)]
        public string Describe { get; set; } = string.Empty;
        public bool AcceptComment { get; set; } = true;
        public bool AllowShare { get; set; } = true;

        [Required]
        public IFormFile Video { get; set; }
    }

    public class PostPhotoDTO
    {
        [MaxLength(7000)]
        public string Describe { get; set; } = string.Empty;
        public bool? AcceptComment { get; set; }
        public bool? AllowShare { get; set; }
        public List<string> Photos { get; set; } = new List<string>(10);

        public PostPhotoDTO()
        {
            Photos.Add(string.Empty);
            Photos.Add(string.Empty);
            Photos.Add(string.Empty);
            Photos.Add(string.Empty);
            Photos.Add(string.Empty);
            Photos.Add(string.Empty);
            Photos.Add(string.Empty);
            Photos.Add(string.Empty);
            Photos.Add(string.Empty);
            Photos.Add(string.Empty);
        }
    }

    public class PutPhotoDTO
    {
        [MaxLength(7000)]
        public string Describe { get; set; } = string.Empty;
        public bool AcceptComment { get; set; }
        public bool AllowShare { get; set; }
    }

    public class PostDTO
    {
        public Guid ID { get; set; }
        public MemberSmallDTO Owner { get; set; }
        [JsonIgnore]
        public DateTime PostDate { get; set; }
        public string PostDateDisplay
        {
            get
            {
                return PostDate.ToString("Y");
            }
        }
        public MemberPostType PostType { get; set; }
        public string Describe { get; set; } = string.Empty;
        public RecordStatus Status { get; set; } = RecordStatus.Active;
        public List<PostPhoto> Photos { get; set; } = new List<PostPhoto>();
        public bool AcceptComment { get; set; } = true;
        public bool AllowShare { get; set; } = true;
        public string VideoURL { get; set; }
        public int ReactionCount { get; set; }
        public int CommentCount { get; set; }
        public int ShareCount { get; set; }
        [JsonIgnore]
        public int Rank { get; set; }
        public bool HasReacted { get; set; }

        public PostDTO(MemberPost mp)
        {
            if (mp != null)
            {
                ID = mp.PublicID;
                Owner = new MemberSmallDTO(mp.Owner);
                PostDate = mp.PostDate;
                PostType = mp.PostType;
                Describe = mp.Describe;
                Status = mp.Status;
                Photos = new List<PostPhoto>();
                foreach (PostPhoto pp in mp.Photos)
                    Photos.Add(pp);
                AcceptComment = mp.AcceptComment;
                VideoURL = mp.VideoURL;
                AllowShare = mp.AllowShare;
                ReactionCount = mp.ReactionCount;
                CommentCount = mp.CommentCount;
                ShareCount = mp.ShareCount;
                Rank = mp.Rank;
            }
        }
    }

    public class PostCommentDTO
    {
        public Guid PostId { get; set; }
        [Required]
        [MaxLength(7999)]
        public string Comment { get; set; }
    }

    public class CommentDTO
    {
        public int ID { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime PostDate { get; set; }
        public MemberSmallDTO PostedBy { get; set; }

        public CommentDTO() { }

        public CommentDTO(MemberComment mc)
        {
            ID = mc.ID;
            Comment = mc.Comment;
            PostDate = mc.CommentDate;
            PostedBy = new MemberSmallDTO(mc.CommentedBy);
        }
    }

    public class HashtagDTO
    {
        private string _tag;
        public string Tag
        {
            get
            {
                return _tag.TrimStart("#".ToCharArray());
            }
            set
            {
                _tag = value;
            }
        }
        public int PostCount { get; set; }
    }

    public class SearchResultItem
    {
        public MemberSmallDTO Member { get; set; }
        public HashtagDTO Hashtag { get; set; }
    }

    public class CommentListPaged : PagingModel
    {
        public List<CommentDTO> CommentList { get; set; } = new List<CommentDTO>();
    }

    public class FollowerListPaged : PagingModel
    {
        public List<MemberFollowerDTO> FollowList { get; set; } = new List<MemberFollowerDTO>();
    }

    public class PostsPaged : PagingModel
    {
        public List<PostDTO> Posts { get; set; } = new List<PostDTO>();
    }

    public class MemberSmallListPaged : PagingModel
    {
        public List<MemberSmallDTO> Members { get; set; } = new List<MemberSmallDTO>();
    }

    public class ReactionListPaged : PagingModel
    {
        public List<ReactionMemberFollowerDTO> Reactions { get; set; } = new List<ReactionMemberFollowerDTO>();
    }

    public class MemberListPaged : PagingModel
    {
        public List<MemberDTO> Members { get; set; } = new List<MemberDTO>();
    }

    public class NotificationListPaged : PagingModel
    {
        public List<NotificationSmallDTO> Notifications { get; set; } = new List<NotificationSmallDTO>();
    }

    public abstract class PagingModel
    {
        public int Total { get; set; }
        public int Current { get; set; }
        public int TotalPages
        {
            get
            {
                return (int)Math.Ceiling((decimal)Total / (decimal)PageSize);
            }
        }
        public int PageSize { get; set; }
    }

    public class NotificationSmallDTO
    {
        public Guid ID { get; set; }
        public string Pic { get; set; } = string.Empty;
        public string Pic2 { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string URL { get; set; } = string.Empty;
        public DateTime CreateDate { get; set; }
        public MemberDTO Target { get; set; }
        public MemberDTO Source { get; set; }
        public PostDTO Post { get; set; }
        public CommentDTO Comment { get; set; }
        public bool Seen { get; set; }
        public MemberNotificationType Type { get; set; }
        public int PostId { get; set; }

        public NotificationSmallDTO() { }

        public NotificationSmallDTO(Notification n)
        {
            ID = n.ID;
            //Pic = n.Pic;
            //Title = n.Title;
            //Description = n.Description;
            CreateDate = n.CreateDate;
            Target = new MemberDTO(n.Target);
            Seen = n.Seen;
            Type = n.Type;
            if (n.Comment != null)
                Comment = new CommentDTO(n.Comment);
            if (n.Post != null)
                Post = new PostDTO(n.Post);
            if (n.Source != null)
                Source = new MemberDTO(n.Source);

            if (n.Type == MemberNotificationType.PostReaction
                || n.Type == MemberNotificationType.PostComment || n.Type == MemberNotificationType.FollowRequest || n.Type == MemberNotificationType.SharePost)
                Pic = string.IsNullOrEmpty(n.Source.Pic) ? "images/nopic.jpg" : n.Source.Pic;

            if (n.Type == MemberNotificationType.SharePost || n.Type == MemberNotificationType.NewPost)
            {
                Pic = n.Post.Photos[0].Photo;
                Pic2 = string.IsNullOrEmpty(n.Source.Pic) ? "images/nopic.jpg" : n.Source.Pic;
            }
            if (n.Type == MemberNotificationType.NewPost)
            {
                Title = string.Format("New post by {0}", string.IsNullOrEmpty(n.Source.Name) ? n.Source.UserName : n.Source.Name);
                URL = $"post/{n.Post.PublicID}";
            }
            else if (n.Type == MemberNotificationType.PostComment)
            {
                Title = string.Format("{0} commented on your post.", string.IsNullOrEmpty(n.Target.Name) ? n.Target.UserName : n.Target.Name);
                URL = $"post/{n.Post.PublicID}?c={n.Comment.ID}";
            }
            else if (n.Type == MemberNotificationType.PostReaction)
            {
                Title = string.Format("{0} reacted to your post.", string.IsNullOrEmpty(n.Target.Name) ? n.Target.UserName : n.Target.Name);
                URL = $"post/{n.Post.PublicID}";
            }
            else if (n.Type == MemberNotificationType.FollowRequest)
            {
                Title = $"{n.Source.Name} wants to follow you.";
                URL = $"profile?un={n.Source.UserName}";
            }
            else if (n.Type == MemberNotificationType.SharePost)
            {
                Title = $"{n.Source.Name} shared a post with you.";
                URL = $"post/{n.Post.PublicID}";
            }
        }
    }

    public class BrowserPushNotifyDTO
    {
        public string Text { get; set; }
        public string Photo { get; set; }
        public string URL { get; set; }
    }

    public class IP2LocationResult
    {
        private string _response = string.Empty;
        public string Response
        {
            get
            {
                return _response;
            }
            set
            {
                _response = value.Trim("-".ToCharArray());
            }
        }

        private string _countrycode = string.Empty;
        public string Country_Code
        {
            get { return _countrycode; }
            set
            {
                _countrycode = value.Trim("-".ToCharArray());
            }
        }

        private string _countryname = string.Empty;
        public string Country_Name
        {
            get { return _countryname; }
            set
            {
                _countryname = value.Trim("-".ToCharArray());
            }
        }

        private string _regionname = string.Empty;
        public string Region_Name
        {
            get { return _regionname; }
            set
            {
                _regionname = value.Trim("-".ToCharArray());
            }
        }

        private string _cityname = string.Empty;
        public string City_Name
        {
            get { return _cityname; }
            set
            {
                _cityname = value.Trim("-".ToCharArray());
            }
        }
        public int Credits_Consumed { get; set; }
    }

    public class CountryItem
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }
}
