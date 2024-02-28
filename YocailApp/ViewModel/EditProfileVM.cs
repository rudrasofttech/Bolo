
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Input;
using YocailApp.Resources.Translations;

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

        private MemberProfileVisibility _visibility = MemberProfileVisibility.Private;

        public MemberProfileVisibility Visibility
        {
            get => _visibility;

            set
            {
                if(value != _visibility)
                {
                    _visibility = value; OnPropertyChanged();
                }
            }
        }

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
        public int BirthYear { get => _birthyear; set {
                if (value != _birthyear)
                {
                    _birthyear = value;
                    OnPropertyChanged();
                }
            }
        }

        private string _securityquestion = string.Empty;
        public string SecurityQuestion
        {
            get => _securityquestion;
            set
            {
                if(value != _securityquestion)
                {
                    _securityquestion = value;
                    OnPropertyChanged();
                }
            }
        }

        private string _thoughtStatus = string.Empty;
        public string ThoughtStatus
        {
            get => _thoughtStatus;
            set
            {
                if(_thoughtStatus != value)
                {
                    _thoughtStatus= value;
                    OnPropertyChanged();
                }
            }
        }

        private string _bio = string.Empty;
        public string Bio
        {
            get => _bio;
            set
            {
                if(_bio != value)
                {
                    _bio = value;
                    OnPropertyChanged();
                }
            }
        }

        public ICommand SaveNameCommand { get; set; }
        public ICommand SaveMobileCommand { get; set; }
        public ICommand SaveThoughtStatusCommand { get; set; }
        public ICommand SaveEmailCommand { get; set; }
        public ICommand SaveBioCommand { get; set; }
        
        public EditProfileVM()
        {
            for (int i = DateTime.Now.Year - 18; i > (DateTime.Now.Year - 90); i--)
            {
                Years.Add(i);
            }

            ProfileVisibilities.Add(MemberProfileVisibility.Public);
            ProfileVisibilities.Add(MemberProfileVisibility.Private);
            SaveNameCommand = new Command(async () => {
                await SaveName();
            });
            SaveMobileCommand = new Command(async () => {
                await SaveMobile();
            });
            SaveThoughtStatusCommand = new Command(async () => { await SaveThoughtStatus(); });
            SaveEmailCommand = new Command(async () => { await SaveEmail(); });
            SaveBioCommand = new Command(async () => { await SaveBio(); });
        }

        public void LoadDateFromContext()
        {
            UserName = CurrentMember.UserName;
            Name = CurrentMember.Name;
            Phone = CurrentMember.Phone;
            Email = CurrentMember.Email;
            BirthYear = CurrentMember.BirthYear;
            Visibility = CurrentMember.Visibility;
            SecurityQuestion = CurrentMember.SecurityQuestion;
            ThoughtStatus = CurrentMember.ThoughtStatus;
            Bio = CurrentMember.Bio;
        }

        private async Task SaveBio()
        {
            try
            {
                var client = await Utility.SharedClientAsync();
                var formContent = new FormUrlEncodedContent(new[]
{
    new KeyValuePair<string, string>("d", Bio),
});

                using HttpResponseMessage response = await client.PostAsync("api/members/savebio", formContent);
                if (response.IsSuccessStatusCode)
                {
                    await Utility.ShowToast(AppRes.SaveBioMsg);
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    Application.Current.MainPage = new LoginPage();
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    await Utility.ShowToast(AppRes.MemberNotFoundMsg);
                }
                else
                {
                    await Utility.ShowToast(AppRes.SaveBioError);
                    Console.WriteLine("{0} ({1})", (int)response.StatusCode, response.ReasonPhrase);
                }
            }
            catch (System.Net.WebException)
            {
                await Utility.ShowToast(AppRes.NoInternetMsg);
            }
            catch (Exception ex)
            {
                await Utility.ShowToast(AppRes.SaveBioError);
                Console.WriteLine(ex.Message);
            }
        }

        public async Task SaveBirthYear()
        {
            try
            {
                var client = await Utility.SharedClientAsync();
                using HttpResponseMessage response = await client.GetAsync($"api/members/savebirthyear?d={BirthYear}");
                if (response.IsSuccessStatusCode)
                {
                    CurrentMember.BirthYear = BirthYear;
                    AccessSecureStorage.SetCurrentMember(JsonSerializer.Serialize(CurrentMember));
                    await Utility.ShowToast(AppRes.SaveBirthYearMsg);
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    Application.Current.MainPage = new LoginPage();
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    await Utility.ShowToast(AppRes.MemberNotFoundMsg);
                }
                else
                {
                    await Utility.ShowToast(AppRes.SaveBirthYearError);
                    Console.WriteLine("{0} ({1})", (int)response.StatusCode, response.ReasonPhrase);
                }
            }
            catch (System.Net.WebException)
            {
                await Utility.ShowToast(AppRes.NoInternetMsg);
            }
            catch (Exception ex)
            {
                await Utility.ShowToast(AppRes.SaveBirthYearError);
                Console.WriteLine(ex.Message);
            }
        }

        private async Task SaveName()
        {
            try
            {
                var client = await Utility.SharedClientAsync();
                using HttpResponseMessage response = await client.GetAsync($"api/members/savename?d={Name}");
                if (response.IsSuccessStatusCode)
                {
                    CurrentMember.Name = Name;
                    AccessSecureStorage.SetCurrentMember(JsonSerializer.Serialize(CurrentMember));
                    await Utility.ShowToast(AppRes.SaveNameMsg);
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    Application.Current.MainPage = new LoginPage();
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    await Utility.ShowToast(AppRes.MemberNotFoundMsg);
                }
                else
                {
                    await Utility.ShowToast(AppRes.SaveNameError);
                    Console.WriteLine("{0} ({1})", (int)response.StatusCode, response.ReasonPhrase);
                }
            }
            catch (System.Net.WebException)
            {
                await Utility.ShowToast(AppRes.NoInternetMsg);
            }
            catch (Exception ex)
            {
                await Utility.ShowToast(AppRes.SaveNameError);
                Console.WriteLine(ex.Message);
            }
        }

        private async Task SaveMobile()
        {
            try
            {
                var client = await Utility.SharedClientAsync();
                using HttpResponseMessage response = await client.GetAsync($"api/members/savephone?d={Phone}");
                if (response.IsSuccessStatusCode)
                {
                    CurrentMember.Phone = Phone;
                    AccessSecureStorage.SetCurrentMember(JsonSerializer.Serialize(CurrentMember));
                    await Utility.ShowToast(AppRes.SaveMobileMsg);
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    Application.Current.MainPage = new LoginPage();
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    await Utility.ShowToast(AppRes.MemberNotFoundMsg);
                }
                else
                {
                    await Utility.ShowToast(AppRes.MobileSaveError);
                    Console.WriteLine("{0} ({1})", (int)response.StatusCode, response.ReasonPhrase);
                }
            }
            catch (System.Net.WebException)
            {
                await Utility.ShowToast(AppRes.NoInternetMsg);
            }
            catch (Exception ex)
            {
                await Utility.ShowToast(AppRes.MobileSaveError);
                Console.WriteLine(ex.Message);
            }
        }

        private async Task SaveEmail()
        {
            try
            {
                var client = await Utility.SharedClientAsync();
                using HttpResponseMessage response = await client.GetAsync($"api/members/saveemail?d={Email}");
                if (response.IsSuccessStatusCode)
                {
                    CurrentMember.Email = Email;
                    AccessSecureStorage.SetCurrentMember(JsonSerializer.Serialize(CurrentMember));
                    await Utility.ShowToast(AppRes.SaveEmailMsg);
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    Application.Current.MainPage = new LoginPage();
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    await Utility.ShowToast(AppRes.MemberNotFoundMsg);
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
                {
                    await Utility.ShowToast(AppRes.SaveEmailDuplicateError);
                }
                else
                {
                    await Utility.ShowToast(AppRes.SaveEmailError);
                    Console.WriteLine("{0} ({1})", (int)response.StatusCode, response.ReasonPhrase);
                }
            }
            catch (System.Net.WebException)
            {
                await Utility.ShowToast(AppRes.NoInternetMsg);
            }
            catch (Exception ex)
            {
                await Utility.ShowToast(AppRes.SaveEmailError);
                Console.WriteLine(ex.Message);
            }
        }

        private async Task SaveThoughtStatus()
        {
            try
            {
                var client = await Utility.SharedClientAsync();
                using HttpResponseMessage response = await client.GetAsync($"api/members/savethoughtstatus?d={ThoughtStatus}");
                if (response.IsSuccessStatusCode)
                {
                    CurrentMember.ThoughtStatus = ThoughtStatus;
                    AccessSecureStorage.SetCurrentMember(JsonSerializer.Serialize(CurrentMember));
                    await Utility.ShowToast(AppRes.SaveThoughtMsg);
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    Application.Current.MainPage = new LoginPage();
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    await Utility.ShowToast(AppRes.MemberNotFoundMsg);
                }
                else
                {
                    await Utility.ShowToast(AppRes.SaveThoughtError);
                    Console.WriteLine("{0} ({1})", (int)response.StatusCode, response.ReasonPhrase);
                }
            }
            catch (System.Net.WebException)
            {
                await Utility.ShowToast(AppRes.NoInternetMsg);
            }
            catch (Exception ex)
            {
                await Utility.ShowToast(AppRes.SaveThoughtError);
                Console.WriteLine(ex.Message);
            }
        }
    }
}
