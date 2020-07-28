using System;
using System.Collections.Generic;
using Android.Graphics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Android.App;
using Android.Content;
using Android.Media;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;
using Waarta.Droid.Services;
using Waarta.Services;
using Xamarin.Forms;


[assembly: Dependency(typeof(VideoPickerService))]
namespace Waarta.Droid.Services
{
    public class VideoPickerService : IVideoPicker
    {
        public Task<bool> CompressVideo(string source, string target)
        {
            return Task.FromResult<bool>(true);
        }

        public bool GenerateThumbnail(string source, string target)
        {
            MediaMetadataRetriever retriever = new MediaMetadataRetriever();
            //retriever.SetDataSource(source, new Dictionary<string, string>());
            retriever.SetDataSource(source);
            Bitmap bitmap = retriever.GetFrameAtTime(1);
            if (bitmap != null)
            {
                MemoryStream stream = new MemoryStream();
                bitmap.Compress(Bitmap.CompressFormat.Jpeg, 50, stream);
                byte[] bitmapData = stream.ToArray();
                File.WriteAllBytes(target, bitmapData);
                //return ImageSource.FromStream(() => new MemoryStream(bitmapData));
                return true;


            }
            return false;
        }

        public Task<String> GetVideoFileAsync()
        {
            // Define the Intent for getting images
            Intent intent = new Intent();
            intent.SetType("video/*");
            intent.SetAction(Intent.ActionGetContent);

            // Get the MainActivity instance
            MainActivity activity = MainActivity.Instance;

            // Start the picture-picker activity (resumes in MainActivity.cs)
            activity.StartActivityForResult(
                Intent.CreateChooser(intent, "Select Video"),
                MainActivity.PickImageId);

            // Save the TaskCompletionSource object as a MainActivity property
            activity.PickImageTaskCompletionSource = new TaskCompletionSource<string>();

            // Return Task object
            return activity.PickImageTaskCompletionSource.Task;
        }

        public int GetVideoLengthInMinutes(string path)
        {
            MediaMetadataRetriever retriever = new MediaMetadataRetriever();
            retriever.SetDataSource(path);
            var length = retriever.ExtractMetadata(MetadataKey.Duration);
            var lengthseconds = Convert.ToInt32(length) / 1000;
            return lengthseconds;
        }
    }
}