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
    public class LoginPageVM : BaseVM
    {
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

        public ICommand SubmitLoginCommand { get; private set; }

        public LoginPageVM()
        {
            SubmitLoginCommand = new Command(this.OnLogin);
        }

        private void ValidateForm()
        {
            UserNameValid = true;
            if (string.IsNullOrEmpty(UserName))
            {
                UserNameValid = false;
                Error = true;
                ErrorMessage = "Username Missing";
                return;
            }
            PasswordValid = true;
            if (string.IsNullOrEmpty(Password))
            {
                PasswordValid = false;
                Error = true;
                ErrorMessage = "Password Missing";
                return;
            }

            Error = false;
            ErrorMessage = string.Empty;
        }

        private async void OnLogin()
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
                        ErrorMessage = AppRes.UserNotFoundTxt;
                    }
                    else if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
                    {
                        Error = true;
                        ErrorMessage = AppRes.UserLoginBadRequestTxt;
                    }
                    else
                    {
                        Error = true;
                        ErrorMessage = AppRes.UserLoginBadRequestTxt;
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
