using Camera.MAUI;

namespace YocailApp;

public partial class EditProfilePic : ContentPage
{
	public EditProfilePic()
	{
		InitializeComponent();
	}

    protected override async void OnAppearing()
    {
        base.OnAppearing();
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

    private void cameraView_CamerasLoaded(object sender, EventArgs e)
    {
        if (cameraView.NumCamerasDetected > 0)
        {
            if (cameraView.NumMicrophonesDetected > 0)
                cameraView.Microphone = cameraView.Microphones.First();
            cameraView.Camera = cameraView.Cameras.First();
            MainThread.BeginInvokeOnMainThread(async () =>
            {
                if (await cameraView.StartCameraAsync() == CameraResult.Success)
                {
                    //controlButton.Text = "Stop";
                    //playing = true;
                }
            });
        }
    }

    private void cameraView_BarcodeDetected(object sender, Camera.MAUI.ZXingHelper.BarcodeEventArgs args)
    {

    }
}