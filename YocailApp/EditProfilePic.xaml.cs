//using Camera.MAUI;
using System.Collections.ObjectModel;
using YocailApp.Resources.Translations;
using YocailApp.Services;
using YocailApp.ViewModel;

namespace YocailApp;

public partial class EditProfilePic : ContentPage
{
    public bool PhotoSelected { get; set; }

    public EditProfilePic()
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

    protected async override void OnAppearing()
    {
        base.OnAppearing();
        await GetAllGalleryImages();
        PhotoCV.BoundaryX = PhotoFrame.Width;
        PhotoCV.BoundaryY = PhotoFrame.Height;
    }

    private async void CaptureButton_Clicked(object sender, EventArgs e)
    {
        if (!PhotoSelected)
        {
            await Utility.ShowToast(AppRes.PhotoMissingMsg);
            return;
        }

        IScreenshotResult screen = await PhotoFrame.CaptureAsync();

        Stream stream = await screen.OpenReadAsync();

        byte[] bytes;
        using (var memoryStream = new MemoryStream())
        {
            stream.CopyTo(memoryStream);
            bytes = memoryStream.ToArray();
        }
        string base64 = Convert.ToBase64String(bytes);
        (BindingContext as EditProfilePicVM).ChosenPhoto = base64;
        if(await (BindingContext as EditProfilePicVM).SavePic())
        {
            await Navigation.PopAsync();
        }
    }

    private async void TapGestureRecognizer_Tapped(object sender, TappedEventArgs e)
    {
        string path = e.Parameter.ToString();
        if(!string.IsNullOrEmpty(path))
        {
            FileResult fr = new FileResult(path);
            //string localFilePath = Path.Combine(FileSystem.CacheDirectory, $"chosenprofilepic{Path.GetExtension(fr.FileName)}");
            //if (File.Exists(localFilePath))
            //    File.Delete(localFilePath);

            //using Stream sourceStream = await fr.OpenReadAsync();
            //using FileStream localFileStream = File.OpenWrite(localFilePath);

            //await sourceStream.CopyToAsync(localFileStream);
            PhotoCV.Image.Source = ImageSource.FromStream(async _ => { return await fr.OpenReadAsync(); });
            PhotoSelected = true;
        }
    }
}