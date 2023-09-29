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
}