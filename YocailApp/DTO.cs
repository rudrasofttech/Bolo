
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace YocailApp
{
    public enum MemberPostType
    {
        Photo = 1,
        Video = 2
    }
    public enum ActivityStatus
    {
        Online = 1,
        Meeting = 2,
        Broadcast = 3,
        Chat = 4,
        Offline = 5
    }
    public enum RecordStatus
    {
        Active = 1,
        Unverified = 2,
        Inactive = 3,
        Deleted = 4
    }

    public enum FollowerStatus
    {
        Active = 1,
        Requested = 2,

        NotFollowing = 10
    }

    public enum PostReactionType
    {
        Like = 1
    }
    public enum MemberProfileVisibility
    {
        Private = 1,
        Public = 2
    }

    public enum Gender
    {
        Male = 1,
        Female = 2,
        Other = 3
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
        public MemberModel Member { get; set; }
        public string Token { get; set; }
    }

    public class MemberModel
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
        public MemberModel()
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
    }

    public class MemberSmallModel
    {
        public Guid ID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Pic { get; set; } = string.Empty;
        public string PicPathConverted
        {
            get
            {
                if (!string.IsNullOrEmpty(Pic))
                {
                    if(!Pic.ToLower().StartsWith("http://") && !Pic.ToLower().StartsWith("https://"))
                    {
                        return $"https://www.yocail.com/{Pic}";
                    }
                    return Pic;
                }
                else
                {
                    return "nopic.png";
                }
                
            }
        }
        /// <summary>
        /// Should be true if the member seeing this member info is a follower or not
        /// </summary>
        public MemberSmallModel()
        {
            ID = Guid.Empty;
            Name = string.Empty;
            UserName = string.Empty;
            Pic = string.Empty;
        }

    }

    public class PostModel
    {
        public Guid ID { get; set; }
        public MemberSmallModel Owner { get; set; }
        public string PostDateDisplay
        {
            get; set;
        } = string.Empty;
        public MemberPostType PostType { get; set; } = MemberPostType.Photo;
        public string Describe { get; set; } = string.Empty;
        public RecordStatus Status { get; set; } = RecordStatus.Active;
        public List<PostPhoto> Photos { get; set; } = new List<PostPhoto>();
        public bool AcceptComment { get; set; } = true;
        public bool AllowShare { get; set; } = true;
        public string VideoURL { get; set; }
        public int ReactionCount { get; set; }
        public int CommentCount { get; set; }
        public int ShareCount { get; set; }
        public bool HasReacted { get; set; }

        public PostModel()
        {

        }
    }

    public class PostPhoto
    {
        public int ID { get; set; }
        public string Photo { get; set; }
    }

    public class PostsPaged : PagingModel
    {
        public List<PostModel> Posts { get; set; } = new List<PostModel>();
    }
}
