using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Waarta.Models;
using Waarta.Services;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Waarta.Views
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class OldMeetings : ContentPage
    {
        readonly WaartaDataStore ds;
        readonly MeetingsService mss;
        List<MeetingDTO> meetings;
        MemberDTO mdto = null;
        public OldMeetings()
        {
            InitializeComponent();
            mss = new MeetingsService();
            ds = new WaartaDataStore();
        }

        
        private async void MeetingsListView_ItemSelected(object sender, SelectedItemChangedEventArgs e)
        {
            MeetingDTO meeting = (MeetingsListView.SelectedItem as MeetingDTO);
            MeetingPage mp = new MeetingPage()
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
            
            await Navigation.PushAsync(mp);
        }

        private async void ContentPage_Appearing(object sender, EventArgs e)
        {
            if (!string.IsNullOrEmpty(Waarta.Helpers.Settings.Myself))
            {
                mdto = (MemberDTO)JsonConvert.DeserializeObject(Waarta.Helpers.Settings.Myself, typeof(MemberDTO));
                mss.Token = Waarta.Helpers.Settings.Token;
            }
            Title = Waarta.Resources.AppResource.OMTitle;
            ActivityInd.IsVisible = true;
            meetings = await mss.GetMeetings();
            MeetingsListView.ItemsSource = meetings;
            ActivityInd.IsVisible = false;
        }

        private async void RemoveMenuItem_Clicked(object sender, EventArgs e)
        {
            var mi = ((MenuItem)sender);
            MeetingDTO item = (MeetingDTO)mi.CommandParameter;
            ActivityInd.IsVisible = true;
            MeetingsListView.IsVisible = false;
            try
            {
                bool result = await mss.RemoveMeeting(item.ID);
                if (result)
                {
                    string meetingsdata = ds.GetMeetingsListData();
                    Dictionary<string, MeetingDTO> meetingslist = new Dictionary<string, MeetingDTO>();
                    if (!string.IsNullOrEmpty(meetingsdata))
                    {
                        meetingslist = (Dictionary<string, MeetingDTO>)JsonConvert.DeserializeObject(meetingsdata, typeof(Dictionary<string, MeetingDTO>));
                    }
                    if (!meetingslist.ContainsKey(item.ID))
                    {
                        meetingslist.Remove(item.ID);
                        ds.SaveMeetingsListData(JsonConvert.SerializeObject(meetingslist));
                    }
                    meetings = await mss.GetMeetings();
                    MeetingsListView.ItemsSource = meetings;
                }
            }
            catch(Exception ex) {
                await DisplayAlert("Error", ex.Message, "Cancel");
            }
            finally
            {
                ActivityInd.IsVisible = false;
                MeetingsListView.IsVisible = true;
            }
        }
    }
}