using YocailApp.ViewModel;

namespace YocailApp;

public partial class LoginPage : ContentPage
{
    public string UserNameHint { get; set; } = string.Empty;
    public string WelcomeToast { get; set; } = string.Empty;

	public LoginPage()
	{
		InitializeComponent();
	}

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        if(!string.IsNullOrEmpty(UserNameHint))
            (BindingContext as LoginPageVM).UserName = UserNameHint;
        if(!string.IsNullOrEmpty(WelcomeToast))
            await Utility.ShowToast(WelcomeToast, CommunityToolkit.Maui.Core.ToastDuration.Long);
    }

    private void TapGestureRecognizer_Tapped(object sender, TappedEventArgs e)
    {
        Application.Current.MainPage = new RegisterPage();
    }

    private void TapGestureRecognizer_Tapped_1(object sender, TappedEventArgs e)
    {
        Application.Current.MainPage = new ForgotPasswordPage();
    }
}