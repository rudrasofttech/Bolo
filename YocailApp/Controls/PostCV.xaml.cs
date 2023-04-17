using YocailApp.ViewModel;

namespace YocailApp.Controls;

public delegate void HamburgerMenuClick<T>(T sender);
public partial class PostCV : ContentView
{
	public event HamburgerMenuClick<PostModel> HamburgerMenuClicked;
	public PostCV()
	{
		InitializeComponent();
		
	}

    private void HamburgerMenuImgBtn_Clicked(object sender, EventArgs e)
    {
        HamburgerMenuClicked((BindingContext as PostVM).Post);
    }
}