using YocailApp.ViewModel;

namespace YocailApp;

public partial class MemberPage : ContentPage
{
    private string userName;
	public MemberPage(string username)
	{
		InitializeComponent();
        userName = username;
        Loaded += MemberPage_Loaded;
	}

    private async void MemberPage_Loaded(object sender, EventArgs e)
    {
        (BindingContext as ProfileVM).UserName = userName;
        await (BindingContext as ProfileVM).LoadData();
    }
}