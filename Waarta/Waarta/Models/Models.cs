using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data.SqlTypes;
using System.IO;
using System.Text;
using Waarta.Resources;
using Xamarin.Forms;

namespace Waarta.Models
{

    public enum BoloRelationType
    {
        Temporary = 1,
        Mutual = 2,
        Search = 3
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

    public enum MemberProfileVisibility
    {
        Private = 1,
        Public = 2
    }

    public enum ChatMessageType
    {
        Text = 1,
        Photo = 2,
        Video = 3,
        Audio = 4,
        Document = 5
    }
    public enum ChatMessageSentStatus
    {
        Pending = 0,
        Sent = 1,
        Received = 2,
        Seen = 3,
    }

    public enum FileDownloadStatus
    {
        None,
        Downloading,
        Downloaded
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

        [JsonIgnore]
        public string Name
        {
            get
            {
                return Person.Name;
            }
        }

        [JsonIgnore]
        public ImageSource Image
        {
            get
            {
                return Person.Image;
            }
        }

        [JsonIgnore]
        public String OnlineStatus
        {
            get
            {
                return Person.OnlineStatus;
            }
        }
        public List<ChatMessageDTO> MessagesOnServer { get; set; }

        [JsonIgnore]
        public String ShortIntro
        {
            get
            {
                if (!string.IsNullOrEmpty(RecentMessage))
                {
                    return RecentMessage.Substring(0, RecentMessage.Length > 50 ? 50 : RecentMessage.Length);
                }
                else if (!string.IsNullOrEmpty(Person.ThoughtStatus))
                {
                    return Person.ThoughtStatus;
                }
                else
                {
                    StringBuilder sb = new StringBuilder();
                    if (!string.IsNullOrEmpty(Person.City))
                    {
                        sb.Append(Person.City);
                        sb.Append(" ");
                    }
                    if (!string.IsNullOrEmpty(Person.State))
                    {
                        sb.Append(Person.State);
                        sb.Append(" ");
                    }
                    if (!string.IsNullOrEmpty(Person.Country))
                    {
                        sb.Append(Person.Country);
                    }

                    return sb.ToString();
                }
            }
        }
        [JsonIgnore]
        public bool HasUnseenMessages
        {
            get
            {
                return UnseenMessageCount > 0;
            }
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

        [JsonIgnore]
        public Xamarin.Forms.ImageSource Image
        {
            get
            {
                if (!string.IsNullOrEmpty(Pic))
                {
                    string temp = Pic;
                    if (Pic.IndexOf("base64,") > -1)
                    {
                        temp = Pic.Substring(Pic.IndexOf("base64,") + 7, Pic.Length - (Pic.IndexOf("base64,") + 7));
                    }
                    return ImageSource.FromStream(() => new MemoryStream(Convert.FromBase64String(temp)));
                }
                else
                {
                    return ImageSource.FromFile("nopic.jpg");
                }
            }
        }

        [JsonIgnore]
        public String OnlineStatus
        {
            get
            {
                if (Activity == ActivityStatus.Offline)
                {
                    return AppResource.UniOfflineText;
                }
                else
                {
                    return AppResource.UniOnlineText;
                }
            }
        }

        [JsonIgnore]
        public string Location
        {
            get
            {

                StringBuilder sb = new StringBuilder();
                if (!string.IsNullOrEmpty(City))
                {
                    sb.Append(City);
                    sb.Append(" ");
                }
                if (!string.IsNullOrEmpty(State))
                {
                    sb.Append(State);
                    sb.Append(" ");
                }
                if (!string.IsNullOrEmpty(Country))
                {
                    sb.Append(Country);
                }

                return sb.ToString();

            }
        }
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
    }

    public class ChatMessage
    {
        public Guid ID { get; set; }
        public Guid Sender { get; set; }
        private string _text;
        public string Text
        {
            get { return _text; }
            set
            {
                _text = value;
                string temp = _text.Trim().ToLower();
                if (temp.StartsWith("https://waarta.com/data/"))
                {
                    if (temp.EndsWith(".jpg") || temp.EndsWith(".jpeg") || temp.EndsWith(".png") || temp.EndsWith(".gif") || temp.EndsWith(".bmp"))
                    {
                        MessageType = ChatMessageType.Photo;
                    }
                    else if (temp.EndsWith(".mp3"))
                    {
                        MessageType = ChatMessageType.Audio;
                    }
                    else if (temp.EndsWith(".ogg") || temp.EndsWith(".mp4") || temp.EndsWith(".webm") || temp.EndsWith(".mov"))
                    {
                        MessageType = ChatMessageType.Video;
                    }
                    else
                    {
                        MessageType = ChatMessageType.Document;
                    }
                }
                else
                {
                    MessageType = ChatMessageType.Text;
                }
            }
        }
        public DateTime TimeStamp { get; set; }
        public ChatMessageSentStatus Status { get; set; }
        public ChatMessageType MessageType { get; set; }

