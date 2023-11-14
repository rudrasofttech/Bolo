using Android.Content;
using Android.OS;
using Android.Provider;
using Android.Runtime;
using Android.Views;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using YocailApp.Services;
using static Android.Provider.MediaStore;

namespace YocailApp.Services
{
    public class MediaService : IMediaService
    {
        public List<DevicePhoto> GetPhotoList()
        {
            var Photos = new List<DevicePhoto>();
            string[] projection = new string[] {
    Android.Provider.IBaseColumns.Id,
    Android.Provider.MediaStore.IMediaColumns.DisplayName,
    //Android.Provider.MediaStore.IMediaColumns.DateAdded,
    //Android.Provider.MediaStore.IMediaColumns.Size,
    //Android.Provider.MediaStore.IMediaColumns.RelativePath,
    //MediaStore.IMediaColumns.Data
};
            //        string selection = MediaStore.Video.Media.DURATION +
            //    " >= ?";
            //        String[] selectionArgs = new String[] {
            //String.valueOf(TimeUnit.MILLISECONDS.convert(5, TimeUnit.MINUTES));
            //    };
        string sortOrder = Android.Provider.MediaStore.IMediaColumns.DateAdded + " DESC";
            Android.Net.Uri collection;
            if (Build.VERSION.SdkInt >= Android.OS.BuildVersionCodes.Q)
            {
                collection = MediaStore.Video.Media.GetContentUri(MediaStore.VolumeExternal);
            }
            else
            {
                collection = MediaStore.Video.Media.ExternalContentUri;
            }
            Android.Database.ICursor cursor = Android.App.Application.Context.ContentResolver.Query(collection, projection, null, null, sortOrder);
            int idColumn = cursor.GetColumnIndex(Android.Provider.IBaseColumns.Id);
            int nameColumn = cursor.GetColumnIndex(Android.Provider.MediaStore.IMediaColumns.BucketDisplayName);
            //int dateAddedColumn = cursor.GetColumnIndex(Android.Provider.MediaStore.IMediaColumns.DateAdded);
            //int sizeColumn = cursor.GetColumnIndex(Android.Provider.MediaStore.IMediaColumns.Size);
            //int rpColumn = cursor.GetColumnIndex(Android.Provider.MediaStore.IMediaColumns.RelativePath);
            //int dataColumn = cursor.GetColumnIndex(Android.Provider.MediaStore.IMediaColumns.Data);
            while (cursor.MoveToNext())
            {
                // Get values of columns for a given video.
                long id = cursor.GetLong(idColumn);
                string name = cursor.GetString(nameColumn);
                string dateAdded = "";// cursor.GetString(dateAddedColumn);
                string size = "";// cursor.GetString(sizeColumn);
                string relativePath = "";// cursor.GetString(rpColumn);
                string data = "";// cursor.GetString(dataColumn);
                var contentUri = ContentUris.WithAppendedId(Android.Provider.MediaStore.Images.Media.ExternalContentUri, id);

                // Stores column values and the contentUri in a local object
                // that represents the media file.
                Photos.Add(new DevicePhoto(contentUri.ToString(), name, dateAdded, size, relativePath, data));
            }
            cursor.Close();
            return Photos;
            //IWindowManager wm = Android.App.Application.Context.GetSystemService(Context.WindowService).JavaCast<IWindowManager>();
            //SurfaceOrientation orientation = wm.DefaultDisplay.Rotation;
            //bool isLandscape = orientation == SurfaceOrientation.Rotation90 || orientation == SurfaceOrientation.Rotation270;
            //return isLandscape ? DeviceOrientation.Landscape : DeviceOrientation.Portrait;
        }
    }
}
