
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

    public class PostCommentDTO
    {
        public Guid PostId { get; set; }
        [Required]
        [MaxLength(7999)]
        public string Comment { get; set; }
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
        public string PicFormedURL { get; set; } = string.Empty;

        public MemberModel()
        {
            ID = Guid.Empty;
            Name = string.Empty;
            UserName = string.Empty;
            Bio = string.Empty;
            Pic = string.Empty;
            Country = string.Empty;
            State = string.Empty;
            City = string.Empty;
            ThoughtStatus = string.Empty;
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
                    if (!Pic.ToLower().StartsWith("http://") && !Pic.ToLower().StartsWith("https://"))
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

        public bool HasPic
        {
            get
            {
                return !string.IsNullOrEmpty(Pic);
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

        public string PhotoURLTransformed
        {
            get
            {
                if (!Photo.ToLower().StartsWith("http://") && !Photo.ToLower().StartsWith("https://"))
                {
                    return $"https://www.yocail.com/{Photo}";
                }
                else
                {
                    return Photo;
                }
            }
        }
    }

    public class PostsPaged : PagingModel
    {
        public List<PostModel> Posts { get; set; } = new List<PostModel>();
    }

    public class AddReactionDTO
    {
        public bool HasReacted { get; set; }
        public int ReactionCount { get; set; }
    }

    public class CommentDTO
    {
        public int ID { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime PostDate { get; set; }

        public string PostDateDisplay
        {
            get
            {
                if (PostDate.ToLocalTime().Year == DateTime.Now.Year && PostDate.ToLocalTime().Month == DateTime.Now.Month && PostDate.ToLocalTime().Day == DateTime.Now.Day)
                {
                    return PostDate.ToLocalTime().ToString("t");
                }
                else
                {
                    return PostDate.ToLocalTime().ToString("d MMM yy");
                }

            }
        }
        public MemberSmallModel PostedBy { get; set; }

        public CommentDTO() { }
    }

    public class CommentListPaged : PagingModel
    {
        public List<CommentDTO> CommentList { get; set; } = new List<CommentDTO>();
    }

    public class HashtagModel
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
        public MemberSmallModel Member { get; set; }
        public HashtagModel Hashtag { get; set; }
    }

    public class SearchResultItemVM
    {
        public SearchResultItem Item { get; set; }
        public bool IsPerson
        {
            get
            {
                return Item.Member != null;
            }
        }
        public bool IsHashTag
        {
            get
            {
                return Item.Hashtag != null;
            }
        }

        public string Text
        {
            get
            {
                if (IsPerson)
                {
                    return Item.Member.UserName;
                }
                if (IsHashTag)
                {
                    return Item.Hashtag.Tag;
                }

                return string.Empty;

            }
        }

        public string SubText
        {
            get
            {
                if (IsPerson)
                {
                    return Item.Member.Name;
                }
                return string.Empty;
            }
        }

        public string Pic
        {
            get
            {
                if (IsPerson)
                {
                    return Item.Member.PicPathConverted;
                }
                if (IsHashTag)
                {
                    return "hash.svg";
                }
                return string.Empty;
            }
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

    public class ErrorResultDTO
    {
        public string Error { get; set; } = string.Empty;
    }

    public class DevicePhoto
    {
        public string Size { get; set; } =  string.Empty;
        public string RelativePath { get; set; } = string.Empty;
        public string URI { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string DateAdded { get; set; } = string.Empty;

        public DevicePhoto(string uri, string displayName, string dateAdded, string size, string relativePath)
        {
            URI = uri;
            DisplayName = displayName;
            DateAdded = dateAdded;
            RelativePath = relativePath;
            Size = size;
        }
    }

}
