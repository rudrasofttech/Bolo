using Newtonsoft.Json;
using Plugin.Media;
using Plugin.Media.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Waarta.Models;
using Waarta.Resources;
using Waarta.Services;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Waarta.Views
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class Settings : ContentPage
    {
        
        readonly MemberService mService;
        MemberDTO mdto = null;
        public Settings()
        {
            InitializeComponent();
            mService = new MemberService();
            this.Title = AppResource.SetTitle;

        }

        private void ContentPage_Appearing(object sender, EventArgs e)
        {
            if (!string.IsNullOrEmpty(Waarta.Helpers.Settings.Myself))
            {
                mdto = (MemberDTO)JsonConvert.DeserializeObject(Waarta.Helpers.Settings.Myself, typeof(MemberDTO));
                mService.Token = Waarta.Helpers.Settings.Token;
            }
            if (mdto == null)
            {
                LoginMsgLbl.IsVisible = true;
                GotoLoginBtn.IsVisible = true;
                ViewProfileBtn.IsVisible = false;
                ProfilePic.IsVisible = false;
                NameLbl.IsVisible = false;
                UptProfileBtn.IsVisible = false;
                TAFBtn.IsVisible = false;
                ChangeProPicBtn.IsVisible = false;
                return;
            }
            else
            {
                LoginMsgLbl.IsVisible = false;
                GotoLoginBtn.IsVisible = false;
                ViewProfileBtn.IsVisible = true;
                ProfilePic.IsVisible = true;
                ProfilePic.Source = mdto.Image;
                NameLbl.IsVisible = true;
                NameLbl.Text = mdto.Name;
                UptProfileBtn.IsVisible = true;
                TAFBtn.IsVisible = false;
                ChangeProPicBtn.IsVisible = true;
            }
        }

        private void GotoLoginBtn_Clicked(object sender, EventArgs e)
        {
            LoginPage lp = new LoginPage();
            lp.LoggedIn += Lp_LoggedIn;
            Shell.Current.Navigation.PushAsync(lp);
        }

        private void Lp_LoggedIn(object sender, MemberDTO e)
        {
            if (!string.IsNullOrEmpty(Waarta.Helpers.Settings.Myself))
            {
                mdto = (MemberDTO)JsonConvert.DeserializeObject(Waarta.Helpers.Settings.Myself, typeof(MemberDTO));
            }
            mService.Token = Waarta.Helpers.Settings.Token;
        }

        private async void ViewProfileBtn_Clicked(object sender, EventArgs e)
        {
            ProfilePage pp = new ProfilePage() { BindingContext = mdto };
            await Navigation.PushAsync(pp);
        }

        private async void UptProfileBtn_Clicked(object sender, EventArgs e)
        {
            ManageProfilePage mpp = new ManageProfilePage();
            await Navigation.PushAsync(mpp);
        }

        private async void TAFBtn_Clicked(object sender, EventArgs e)
        {
            TellaFriend taf = new TellaFriend();
            await Navigation.PushAsync(taf);
        }

        private async void ChangeProPicBtn_Clicked(object sender, EventArgs e)
        {
            string action = await DisplayActionSheet(AppResource.UniOptions, AppResource.UniCancelText, null, AppResource.SetTakePicBtn, AppResource.SetChoosePhotoBtn, AppResource.SetRemovePicBtn);
            if(action == AppResource.SetRemovePicBtn)
            {
                try
                {
                    await mService.SavePic(string.Empty);
                    mdto.Pic = string.Empty;
                    ProfilePic.Source = mdto.Image;
                    Waarta.Helpers.Settings.Myself = JsonConvert.SerializeObject(mdto);
                }
                catch (ServerErrorException)
                {
                    await DisplayAlert(AppResource.UniErrorMessageTitle, AppResource.UniUnreachableHostExceptionMessage, AppResource.UniCancelText);
                }
            }else if(action == AppResource.SetChoosePhotoBtn)
            {
                await CrossMedia.Current.Initialize();
                if (!CrossMedia.Current.IsPickPhotoSupported)
                {
                    return;
                }
                var mediaOptions = new PickMediaOptions()
                {
                    PhotoSize = PhotoSize.Small,
                    CompressionQuality = 40
                };
                var selectedImage = await CrossMedia.Current.PickPhotoAsync(mediaOptions);
                if (selectedImage != null)
                {

                    MemberPhotoManage mpm = new MemberPhotoManage()
                    {
                        Path = selectedImage,
                        Member = mdto
                    };
                    await Navigation.PushAsync(mpm);
                }
            }
            else if (action == AppResource.SetTakePicBtn)
            {
                await CrossMedia.Current.Initialize();
                if (!CrossMedia.Current.IsTakePhotoSupported)
                {
                    return;
                }
                var mediaOptions = new StoreCameraMediaOptions()
                {
                    AllowCropping = true,
                    DefaultCamera = CameraDevice.Front,
                    PhotoSize = PhotoSize.Small,
                    CompressionQuality = 40
                };
                var selectedImage = await CrossMedia.Current.TakePhotoAsync(mediaOptions);
                if (selectedImage != null)
                {
                    MemberPhotoManage mpm = new MemberPhotoManage()
                    {
                        Path = selectedImage,
                        Member = mdto
                    };
                    await Navigation.PushAsync(mpm);
                }
            }
        }
    }
}