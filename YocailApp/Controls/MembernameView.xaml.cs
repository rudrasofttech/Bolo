namespace YocailApp.Controls;

public partial class MembernameView : ContentView
{
	public MembernameView()
	{
		InitializeComponent();
	}

    private async void TapGestureRecognizer_Tapped(object sender, TappedEventArgs e)
    {
        await Navigation.PushAsync(new MemberPage((BindingContext as MemberSmallModel).UserName));
    }
}