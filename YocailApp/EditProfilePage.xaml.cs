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
        if ((BindingContext as EditProfileVM).BirthYear != (BindingContext as EditProfileVM).CurrentMember.BirthYear)
        {
            //(BindingContext as EditProfileVM).BirthYear = (int)(sender as Picker).SelectedItem;
            await (BindingContext as EditProfileVM).SaveBirthYear();
        }
    }
}