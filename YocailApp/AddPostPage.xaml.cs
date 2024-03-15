
using CommunityToolkit.Maui.Core;
using CommunityToolkit.Maui.Views;
using YocailApp.Controls;
using YocailApp.Resources.Translations;
using YocailApp.Services;
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

    private async void NextButton_Clicked(object sender, EventArgs e)
    {
        await Navigation.PushModalAsync(new AddPostDescriptionPage() { BindingContext = (BindingContext as AddPostVM) });
    }

    private async void PhotosButton_Clicked(object sender, EventArgs e)
    {
        var popup = new GalleryPopup();
        var result = await this.ShowPopupAsync(popup, CancellationToken.None);

        if (result is string path)
        {
            if (!string.IsNullOrEmpty(path))
            {
                (BindingContext as AddPostVM).AddPath(path);
            }
        }
    }
}