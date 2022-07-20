﻿using System;
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

        public MemberFollowerDTO() { }
        public MemberFollowerDTO(MemberFollower mf)
        {
            FollowedDate = mf.FollowedDate;
            Tag = mf.Tag;
            Follower = new MemberSmallDTO(mf.Follower);
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

        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string RecoveryQuestion { get; set; } = string.Empty;

        public int ProfileCompletePercent { get; set; }
        public string EmptyFields { get; set; } = string.Empty;

        public DateTime LastPulse { get; set; }
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
            Email = "";
        }
    }

    public class RegisterDTO
    {
        [MaxLength(50)]
        [Required]
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        [MaxLength(250)]
        public string Email { get; set; } = string.Empty;
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

    public class PostPhotoDTO
    {
        [MaxLength(7000)]
        public string Describe { get; set; } = string.Empty;
        public bool AcceptComment { get; set; } = true;
        public List<String> Photos { get; set; } = new List<string>(10);

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
    }

    public class PostDTO
    {
        public Guid ID { get; set; }
        public MemberDTO Owner { get; set; }
        public DateTime PostDate { get; set; }
        public MemberPostType PostType { get; set; }
        public string Describe { get; set; } = string.Empty;
        public RecordStatus Status { get; set; } = RecordStatus.Active;
        public List<PostPhoto> Photos { get; set; } = new List<PostPhoto>();
        public bool AcceptComment { get; set; } = true;
        public string VideoURL { get; set; }
        public int ReactionCount { get; set; }
        public int CommentCount { get; set; }
        public bool HasReacted { get; set; }

        public PostDTO(MemberPost mp)
        {
            if (mp != null)
            {
                ID = mp.PublicID;
                Owner = new MemberDTO(mp.Owner);
                PostDate = mp.PostDate;
                PostType = mp.PostType;
                Describe = mp.Describe;
                Status = mp.Status;
                Photos = new List<PostPhoto>();
                foreach (PostPhoto pp in mp.Photos)
                    Photos.Add(pp);
                AcceptComment = mp.AcceptComment;
                VideoURL = mp.VideoURL;
            }
        }
    }

    public class HashtagDTO
    {
        private string _tag;
        public string Tag { get {
                return _tag.TrimStart("#".ToCharArray());
            } set {
                _tag = value;
            } }
        public int PostCount { get; set; }
    }

    public class SearchResultItem
    {
        public MemberSmallDTO Member { get; set; }
        public HashtagDTO Hashtag { get; set; }
    }

    public class FollowerListPaged : PagingModel
    {
        public List<MemberFollowerDTO> FollowList { get; set; } = new List<MemberFollowerDTO>();
    }

    public class PostsPaged : PagingModel
    {
        public List<PostDTO> Posts { get; set; } = new List<PostDTO>();
    }

    public class MemberListPaged : PagingModel
    {
        public List<MemberSmallDTO> Members { get; set; } = new List<MemberSmallDTO>();
    }

    public class ReactionListPaged : PagingModel
    {
        public List<ReactionMemberFollowerDTO> Reactions { get; set; } = new List<ReactionMemberFollowerDTO>();
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
