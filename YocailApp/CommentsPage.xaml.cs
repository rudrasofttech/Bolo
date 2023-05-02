using System.Diagnostics;
using YocailApp.Resources.Translations;
using YocailApp.ViewModel;

namespace YocailApp;

public partial class CommentsPage : ContentPage
{
    public CommentsPage()
    {
        InitializeComponent();
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await (BindingContext as CommentPageVM).LoadData();
    }

    private async void BackButton_Clicked(object sender, EventArgs e)
    {
        await Navigation.PopModalAsync();
    }

    private async void ImageButton_Clicked(object sender, EventArgs e)
    {
        var cvm = (sender as ImageButton).CommandParameter as CommentVM;
        var actions = new List<string>
        {
            AppRes.ReportTxt
        };
        if (cvm.IsOwner)
            actions.Add(AppRes.EditTxt);

        string chosenaction = await DisplayActionSheet(AppRes.ActionTxt, AppRes.CancelTxt, cvm.IsOwner ? AppRes.DeleteTxt : string.Empty, buttons: actions.ToArray());
        if (chosenaction == AppRes.DeleteTxt)
        {
            bool answer = await DisplayAlert(AppRes.ConfirmTxt, AppRes.DeleteConfirmTxt, AppRes.YesTxt, AppRes.NoTxt);
            if (answer)
                (BindingContext as CommentPageVM).DeleteComment((sender as ImageButton).CommandParameter as CommentVM);
        }
    }
}