using GeoAPI.Geometries;
using Microsoft.EntityFrameworkCore.Storage;
using NetTopologySuite.Geometries;
using Newtonsoft.Json;
using Org.BouncyCastle.Asn1.Mozilla;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Bolo.Models
{
    public enum BoloRelationType
    {

        Temporary = 1,
        Confirmed = 2,
        Search = 3,
        Blocked = 4
    }
    public enum ChatMessageType
    {
        Text = 1,
        Photo = 2,
        Video = 3,
        Audio = 4,
        Document = 5
    }

    public enum MemberNotificationType
    {
        None = 0,
        Message = 1,
        System = 2
    }

    public enum ChatMessageSentStatus
    {
        Sent = 1,
        Received = 2,
        Seen = 3
    }
    /// <summary>
    /// This enum indicates what is member current logged in status on the site
    /// </summary>
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
    public class Member
    {
        public int ID { get; set; }
        [MaxLength(200)]
        public string Name { get; set; }
        [EmailAddress]
        public string Email { get; set; }
        [MaxLength(15)]
        public string Phone { get; set; }
        [MaxLength(4)]
        public string CountryCode { get; set; }
        [MaxLength(250)]
        public string OTP { get; set; }
        public DateTime OTPExpiry { get; set; }
        public DateTime CreateDate { get; set; }
        public DateTime? ModifyDate { get; set; }
        public RecordStatus Status { get; set; }

        public Guid PublicID { get; set; }
        [MaxLength(100)]
        [RegularExpression("^[a-zA-Z][a-zA-Z0-9]*$", ErrorMessage = "Channel should only have english alphabets and numbers.")]
        public string Channelname { get; set; }

        /// <summary>
        /// This will tell if the member is online, in a meeting or broadcasting or offline
        /// </summary>
        public ActivityStatus Activity { get; set; }
        /// <summary>
        /// Member when online should always send a pulse at set interval
        /// </summary>
        public DateTime LastPulse { get; set; }

        public MemberProfileVisibility Visibility { get; set; }

        public Gender Gender { get; set; }

        [MaxLength(1000)]
        public string Bio { get; set; }

        public string Pic { get; set; }

        public int BirthYear { get; set; }

        [MaxLength(100)]
        public string Country { get; set; }
        [MaxLength(100)]
        public string State { get; set; }

        [MaxLength(100)]
        public string City { get; set; }
        [MaxLength(200)]
        public string ThoughtStatus { get; set; }
    }

    public class Meeting
    {
        public int ID { get; set; }
        public Member Owner { get; set; }
        public DateTime CreateDate { get; set; }
        public string PublicID { get; set; }

        public RecordStatus Status { get; set; }
        [MaxLength(50)]
        public String Name { get; set; }
        [MaxLength(250)]
        public string Purpose { get; set; }

    }

    public class MemberNotification
    {
        public Guid ID { get; set; }
#pragma warning disable CS8632 // The annotation for nullable reference types should only be used in code within a '#nullable' annotations context.
        public Member? SentBy { get; set; }
#pragma warning restore CS8632 // The annotation for nullable reference types should only be used in code within a '#nullable' annotations context.
        public Member SentTo { get; set; }
        public DateTime SentDate { get; set; }
        public string Message { get; set; }
        public MemberNotificationType NotificationType { get; set; }
    }
    public class MemberNotificationDTO
    {
        public Guid ID { get; set; }
        public MemberDTO SentByMember { get; set; }
        public DateTime SentDate { get; set; }
        public string Message { get; set; }
        public MemberNotificationType NotificationType { get; set; }

        public MemberNotificationDTO()
        {
            ID = Guid.Empty;
            SentByMember = null;
            SentDate = DateTime.MinValue;
            Message = string.Empty;
            NotificationType = MemberNotificationType.None;
        }

        public MemberNotificationDTO(MemberNotification mn)
        {
            ID = mn.ID;
            SentByMember = mn.SentBy != null ? new MemberDTO(mn.SentBy) : null;
            SentDate = mn.SentDate;
            Message = mn.Message;
            NotificationType = mn.NotificationType;
        }
    }
    public class ChatMessage
    {
        public int ID { get; set; }
        public Member SentBy { get; set; }
        public Member SentTo { get; set; }
        public DateTime SentDate { get; set; }
        public string Message { get; set; }
        public ChatMessageType MessageType { get; set; }
        public ChatMessageSentStatus SentStatus { get; set; }
        public Guid PublicID { get; set; }

        public ChatMessage()
        {
            PublicID = Guid.NewGuid();
            Message = String.Empty;
            MessageType = ChatMessageType.Text;
        }
    }

    public class ChatMessageDTO
    {
        public Guid ID { get; set; }
        public MemberDTO SentBy { get; set; }
        public DateTime SentDate { get; set; }
        public string Message { get; set; }
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

    public class Contact
    {
        public int ID { get; set; }
        public Member Owner { get; set; }
        public DateTime CreateDate { get; set; }
        public BoloRelationType BoloRelation { get; set; }
        public Member Person { get; set; }
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

    public class CreateMeetingDTO
    {
        [MaxLength(50)]
        public String Name { get; set; }
        [MaxLength(250)]
        public string Purpose { get; set; }
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

    public class MeetingDTO
    {
        public MemberDTO Owner { get; set; }
        public DateTime CreateDate { get; set; }
        public string ID { get; set; }

        public String Name { get; set; }
        [MaxLength(250)]
        public string Purpose { get; set; }

    }

    public class RegisterDTO
    {
        [MaxLength(200)]
        [Required(ErrorMessage = "Name is missing.")]
        public string Name { get; set; }
        [EmailAddress(ErrorMessage = "Incorrect Email")]
        public string Email { get; set; }
        [MaxLength(15, ErrorMessage = "Phone too long")]
        public string Phone { get; set; }
        [MaxLength(4, ErrorMessage = "Incorrect Country Code")]
        public string CountryCode { get; set; }
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

    public class EmailConfiguration
    {
        public string From { get; set; }
        public string SmtpServer { get; set; }
        public int Port { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
    }
}
