namespace YocailApp;

public partial class DiscoverPage : ContentPage
{
	public DiscoverPage()
	{
		InitializeComponent();
	}

    protected override void OnAppearing()
    {
        base.OnAppearing();
        if(AccessSecureStorage.GetAuthToken() != null) { }
    }
}