using YocailApp.ViewModel;

namespace YocailApp;

public partial class ProfilePage : ContentPage
{
	public ProfilePage()
	{
		InitializeComponent();
        Loaded += ProfilePage_Loaded;
	}

    private async void ProfilePage_Loaded(object sender, EventArgs e)
    {
        if (string.IsNullOrEmpty((BindingContext as ProfileVM).UserName))
        {
            await (BindingContext as ProfileVM).LoadData();
        }
        MemberModel m = (BindingContext as ProfileVM).Member;
        MemberCard.Member = m;
        MemberCard.ManageProfileButtonVisible = true;
    }
}