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
        MeetingPage mp = null;
        MemberDTO mdto = null;
        readonly MeetingsService mss;
        readonly WaartaDataStore ds;
        public MeetingsPage()
        {
            InitializeComponent();
            Title = AppResource.MeetingsTitle;
            mss = new MeetingsService();
            ds = new WaartaDataStore();
        }

        private async void ToolbarItem_Clicked(object sender, EventArgs e)
        {
            try
            {
                string result = await DisplayPromptAsync(AppResource.MeetsJoinMeetingLabel, AppResource.MeetsMeetingIDLabel);
                if (!String.IsNullOrEmpty(result))
                {
                    MeetingDTO medto = await mss.GetMeeting(result);
                    if (medto != null)
                    {
                        GotoMeetingPage(medto);
                    }
                    else
                    {
                        await DisplayAlert(AppResource.UniNotFound, AppResource.MeetsIdInvalidErrorMsg, AppResource.UniCancelText);
                    }
                }
            }
            catch (ServerErrorException)
            {
                await DisplayAlert(AppResource.UniErrorMessageTitle, AppResource.UniUnreachableHostExceptionMessage, AppResource.UniCancelText);
            }
        }
        private async void CreateMeetingBtn_Clicked(object sender, EventArgs e)
        {
            try {
                MeetingDTO result = await mss.CreateMeeting(new Models.CreateMeetingDTO() { Name = NameTxt.Text.Trim(), Purpose = PurposeTxt.Text.Trim() });
                if (result != null)
                {
                    GotoMeetingPage(result);
                }
            }
            catch (BadRequestException)
            {
                await DisplayAlert(AppResource.UniServerErrorTitle, AppResource.MeetsCreateerrorMsg, AppResource.UniCancelText);
            }
            catch(ServerErrorException) {
                await DisplayAlert(AppResource.UniServerErrorTitle, AppResource.MeetsCreateerrorMsg, AppResource.UniCancelText);
            }
        }

        private async void GotoMeetingPage(MeetingDTO meeting)
        {
            if (mp != null)
            {
                try
                {
                    mp.LeaveMeeting();
                    _ = mp.Disconnect();
                }
                catch { }
            }
            mp = new MeetingPage()
            {
                Myself = new UserInfo()
                {
                    ConnectionID = string.Empty,
                    MemberID = mdto.ID.ToString().ToLower(),
                    Name = mdto.Name,
                    PeerCapable = false,
                    VideoCapable = false,
                    Pic = !string.IsNullOrEmpty(mdto.Pic) ? mdto.Pic : ""
                },
                Meeting = meeting,
                ShouldCreateMessageGrid = true
            };
            //if the meeting has a name save it to meeting list
            if (!string.IsNullOrEmpty(meeting.Name))
            {
                string meetingsdata = ds.GetMeetingsListData();
                Dictionary<string, MeetingDTO> meetingslist = new Dictionary<string, MeetingDTO>();
                if (!string.IsNullOrEmpty(meetingsdata))
                {
                    meetingslist = (Dictionary<string, MeetingDTO>)JsonConvert.DeserializeObject(meetingsdata, typeof(Dictionary<string, MeetingDTO>));
                }
                if (!meetingslist.ContainsKey(meeting.ID))
                {
                    meetingslist.Add(meeting.ID, meeting);
                    ds.SaveMeetingsListData(JsonConvert.SerializeObject(meetingslist));
                }
            }
            await Navigation.PushAsync(mp);
        }

        private void ContentPage_Appearing(object sender, EventArgs e)
        {
            if (!string.IsNullOrEmpty(Waarta.Helpers.Settings.Myself))
            {
                mdto = (MemberDTO)JsonConvert.DeserializeObject(Waarta.Helpers.Settings.Myself, typeof(MemberDTO));
                mss.Token = Waarta.Helpers.Settings.Token;
            }

            if(Device.RuntimePlatform == Device.Android)
            {
                PurposeTxtFrame.BorderColor = Color.Transparent;
            }
        }

        private async void ToolbarItem_Clicked_1(object sender, EventArgs e)
        {
            await Navigation.PushAsync(new OldMeetings());
        }
    }
}