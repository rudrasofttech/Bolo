using System.Diagnostics;
using YocailApp.Resources.Translations;
using YocailApp.ViewModel;

namespace YocailApp;


//[QueryProperty(nameof(Post), "Post")]
public partial class CommentsPage : ContentPage
{
    PostModel post;

    public PostModel Post
    {
        get => post;
        set
        {
            post = value;
            OnPropertyChanged();
        }
    }

    public CommentsPage(PostModel pm)
    {
        InitializeComponent();
        post = pm;
        Loaded += CommentsPage_Loaded;
    }

    private async void CommentsPage_Loaded(object sender, EventArgs e)
    {
        (BindingContext as CommentPageVM).Post = post;
        await (BindingContext as CommentPageVM).LoadData();
    }


    //private async void BackButton_Clicked(object sender, EventArgs e)
    //{
    //    await Shell.Current.GoToAsync("//home/main");
    //}

    private async void ImageButton_Clicked(object sender, EventArgs e)
    {
        var cvm = (sender as ImageButton).CommandParameter as CommentVM;
        var actions = new List<string>();
        if (cvm.IsOwner)
        {
            actions.Add(AppRes.EditTxt);
            actions.Add(AppRes.DeleteTxt);
        }

        string chosenaction = await DisplayActionSheet(AppRes.ActionTxt, AppRes.CancelTxt, null, buttons: actions.ToArray());
        if (chosenaction == AppRes.DeleteTxt)
        {
            bool answer = await DisplayAlert(AppRes.ConfirmTxt, AppRes.DeleteConfirmTxt, AppRes.YesTxt, AppRes.NoTxt);
            if (answer)
                (BindingContext as CommentPageVM).DeleteComment((sender as ImageButton).CommandParameter as CommentVM);
        }
    }

    private void SwipeItemView_Invoked(object sender, EventArgs e)
    {

        (BindingContext as CommentPageVM).DeleteComment((sender as SwipeItemView).CommandParameter as CommentVM);
    }
}