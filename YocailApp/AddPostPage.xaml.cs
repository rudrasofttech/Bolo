using YocailApp.Resources.Translations;
using YocailApp.ViewModel;

namespace YocailApp;

public partial class AddPostPage : ContentPage
{
	public AddPostPage()
	{
		InitializeComponent();
	}

    private async void AddPostButton_Clicked(object sender, EventArgs e)
    {
		FileResult fr = await MediaPicker.PickPhotoAsync(new MediaPickerOptions() { Title = AppRes.AppPostMediaPickerTitle });
		(BindingContext as AddPostVM).AddPath(fr.FullPath);
    }

    private void RemovePhoto_Clicked(object sender, EventArgs e)
    {
        (BindingContext as AddPostVM).RemovePath((sender as ImageButton).CommandParameter.ToString());
    }
}