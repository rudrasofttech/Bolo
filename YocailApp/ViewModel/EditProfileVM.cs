
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace YocailApp.ViewModel
{
    public class EditProfileVM : BaseVM
    {
        private string _username = string.Empty;
        public string UserName
        {
            get { return _username; }
            set
            {
                if (value != _username)
                {
                    _username = value; OnPropertyChanged();
                }
            }
        }

        private string _name = string.Empty;
        public string Name
        {
            get { return _name; }
            set
            {
                if (value != _name)
                {
                    _name = value; OnPropertyChanged();
                }
            }
        }

        public List<MemberProfileVisibility> ProfileVisibilities { get; set; } = new List<MemberProfileVisibility>();

        public List<int> Years { get; set; } = new List<int>();
        public string ProfilePic
        {
            get
            {
                if (string.IsNullOrEmpty(CurrentMember.Pic))
                    return "nopic.png";
                else
                    return CurrentMember.Pic;
            }
        }

        private string _phone = string.Empty;
        public string Phone
        {
            get => _phone; set
            {
                if (value != _phone)
                {
                    _phone = value;
                    OnPropertyChanged();
                }
            }
        }

        private string _email = string.Empty;
        public string Email { get => _email; set {
                if (value != _email)
                {
                    _email = value;
                    OnPropertyChanged();
                }
            } 
        }

        private int _birthyear;
        public int Birthyear { get => _birthyear; set {
                if (value != _birthyear)
                {
                    _birthyear = value;
                    OnPropertyChanged();
                }
            }
        }

        
        public EditProfileVM()
        {
            for (int i = DateTime.Now.Year - 18; i > (DateTime.Now.Year - 90); i--)
            {
                Years.Add(i);
            }

            ProfileVisibilities.Add(MemberProfileVisibility.Public);
            ProfileVisibilities.Add(MemberProfileVisibility.Private);
        }

        public void LoadDateFromContext()
        {
            UserName = CurrentMember.UserName;
            Name = CurrentMember.Name;
            Phone = CurrentMember.Phone;
            Email = CurrentMember.Email;
            Birthyear = CurrentMember.BirthYear;
        }
    }
}
