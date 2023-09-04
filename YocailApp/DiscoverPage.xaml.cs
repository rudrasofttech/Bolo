
using System.Diagnostics;
using YocailApp.Resources.Translations;
using YocailApp.ViewModel;

namespace YocailApp;

public partial class DiscoverPage : ContentPage
{
    public DiscoverPage()
    {
        InitializeComponent();
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await (BindingContext as DiscoverPageVM).LoadExploreData();
    }

    //private async void PostCV_HamburgerMenuClicked(PostVM sender)
    //{
    //    var actions = new List<string>();
    //    if (sender.IsOwner)
    //    {
    //        actions.Add(AppRes.EditTxt);
    //    }
    //    actions.Add(AppRes.ReportTxt);
    //    string action = await DisplayActionSheet(AppRes.ActionTxt, AppRes.CancelTxt, sender.IsOwner ? AppRes.DeleteTxt : string.Empty, buttons: actions.ToArray());
    //    Debug.WriteLine("Action: " + action);
    //}
}