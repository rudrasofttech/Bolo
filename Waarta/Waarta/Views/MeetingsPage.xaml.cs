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
            if(medto != null) { } else
            {
                await DisplayAlert(AppResource.UniNotFound, AppResource.MeetsIdInvalidErrorMsg, AppResource.UniCancelText);
            }
        }
        private async void CreateMeetingBtn_Clicked(object sender, EventArgs e)
        {
            try {
                PostMeetingResult result = await mss.CreateMeeting(new Models.CreateMeetingDTO() { Name = NameTxt.Text.Trim(), Purpose = PurposeTxt.Text.Trim() });
            }
            catch (BadRequestException)
            {
                await DisplayAlert(AppResource.UniServerErrorTitle, AppResource.MeetsCreateerrorMsg, AppResource.UniCancelText);
            }
            catch(ServerErrorException) {
                await DisplayAlert(AppResource.UniServerErrorTitle, AppResource.MeetsCreateerrorMsg, AppResource.UniCancelText);
            }
            
        }
    }
}