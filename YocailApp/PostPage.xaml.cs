using System.Diagnostics;
using YocailApp.Resources.Translations;
using YocailApp.Controls;
namespace YocailApp;

public partial class PostPage : ContentPage
{
    public PostPage()
    {
        InitializeComponent();
        
    }
    protected override void OnAppearing()
    {
        base.OnAppearing();
        PostCV.BindingContext = BindingContext;
    }
    private async void BackButton_Clicked(object sender, EventArgs e)
    {
        await Navigation.PopAsync();
    }

    protected async void PostCV_HamburgerMenuClicked(ViewModel.PostVM sender)
    {
        var actions = new List<string>();
        if (sender.IsOwner)
        {
            actions.Add(AppRes.EditTxt);
        }
        actions.Add(AppRes.ReportTxt);
        string action = await DisplayActionSheet(AppRes.ActionTxt, AppRes.CancelTxt, sender.IsOwner ? AppRes.DeleteTxt : string.Empty, buttons: actions.ToArray());
        Debug.WriteLine("Action: " + action);
    }
}