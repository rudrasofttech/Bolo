using Android.Content;
using Android.Provider;
using System.Globalization;

namespace YocailApp.Services
{
    public partial class GalleryService
    {
        public partial List<string> GetPhotoList()
        {
            var imageDatas = new List<string>();
            string[] projections = { MediaStore.IMediaColumns.Data, MediaStore.Images.IImageColumns.BucketDisplayName };
            var imagecursor = Android.App.Application.Context.ContentResolver.Query(MediaStore.Images.Media.ExternalContentUri, projections, null, null, null);
            if (imagecursor == null || imagecursor.Count <= 0) return imageDatas;

            while (imagecursor.MoveToNext())
            {
                string data = imagecursor.GetString(imagecursor.GetColumnIndex(MediaStore.Images.ImageColumns.Data));
                imageDatas.Add(data);
            }
            imagecursor.Close();

            return imageDatas;
        }
    }
}
