using Camera.MAUI;
using System.Collections.ObjectModel;
using YocailApp.Services;

namespace YocailApp;

public partial class EditProfilePic : ContentPage
{
    private readonly IMediaService service = new MediaService();
    public ObservableCollection<DevicePhoto> _photos = new();
    public ObservableCollection<DevicePhoto> Photos
    {
        get => _photos;
        set
        {
            if (_photos != value)
            {
                _photos = value;
                OnPropertyChanged();
            }
        }
    }
    public EditProfilePic()
	{
		InitializeComponent();
        Loaded += EditProfilePic_Loaded;
	}

    private void EditProfilePic_Loaded(object sender, EventArgs e)
    {
        
        //int maxCols = 3;
        //Grid g = new();
        //for (int j = 0; j < maxCols; j++)
        //    g.ColumnDefinitions.Add(new ColumnDefinition() { Width = GridLength.Star });
        //for (int j = 0; j < (list.Count / maxCols) + 1; j++)
        //    g.RowDefinitions.Add(new RowDefinition());

        //for (int i = 1, row = 0; i <= list.Count; i += maxCols, row++)
        //{
        //    for (int k = i, col = 0; k < i + maxCols; k++, col++)
        //    {
        //        if (list.Count > k)
        //        {
        //            var p = list[k - 1];
        //            Image img = new Image() { Source = new Uri(p.URI) };
        //            g.Add(img, col, row);
        //        }
        //        else
        //            break;
        //    }
        //}
        //stackLayout.Content = g;
        
    }

    protected async override void OnAppearing()
    {
        base.OnAppearing();
        
        PermissionStatus status = await Permissions.CheckStatusAsync<Permissions.Photos>();
        if (status != PermissionStatus.Granted)
        {
            status = await Permissions.RequestAsync<Permissions.Photos>();
            if(status != PermissionStatus.Granted) { 
                return; }
         }
        
        var list = service.GetPhotoList();
        foreach (var photo in list)
        {
            Photos.Add(photo);
        }
        OnPropertyChanged(nameof(Photos));
        if (MediaPicker.Default.IsCaptureSupported)
        {
            

            //if (photo != null)
            //{
            //    // save the file into local storage
            //    string localFilePath = Path.Combine(FileSystem.CacheDirectory, photo.FileName);

            //    using Stream sourceStream = await photo.OpenReadAsync();
            //    using FileStream localFileStream = File.OpenWrite(localFilePath);

            //    await sourceStream.CopyToAsync(localFileStream);
            //}
        }
    }

    //private void cameraView_CamerasLoaded(object sender, EventArgs e)
    //{
    //    if (cameraView.NumCamerasDetected > 0)
    //    {
    //        if (cameraView.NumMicrophonesDetected > 0)
    //            cameraView.Microphone = cameraView.Microphones.First();
    //        cameraView.Camera = cameraView.Cameras.First();
    //        MainThread.BeginInvokeOnMainThread(async () =>
    //        {
    //            if (await cameraView.StartCameraAsync() == CameraResult.Success)
    //            {
    //                //controlButton.Text = "Stop";
    //                //playing = true;
    //            }
    //        });
    //    }
    //}

    //private void cameraView_BarcodeDetected(object sender, Camera.MAUI.ZXingHelper.BarcodeEventArgs args)
    //{

    //}
}