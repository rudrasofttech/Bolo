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
        NewPost = 1,
        PostReaction = 2,
        PostComment = 3,
        FollowRequest = 4
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
        public string Name { get; set; } = string.Empty;
        [MaxLength(250)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        [MaxLength(15)]
        public string Phone { get; set; } = string.Empty;
        [Required]
        public byte[] Password { get; set; }

        public DateTime CreateDate { get; set; }
        public DateTime? ModifyDate { get; set; }
        public RecordStatus Status { get; set; }

        public Guid PublicID { get; set; }
        [MaxLength(50)]
        [RegularExpression("^[a-zA-Z0-9_]*$", ErrorMessage = "Only alphabets, numbers and _ allowed.")]
        public string UserName { get; set; } = string.Empty;

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
        public string Bio { get; set; } = string.Empty;

        public string Pic { get; set; } = string.Empty;

        public int BirthYear { get; set; }

        [MaxLength(100)]
        public string Country { get; set; } = string.Empty;
        [MaxLength(100)]
        public string State { get; set; } = string.Empty;

        [MaxLength(100)]
        public string City { get; set; } = string.Empty;
        [MaxLength(200)]
        public string ThoughtStatus { get; set; } = string.Empty;

        public List<MemberRole> Roles { get; set; }
        [Required]
        [MaxLength(300)]
        public string  SecurityQuestion{ get; set; }
        [Required]
        public byte[] SecurityAnswer { get; set; }
        public bool IsEmailVerified { get; set; }
    }

    //public class EmailVerification
    //{
    //    public int ID { get; set; }
    //    public Member Member { get; set; }
    //    public string SecretCode { get; set; }
    //    public DateTime CreateDate { get; set; }
    //}


    public class MemberRole
    {
        public int ID { get; set; }
        public string Name { get; set; }
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
        [MaxLength(200)]
        public string Tag { get; set; }
        public Member Follower { get; set; }
        public Member Following { get; set; }
        public FollowerStatus Status { get; set; }
    }

    public class MemberPost
    {
        public int ID { get; set; }
        public Guid PublicID { get; set; }
        public Member Owner { get; set; }
        public DateTime PostDate { get; set; }
        public Member Modifier { get; set; }
        public DateTime ModifyDate { get; set; }
        public MemberPostType PostType { get; set; }
        public string Describe { get; set; } = string.Empty;
        public RecordStatus Status { get; set; } = RecordStatus.Active;
        public List<PostPhoto> Photos { get; set; } = new List<PostPhoto>();
        public bool AcceptComment { get; set; } = true;
        [MaxLength(1000)]
        public string VideoURL { get; set; }
    }

    public class HashTag
    {
        public int ID { get; set; }
        public MemberPost Post { get; set; }
        [MaxLength(200)]
        [Required]
        public string Tag { get; set; } = string.Empty;
    }

    public class PostPhoto
    {
        public int ID { get; set; }
        public string Photo { get; set; }
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
        [MaxLength(7999)]
        public string Comment { get; set; }
    }

    public class Notification
    {
        public Guid ID { get; set; } = Guid.NewGuid();
        [Required]
        public DateTime CreateDate { get; set; } = DateTime.UtcNow;
        [Required]
        public Member Target { get; set; }
        [MaxLength(200)]
        public string Text { get; set; } = string.Empty;
        public bool Seen { get; set; } = false;
        public MemberNotificationType Type { get; set; }
        public Member Source { get; set; }
        public MemberPost Post { get; set; }
        public MemberComment Comment { get; set; }
    }

    public class PushNotificationWebApp
    {
        public int ID { get; set; }
        public Member User { get; set; }
        public string Endpoint { get; set; } = string.Empty;
        public string P256dh { get; set; } = string.Empty;
        public string Auth { get; set; } = string.Empty;
    }

    public class IgnoredMember
    {
        public int ID { get; set; }
        public Member User { get; set; }
        public Member Ignored { get; set; }
        public DateTime CreateDate { get; set; } = DateTime.UtcNow;
    }

    public enum FlagTypeEnum
    {
        Abusive = 1,
        Spam = 2,
        Fake = 3,
        Nudity = 4,
        Violence = 5
    }
    public class FlaggedItem
    {
        public int ID { get; set; }
        public int PostID { get; set; }
        public Member User { get; set; }
        public DateTime CreateDate { get; set; } = DateTime.UtcNow;
        public int CommentID { get; set; }
        public int MemberID { get; set; }
        public FlagTypeEnum FlagType { get; set; }
    }

    public class DiscoverPostView
    {
        public int ID { get; set; }
    }
}
