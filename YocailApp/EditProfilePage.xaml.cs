using System.Diagnostics;
using YocailApp.Resources.Translations;
using YocailApp.ViewModel;

namespace YocailApp;

public partial class EditProfilePage : ContentPage
{
    public EditProfilePage()
    {
        InitializeComponent();
        Loaded += EditProfilePage_Loaded;
    }

    private void EditProfilePage_Loaded(object sender, EventArgs e)
    {
        (BindingContext as EditProfileVM).LoadDateFromContext();
    }

    private async void Picker_SelectedIndexChanged(object sender, EventArgs e)
    {
        if ((BindingContext as EditProfileVM).BirthYear != (int)(sender as Picker).SelectedItem)
        {
            (BindingContext as EditProfileVM).BirthYear = (int)(sender as Picker).SelectedItem;
            await (BindingContext as EditProfileVM).SaveBirthYear();
        }
    }

    private async void Button_Clicked(object sender, EventArgs e)
    {
        var actions = new List<string>
        {
            AppRes.AddPhotoMsg,
            AppRes.RemovePhotoMsg
        };

        string action = await DisplayActionSheet(AppRes.ActionTxt, AppRes.CancelTxt, null, buttons: actions.ToArray());
        if (action == AppRes.AddPhotoMsg) {
            await Navigation.PushAsync(new EditProfilePic());
        }
        else if(action == AppRes.RemovePhotoMsg) { }
        {

        }
    }
}