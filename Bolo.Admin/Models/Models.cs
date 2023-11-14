using System.ComponentModel.DataAnnotations;

namespace Bolo.Admin
{
    public enum MessageType
    {
        None,
        Success,
        Error,
        Warning,
        Information
    }
}
namespace Bolo.Admin.Models
{
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

    public class LoginReturnDTO
    {
        public MemberDTO Member { get; set; }
        public string Token { get; set; } = string.Empty;
    }

    public class LoginDTO
    {
        [MaxLength(250)]
        [Required]
        public string UserName { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
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
        public string CountryName { get; set; } = string.Empty;
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
    }

    public class ProfileEmail
    {
        public Guid ID { get; set; }
        public string Email { get; set; } = string.Empty;
    }

    public class ProfilePhone
    {
        public Guid ID { get; set; }
        public string Phone { get; set; } = string.Empty;
    }

    public class ProfileLink
    {
        public Guid ID { get; set; }
        public string URL { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    public class MemberListPaged : PagingModel
    {
        public List<MemberDTO> Members { get; set; } = new List<MemberDTO>();
    }
}