        /// <summary>
        /// 
        /// </summary>
        [JsonIgnore]
        public string Thumbnail
        {
            get
            {
                if (MessageType == ChatMessageType.Video)
                {
                    if (!string.IsNullOrEmpty(LocalPath) && File.Exists(LocalPath.Replace(Path.GetExtension(LocalPath), "-thumb.jpg")))
                    {
                        return LocalPath.Replace(Path.GetExtension(LocalPath), "-thumb.jpg");
                    }
                    else
                    {
                        return Text.Replace(Path.GetExtension(Text), "-thumb.jpg");
                    }
                }
                else
                {
                    return string.Empty;
                }
            }
        }
        public string LocalPath { get; set; }

        public FileDownloadStatus FileDownloadStatus
        {
            get; set;
        }

        public ChatMessage()
        {
            MessageType = ChatMessageType.Text;
            LocalPath = string.Empty;
            FileDownloadStatus = FileDownloadStatus.None;
        }
    }

    public class MeetingChatMessage
    {
        public Guid ID { get; set; }
        public UserInfo Sender { get; set; }
        private string _text;
        public string Text
        {
            get { return _text; }
            set
            {
                _text = value;
                string temp = _text.Trim().ToLower();
                if (temp.StartsWith("https://waarta.com/api/meetings/media/"))
                {
                    if (temp.EndsWith(".jpg") || temp.EndsWith(".jpeg") || temp.EndsWith(".png") || temp.EndsWith(".gif") || temp.EndsWith(".bmp"))
                    {
                        MessageType = ChatMessageType.Photo;
                    }
                    else if (temp.EndsWith(".mp3"))
                    {
                        MessageType = ChatMessageType.Audio;
                    }
                    else if (temp.EndsWith(".ogg") || temp.EndsWith(".mp4") || temp.EndsWith(".webm") || temp.EndsWith(".mov"))
                    {
                        MessageType = ChatMessageType.Video;
                    }
                    else
                    {
                        MessageType = ChatMessageType.Document;
                    }
                }
                else
                {
                    MessageType = ChatMessageType.Text;
                }
            }
        }
        public DateTime TimeStamp { get; set; }
        public ChatMessageSentStatus Status { get; set; }
        public ChatMessageType MessageType { get; set; }

        /// <summary>
        /// 
        /// </summary>
        [JsonIgnore]
        public string Thumbnail
        {
            get
            {
                if (MessageType == ChatMessageType.Video)
                {
                    if (!string.IsNullOrEmpty(LocalPath) && File.Exists(LocalPath.Replace(Path.GetExtension(LocalPath), "-thumb.jpg")))
                    {
                        return LocalPath.Replace(Path.GetExtension(LocalPath), "-thumb.jpg");
                    }
                    else
                    {
                        return Text.Replace(Path.GetExtension(Text), "-thumb.jpg");
                    }
                }
                else
                {
                    return string.Empty;
                }
            }
        }
        public string LocalPath { get; set; }

        public FileDownloadStatus FileDownloadStatus
        {
            get; set;
        }

        public MeetingChatMessage()
        {
            MessageType = ChatMessageType.Text;
            LocalPath = string.Empty;
            FileDownloadStatus = FileDownloadStatus.None;
        }
    }

    public class MeetingDTO
    {
        public MemberDTO Owner { get; set; }
        public string ID { get; set; }
        public string Name { get; set; }
        public string Purpose { get; set; }
        public DateTime CreateDate { get; set; }
    }

    public class PostMeetingResult
    {
        public string id { get; set; }
    }

    public class DownloadedChunk
    {
        public string Data { get; set; }
        public long Position { get; set; }
        public long Length { get; set; }
        public DownloadedChunk()
        {
            Data = string.Empty;
        }
    }


    public class UserInfo
    {
        public string MemberID
        {
            get; set;
        }
        public string ConnectionID
        {
            get; set;
        }
        public string Name
        {
            get; set;
        }

        public string Pic
        {
            get; set;
        }
        public bool VideoCapable { get; set; }
        public bool PeerCapable { get; set; }
    }
}
