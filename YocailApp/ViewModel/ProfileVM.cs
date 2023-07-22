using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace YocailApp.ViewModel
{
    public class ProfileVM : BaseVM
    {
        public string ProfilePic
        {
            get
            {
                if (!string.IsNullOrEmpty(CurrentMember.Pic))
                {
                    if (!CurrentMember.Pic.ToLower().StartsWith("http://") && !CurrentMember.Pic.ToLower().StartsWith("https://"))
                    {
                        return $"https://www.yocail.com/{CurrentMember.Pic}";
                    }
                    return CurrentMember.Pic;
                }
                else
                {
                    return string.Empty;
                }

            }
        }

        public bool ProfilePicVisible
        {
            get { return !string.IsNullOrEmpty(CurrentMember.Pic); }
        }
        public string UserName { get { return $"@{CurrentMember.UserName}"; } }

        public bool NameVisible { get {
                return !string.IsNullOrEmpty(CurrentMember.Name);
            } }
        public string Name { get { return CurrentMember.Name; } }

        public bool ThoughtStatusVisible
        {
            get
            {
                return !string.IsNullOrEmpty(CurrentMember.ThoughtStatus);
            }
        }
        public string ThoughtStatus { get { return CurrentMember.ThoughtStatus; } }
    }
}
