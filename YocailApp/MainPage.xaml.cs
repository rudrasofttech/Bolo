using System.Diagnostics;
using System.Text.Json;
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
            (BindingContext as MainPageVM).CurrentMember = JsonSerializer.Deserialize<MemberModel>(await AccessSecureStorage.ReadAsync(Utility.CurrentMemberKey)
                , new JsonSerializerOptions() { PropertyNameCaseInsensitive = true });
            (BindingContext as MainPageVM).LoadFeedFromCache();
            if (!(BindingContext as MainPageVM).HasCacheData)
            {
                (BindingContext as MainPageVM).Loading = true;
            }
            
        }

        private async void PostCV_HamburgerMenuClicked(PostModel sender)
        {
            string action = await DisplayActionSheet("ActionSheet: Send to?", "Cancel", null, "Email", "Twitter", "Facebook");
            Debug.WriteLine("Action: " + action);
        }
    }
}