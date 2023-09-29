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
    public class RegisterPageVM : BaseVM
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

        private string _email;
        public string Email
        {
            get => _email;
            set
            {
                if (_email != value)
                {
                    _email = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _emailValid = false;
        public bool EmailValid
        {
            get => _emailValid;
            set
            {
                if (_emailValid != value)
                {
                    _emailValid = value;
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

        private bool _registerBtnEnabled = true;
        public bool RegisterBtnEnabled
        {
            get { return _registerBtnEnabled; }
            set { _registerBtnEnabled = value; OnPropertyChanged(); }
        }

        public ICommand RegisterCommand { get; private set; }

        public RegisterPageVM()
        {
            RegisterCommand = new Command(OnRegister);
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
            }else if (Password.Length < 8)
            {
                PasswordValid = false;
                Error = true;
                await Utility.ShowToast("Password too small.");
                return;
            }
            EmailValid = true;
            if (string.IsNullOrEmpty(Email))
            {
                EmailValid = false;
                Error = true;
                await Utility.ShowToast("Email Missing");
                return;
            }else if (!Utility.IsValidEmail(Email))
            {
                EmailValid = false;
                Error = true;
                await Utility.ShowToast("Invalide Email");
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

        private async void OnRegister()
        {
            ValidateForm();
            if (!Error)
            {
                Loading = true;
                RegisterBtnEnabled = false;
                try
                {
                    var client = await Utility.SharedClientAsync();
                    using StringContent jsonContent = new(JsonSerializer.Serialize(new RegisterDTO() { UserName = UserName, Password = Password, Email = Email, SecurityAnswer = SecurityPassword, SecurityQuestion = SecurityQuestion }), Encoding.UTF8, "application/json");
                    using HttpResponseMessage response = await client.PostAsync("api/members/register", jsonContent);
                    if (response.IsSuccessStatusCode)
                    {
                        Application.Current.MainPage = new LoginPage() { UserNameHint = UserName, WelcomeToast = "You are now part of Yocail. Login Now" };
                    }
                    else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                    {
                        Error = true;
                        await Utility.ShowToast($"{AppRes.GenericServerErrorTxt} - 404");
                    }
                    else if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
                    {
                        Error = true;
                        HttpContent content = response.Content;
                        string result = await content.ReadAsStringAsync();
                        JsonSerializerOptions l = new JsonSerializerOptions() { PropertyNameCaseInsensitive = true };
                        var err = JsonSerializer.Deserialize<ErrorResultDTO>(result, l);
                        await Utility.ShowToast(err.Error, ToastDuration.Long);
                    }
                    else
                    {
                        Error = true;
                        await Utility.ShowToast(AppRes.GenericServerErrorTxt);
                        Console.WriteLine("{0} ({1})", (int)response.StatusCode, response.ReasonPhrase);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error: {ex.Message}");
                    Error = true;
                    await Utility.ShowToast(AppRes.GenericServerErrorTxt);
                }
                finally
                {
                    Loading = false;
                    RegisterBtnEnabled = true;
                }
            }
        }

        
    }
}
