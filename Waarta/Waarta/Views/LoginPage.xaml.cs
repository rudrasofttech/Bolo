using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Waarta.Helpers;
using Waarta.Models;
using Waarta.Resources;
using Waarta.Services;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Waarta.Views
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class LoginPage : ContentPage
    {
        public event EventHandler<MemberDTO> LoggedIn;
        readonly LoginDTO model;
        public LoginPage()
        {
            InitializeComponent();
            model = new LoginDTO();

            this.Title = AppResource.LPTitle;
            GenerateOTPBtn.Text = AppResource.LPGenerateOTPBtn;
            OTPTxt.Placeholder = AppResource.LPOTPPH;
            MobileTxt.Placeholder = AppResource.LPMobileTxtPH;
            LoginBtn.Text = AppResource.LPLoginBtn;
            Title = AppResource.UniVerifyText;
        }

        private void MobileTxt_Completed(object sender, EventArgs e)
        {
            model.ID = (sender as Entry).Text;
        }

        private void OTPTxt_Completed(object sender, EventArgs e)
        {
            model.Passcode = (sender as Entry).Text;
        }

        private async void LoginBtn_ClickedAsync(object sender, EventArgs e)
        {
            try
            {
                LoginBtn.IsEnabled = false;
                MemberService ms = new MemberService();
                LoginReturnDTO result = await ms.Login(model);
                LoginBtn.IsEnabled = true;
                if (!string.IsNullOrEmpty(result.Token) && result.Member != null)
                {
                    Waarta.Helpers.Settings.Token = result.Token;
                    Waarta.Helpers.Settings.Myself = JsonConvert.SerializeObject(result.Member);
                    LoggedIn?.Invoke(this, result.Member);
                    await Navigation.PopAsync();
                }
            }
            catch (NotFoundException)
            {
                await DisplayAlert(AppResource.UniNotFound, AppResource.LPNotFoundMsg, AppResource.UniOK);
            }
            catch (BadRequestException)
            {
                await DisplayAlert(AppResource.UniBadRequest, AppResource.LPBadRequestMsg, AppResource.UniOK);
            }
            catch (ServerErrorException)
            {
                await DisplayAlert(AppResource.UniServerErrorTitle, AppResource.UniServerErrorMsg, AppResource.UniOK);
            }
            LoginBtn.IsEnabled = true;
        }

        private void MobileTxt_TextChanged(object sender, TextChangedEventArgs e)
        {
            model.ID = e.NewTextValue;
        }

        private void OTPTxt_TextChanged(object sender, TextChangedEventArgs e)
        {
            model.Passcode = e.NewTextValue;
        }

        private async void GenerateOTPBtn_Clicked(object sender, EventArgs e)
        {
            try
            {
                GenerateOTPBtn.IsEnabled = false;
                MemberService ms = new MemberService();
                if (await ms.GetOTP(model.ID, "91"))
                {
                    await DisplayAlert(AppResource.LPOTPGeneratedTitle, AppResource.LPOTPGeneratedMsg, AppResource.UniOK);
                    GenerateOTPBtn.IsEnabled = true;
                    GenerateOTPBtn.IsVisible = false;
                    OTPTxt.IsVisible = true;
                    LoginBtn.IsVisible = true;
                }
            }
            catch (NotFoundException)
            {
                await DisplayAlert(AppResource.UniNotFound, AppResource.LPNotFound2Msg, AppResource.UniOK);
            }
            catch (ServerErrorException)
            {
                await DisplayAlert(AppResource.UniServerErrorTitle, AppResource.UniServerErrorMsg, AppResource.UniOK);
            }
            GenerateOTPBtn.IsEnabled = true;
        }

        private void ContentPage_Appearing(object sender, EventArgs e)
        {
            if (!string.IsNullOrEmpty(Waarta.Helpers.Settings.Token))
            {
                Navigation.PopAsync();
            }
        }
    }
}