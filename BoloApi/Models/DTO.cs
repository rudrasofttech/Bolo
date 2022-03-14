using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
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

    public class MemberDTO
    {
        public Guid ID { get; set; }
        public string Name { get; set; }
        public string ChannelName { get; set; }
        public string Bio { get; set; }
        public int BirthYear { get; set; }
        public Gender Gender { get; set; }
        public ActivityStatus Activity { get; set; }
        public MemberProfileVisibility Visibility { get; set; }
        public string Pic { get; set; }
        public string Country { get; set; }
        public string State { get; set; }
        public string City { get; set; }
        public string ThoughtStatus { get; set; }
        public int PostCount { get; set; }
        public int FollowerCount { get; set; }
        public int FollowingCount { get; set; }

        public string Phone { get; set; }
        public string Email { get; set; }

        public DateTime LastPulse { get; set; }
        public MemberDTO()
        {
            ID = Guid.Empty;
            Name = string.Empty;
            ChannelName = string.Empty;
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
            ChannelName = string.IsNullOrEmpty(m.Channelname) ? "" : m.Channelname.ToLower();
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
            Email = "";
        }
    }

    public class RegisterDTO
    {
        [MaxLength(200)]
        [Required(ErrorMessage = "Name is missing.")]
        public string Name { get; set; }
        
        [MaxLength(15, ErrorMessage = "Phone too long")]
        public string Phone { get; set; }
        [MaxLength(4, ErrorMessage = "Incorrect Country Code")]
        public string CountryCode { get; set; } = "91";
        [MinLength(8, ErrorMessage = "Should have 8 letters or more")]
        public string Password { get; set; } = string.Empty;
        [Compare("Password", ErrorMessage ="Should match Password")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class LoginDTO
    {
        [MaxLength(250)]
        [Required]
        public string ID { get; set; }

        [Required]
        public string Passcode { get; set; }
    }

    public class LoginReturnDTO
    {
        public MemberDTO Member { get; set; }
        public string Token { get; set; }
    }

    public class PostPhotoDTO
    {
        public string Caption { get; set; } = string.Empty;
        public List<String> Photos { get; set; } = new List<string>();
    }

    public class PutPhotoDTO
    {
        public string Caption { get; set; } = string.Empty;
    }

    public class PostListItem
    {
        public int ID { get; set; }
        public string Photo { get; set; } = string.Empty;
    }

    public class DiscoverPaged : PagingModel
    {
        public List<PostListItem> Posts { get; set; } = new List<PostListItem>();
    }

    public class MyPostListItem
    {
        public int ID { get; set; }
        public string Photo { get; set; } = string.Empty;
    }

    public class MyPostsPaged : PagingModel
    {
        public List<MyPostListItem> Posts { get; set; } = new List<MyPostListItem>();
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
}
