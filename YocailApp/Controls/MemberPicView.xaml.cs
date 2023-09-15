namespace YocailApp.Controls;

public partial class MemberPicView : ContentView
{
	public MemberPicView()
	{
		InitializeComponent();
	}

    private async void TapGestureRecognizer_Tapped(object sender, TappedEventArgs e)
    {
        await Navigation.PushAsync(new MemberPage((BindingContext as MemberSmallModel).UserName));
    }
}