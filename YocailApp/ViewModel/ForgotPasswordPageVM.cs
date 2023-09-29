using CommunityToolkit.Maui.Alerts;
using CommunityToolkit.Maui.Core;
using System.Text.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Input;
using YocailApp.Resources.Translations;

namespace YocailApp.ViewModel
{
    public class ForgotPasswordPageVM : BaseVM
    {
        private string _securitypassword;
        public string SecurityPassword
        {
            get => _securitypassword;
            set
            {
                if (_securitypassword != value)
                {
                    _securitypassword = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _securitypasswordValid = false;
        public bool SecurityPasswordValid
        {
            get => _securitypasswordValid;
            set
            {
                if (_securitypasswordValid != value)
                {
                    _securitypasswordValid = value;
                    OnPropertyChanged();
                }
            }
        }

        private string _securityquestion;
        public string SecurityQuestion
        {
            get => _securityquestion;
            set
            {
                if (_securityquestion != value)
                {
                    _securityquestion = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _securityquestionValid = false;
        public bool SecurityQuestionValid
        {
            get => _securityquestionValid;
            set
            {
                if (_securityquestionValid != value)
                {
                    _securityquestionValid = value;
                    OnPropertyChanged();
                }
            }
        }

        private string _username;
        public string UserName
        {
            get => _username;
            set
            {
                if (_username != value)
                {
                    _username = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _usernameValid = false;
        public bool UserNameValid
        {
            get => _usernameValid;
            set
            {
                if (_usernameValid != value)
                {
                    _usernameValid = value;
                    OnPropertyChanged();
                }
            }
        }

        private string _usernameValidMessage = string.Empty;
        public string UserNameValidMessage
        {
            get => _usernameValidMessage;
            set
            {
                if (_usernameValidMessage != value)
                {
                    _usernameValidMessage = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _passwordValid = false;
        public bool PasswordValid
        {
            get => _passwordValid;
            set
            {
                if (_passwordValid != value)
                {
                    _passwordValid = value;
                    OnPropertyChanged();
                }
            }
        }

        private string _password;
        public string Password
        {
            get => _password;
            set
            {
                if (_password != value)
                {
                    _password = value;
                    OnPropertyChanged();
                }
            }
        }

        private string _passwordValidMessage = string.Empty;
        public string PasswordValidMessage
        {
            get => _passwordValidMessage;
            set
            {
                if (_passwordValidMessage != value)
                {
                    _passwordValidMessage = value;
                    OnPropertyChanged();
                }
            }
        }

        public ICommand SetPasswordCommand { get; private set; }
        public ICommand LoadMemberCommand { get; private set; }

        public ForgotPasswordPageVM()
        {
            SetPasswordCommand = new Command(this.OnSetPassword);
        }

        private async void ValidateForm()
        {
            UserNameValid = true;
            if (string.IsNullOrEmpty(UserName))
            {
                UserNameValid = false;
                Error = true;
                await Utility.ShowToast("Username Missing");
                return;
            }
            PasswordValid = true;
            if (string.IsNullOrEmpty(Password))
            {
                PasswordValid = false;
                Error = true;
                await Utility.ShowToast("Password Missing");
                return;
            }
            
            SecurityQuestionValid = true;
            if (string.IsNullOrEmpty(SecurityQuestion))
            {
                SecurityQuestionValid = false;
                Error = true;
                await Utility.ShowToast("Security question missing");
                return;
            }
            else if (SecurityQuestion.Length <= 3)
            {
                SecurityPasswordValid = false;
                Error = true;
                await Utility.ShowToast("Security question too small");
                return;
            }
            SecurityPasswordValid = true;
            if (string.IsNullOrEmpty(SecurityPassword))
            {
                SecurityPasswordValid = false;
                Error = true;
                await Utility.ShowToast("Security Password missing");
                return;
            }else if (SecurityPassword.Length <= 3)
            {
                SecurityPasswordValid = false;
                Error = true;
                await Utility.ShowToast("Security password too small");
                return;
            }
            Error = false;
            ErrorMessage = string.Empty;
        }

        private async void OnSetPassword()
        {
            ValidateForm();
            if (!Error)
            {
                Loading = true;
                try
                {
                    var client = await Utility.SharedClientAsync();
                    using StringContent jsonContent = new(JsonSerializer.Serialize(new LoginDTO() { UserName = UserName, Password = Password }), Encoding.UTF8, "application/json");
                    using HttpResponseMessage response = await client.PostAsync("api/Members/Login", jsonContent);
                    if (response.IsSuccessStatusCode)
                    {
                        HttpContent content = response.Content;
                        string result = await content.ReadAsStringAsync();
                        JsonSerializerOptions l = new JsonSerializerOptions() { PropertyNameCaseInsensitive = true };
                        var loginresult = JsonSerializer.Deserialize<LoginReturnDTO>(result, l);
                        AccessSecureStorage.SetAuthToken(loginresult.Token);
                        AccessSecureStorage.SetCurrentMember(JsonSerializer.Serialize(loginresult.Member));

                        Utility.ClearCachedData();

                        Application.Current.MainPage = new AppShell();
                    }
                    else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                    {
                        Error = true;
                        await Utility.ShowToast(AppRes.UserNotFoundTxt);
                    }
                    else if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
                    {
                        Error = true;
                        await Utility.ShowToast(AppRes.UserLoginBadRequestTxt);
                    }
                    else
                    {
                        Error = true;
                        await Utility.ShowToast(AppRes.UserLoginBadRequestTxt);
                        Console.WriteLine("{0} ({1})", (int)response.StatusCode, response.ReasonPhrase);
                    }
                }
                catch (Exception)
                {

                }
                finally
                {
                    Loading = false;
                }
            }
        }

        
    }
}
