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
        readonly MeetingsService mss;
        List<MeetingDTO> meetings;
        MemberDTO mdto = null;
        public OldMeetings()
        {
            InitializeComponent();
            mss = new MeetingsService();
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
            meetings = await mss.GetMeetings();
            MeetingsListView.ItemsSource = meetings;
        }
    }
}