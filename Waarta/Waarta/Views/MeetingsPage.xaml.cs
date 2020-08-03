using Newtonsoft.Json;
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
    public partial class MeetingsPage : ContentPage
    {
        MemberDTO mdto = null;
        readonly MeetingsService mss;
        public MeetingsPage()
        {
            InitializeComponent();
            Title = AppResource.MeetingsTitle;
            mss = new MeetingsService();
        }

        private async void ToolbarItem_Clicked(object sender, EventArgs e)
        {
            string result = await DisplayPromptAsync(AppResource.MeetsJoinMeetingLabel, AppResource.MeetsMeetingIDLabel);
            MeetingDTO medto = await mss.GetMeeting(result);
            if(medto != null) {
                MeetingPage mp = new MeetingPage()
                {
                    Myself = new UserInfo() { ConnectionID = string.Empty, MemberID = mdto.ID,
                        Name = mdto.Name, PeerCapable = false, VideoCapable = false, Pic = mdto.Pic
                    },
                    Meeting = medto,
                    ShouldCreateMessageGrid = true
                };
                await Navigation.PushModalAsync(mp);
            } else
            {
                await DisplayAlert(AppResource.UniNotFound, AppResource.MeetsIdInvalidErrorMsg, AppResource.UniCancelText);
            }
        }
        private async void CreateMeetingBtn_Clicked(object sender, EventArgs e)
        {
            try {
                MeetingDTO result = await mss.CreateMeeting(new Models.CreateMeetingDTO() { Name = NameTxt.Text.Trim(), Purpose = PurposeTxt.Text.Trim() });
            }
            catch (BadRequestException)
            {
                await DisplayAlert(AppResource.UniServerErrorTitle, AppResource.MeetsCreateerrorMsg, AppResource.UniCancelText);
            }
            catch(ServerErrorException) {
                await DisplayAlert(AppResource.UniServerErrorTitle, AppResource.MeetsCreateerrorMsg, AppResource.UniCancelText);
            }
            
        }

        private void ContentPage_Appearing(object sender, EventArgs e)
        {
            if (!string.IsNullOrEmpty(Waarta.Helpers.Settings.Myself))
            {
                mdto = (MemberDTO)JsonConvert.DeserializeObject(Waarta.Helpers.Settings.Myself, typeof(MemberDTO));
                mss.Token = Waarta.Helpers.Settings.Token;
            }
        }
    }
}