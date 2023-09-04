using YocailApp.ViewModel;

namespace YocailApp;

public partial class ProfilePage : ContentPage
{
	public ProfilePage()
	{
		InitializeComponent();
	}

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        
        await (BindingContext as ProfileVM).LoadData();
    }
}