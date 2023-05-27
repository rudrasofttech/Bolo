using System.Diagnostics;
using System.Text;
using System.Text.Json;
using YocailApp.Resources.Translations;
using YocailApp.ViewModel;

namespace YocailApp
{
    public partial class MainPage : ContentPage
    {

        public MainPage()
        {
            InitializeComponent();
        }

        protected override async void OnAppearing()
        {
            base.OnAppearing();
            (BindingContext as MainPageVM).CurrentMember = JsonSerializer.Deserialize<MemberModel>(AccessSecureStorage.GetCurrentMember()
                , new JsonSerializerOptions() { PropertyNameCaseInsensitive = true });
            (BindingContext as MainPageVM).LoadFeedFromCache();
            if (!(BindingContext as MainPageVM).HasCacheData)
            {
                await (BindingContext as MainPageVM).LoadData();
            }
            
        }

        private async void PostCV_HamburgerMenuClicked(PostVM sender)
        {
            var actions = new List<string>();
            if(sender.IsOwner)
            {
                actions.Add(AppRes.EditTxt);
            }
            actions.Add(AppRes.ReportTxt);
            string action = await DisplayActionSheet(AppRes.ActionTxt, AppRes.CancelTxt, sender.IsOwner ? AppRes.DeleteTxt : string.Empty, buttons: actions.ToArray());
            Debug.WriteLine("Action: " + action);
        }
    }
}