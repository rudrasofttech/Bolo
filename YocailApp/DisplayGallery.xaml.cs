using YocailApp.Services;

namespace YocailApp;

public partial class DisplayGallery : ContentPage
{
    public DisplayGallery()
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
        //GalleryCollectionView.ItemsSource = result;
        if(result.Count > 0)
        {
            Img.Source = ImageSource.FromFile(result[0]);
        }
    }

    protected async override void OnAppearing()
    {
        base.OnAppearing();
        await GetAllGalleryImages();
    }
}