using YocailApp.ViewModel;

namespace YocailApp.Controls;

public partial class PostPreviewCV : ContentView
{
	public PostPreviewCV()
	{
		InitializeComponent();
	}

    private async void TapGestureRecognizer_Tapped(object sender, TappedEventArgs e)
    {
        await Navigation.PushAsync(new PostPage() { BindingContext = (BindingContext as PostVM) });
    }
}