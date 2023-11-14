using System.Text.Json;
using YocailApp.Resources.Translations;
using YocailApp.Services;   
using YocailApp.ViewModel;

namespace YocailApp;

public partial class ProfilePage : ContentPage
{
    public ProfilePage()
    {
        InitializeComponent();
        Loaded += ProfilePage_Loaded;
    }

    private async void ProfilePage_Loaded(object sender, EventArgs e)
    {
        if (string.IsNullOrEmpty((BindingContext as ProfileVM).UserName))
        {
            await (BindingContext as ProfileVM).LoadData();
        }
        //MemberModel m = (BindingContext as ProfileVM).Member;
        //MemberCard.Member = m;
        //MemberCard.ManageProfileButtonVisible = true;
    }

    protected async override void OnAppearing()
    {
        base.OnAppearing();
        if((BindingContext as ProfileVM).Posts.Count == 0) {
            if (string.IsNullOrEmpty((BindingContext as ProfileVM).UserName))
            {
                await(BindingContext as ProfileVM).LoadData();
            }
        }
    }

    private async void ManageProfileButton_Clicked(object sender, EventArgs e)
    {
        await Navigation.PushAsync(new EditProfilePage());
    }

    private async void TapGestureRecognizer_Tapped(object sender, TappedEventArgs e)
    {
        var actions = new List<string>
        {
            AppRes.IgnoredMembersTxt,
            AppRes.LogoutTxt
        };

        //actions.Add(AppRes.ReportTxt);
        string action = await DisplayActionSheet(AppRes.ActionTxt, AppRes.CancelTxt, null, buttons: actions.ToArray());

        if (action == AppRes.LogoutTxt)
        {
            AccessSecureStorage.RemoveAll();
            Application.Current.MainPage = new LoginPage();
        }
    }
}