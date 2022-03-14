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
    public enum MemberPostType
    {
        Photo = 1,
        Video = 2
    }
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

    public enum PostReactionType
    {
        Like = 1,
        Dislike = 2
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

    public class SmtpSetting
    {
        public string From { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string Host { get; set; }
        public int Port { get; set; }
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

    public class MemberPost
    {
        public int ID { get; set; }
        public Guid PublicID { get; set; } = Guid.NewGuid();
        public Member Owner { get; set; }
        public DateTime PostDate { get; set; }
        public Member Modifier { get; set; }
        public DateTime ModifyDate { get; set; }
        public MemberPostType PostType { get; set; }
        public string Describe { get; set; } = string.Empty;
        public RecordStatus Status { get; set; } = RecordStatus.Active;
        public List<PostPhoto> Photos { get; set; } = new List<PostPhoto>();
        [MaxLength(1000)]
        public string VideoURL { get; set; }
    }

    public class PostPhoto
    {
        public int ID { get; set; }
        public string Photo { get; set; }
    }

    public class Contact
    {
        public int ID { get; set; }
        public Member Owner { get; set; }
        public DateTime CreateDate { get; set; }
        public BoloRelationType BoloRelation { get; set; }
        public Member Person { get; set; }
    }

    public class EmailConfiguration
    {
        public string From { get; set; }
        public string SmtpServer { get; set; }
        public int Port { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
    }

    public class SearchResultPost
    {
        public string URL { get; set; }
        public string Text { get; set; }
        public string Description { get; set; }
    }

    public class MemberFollower
    {
        public int ID { get; set; }
        public DateTime FollowedDate { get; set; }
        public Member Follower { get; set; }
        public Member Following { get; set; }
        public RecordStatus Status { get; set; }
    }

    public class MemberReaction
    {
        public int ID { get; set; }
        public DateTime ReactionDate { get; set; }
        public Member ReactedBy { get; set; }
        public PostReactionType Reaction { get; set; }
        public MemberPost Post { get; set; }
        public MemberComment Comment { get; set; }

    }

    public class MemberComment
    {
        public int ID { get; set; }
        public DateTime CommentDate { get; set; }
        public Member CommentedBy { get; set; }
        public MemberPost Post { get; set; }
    }

    public class DiscoverPostView
    {
        public int ID { get; set; }
        public Guid PublicID { get; set; }
        public int Reactions { get; set; }
        public DateTime PostDate { get; set; }
        public int OwnerID { get; set; }

        public string PhotoURL { get; set; }
        public string VideoURL { get; set; }
        public MemberPostType PostType { get; set; }
    }
}
