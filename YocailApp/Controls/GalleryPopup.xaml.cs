using CommunityToolkit.Maui.Views;
using YocailApp.Services;

namespace YocailApp.Controls;

public partial class GalleryPopup : Popup
{
	public GalleryPopup()
	{
		InitializeComponent();
        
	}
    
    private async Task GetAllGalleryImages()
    {
        // Request storage permission
        if (await Permissions.CheckStatusAsync<Permissions.StorageRead>() != PermissionStatus.Granted)
        {
            await Permissions.RequestAsync<Permissions.StorageRead>();
        }

        // Get images
        var result = new GalleryService().GetPhotoList();
        GalleryCollectionView.ItemsSource = result;
    }

    async void OnYesButtonClicked(object? sender, EventArgs e)
    {
        var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
        await CloseAsync(true, cts.Token);
    }

    async void OnNoButtonClicked(object? sender, EventArgs e)
    {
        var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
        await CloseAsync(false, cts.Token);
    }

    private async void Popup_Opened(object sender, CommunityToolkit.Maui.Core.PopupOpenedEventArgs e)
    {
        await GetAllGalleryImages();
    }

    private async void GalleryCollectionView_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        //var previous = e.PreviousSelection;
        //var current = e.CurrentSelection;
        foreach (var item in e.CurrentSelection)
        {
            var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
            await CloseAsync(item.ToString(), cts.Token);
            break;
        }
    }
}