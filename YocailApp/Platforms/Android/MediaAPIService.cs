using Android.Content;
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

namespace YocailApp.Services.PartialMethods
{
    public partial class MediaAPIService
    {


        public partial DeviceOrientation GetOrientation()
        {
            string[] projection = new string[] {
    Android.Provider.IBaseColumns.Id,
    Android.Provider.MediaStore.IMediaColumns.DisplayName,
    Android.Provider.MediaStore.IMediaColumns.DateAdded,
    Android.Provider.MediaStore.IMediaColumns.Size,
    Android.Provider.MediaStore.IMediaColumns.RelativePath
};
            //        string selection = MediaStore.Video.Media.DURATION +
            //    " >= ?";
            //        String[] selectionArgs = new String[] {
            //String.valueOf(TimeUnit.MILLISECONDS.convert(5, TimeUnit.MINUTES));
            //    };
            string sortOrder = Android.Provider.MediaStore.IMediaColumns.DateAdded + " DESC";

            Android.Database.ICursor cursor = Android.App.Application.Context.ContentResolver.Query(Android.Provider.MediaStore.Images.Media.ExternalContentUri, projection, null, null, sortOrder);
            int idColumn = cursor.GetColumnIndex(Android.Provider.IBaseColumns.Id);
            int nameColumn = cursor.GetColumnIndex(Android.Provider.MediaStore.IMediaColumns.DisplayName);
            int dateAddedColumn = cursor.GetColumnIndex(Android.Provider.MediaStore.IMediaColumns.DateAdded);
            int sizeColumn = cursor.GetColumnIndex(Android.Provider.MediaStore.IMediaColumns.Size);
            int rpColumn = cursor.GetColumnIndex(Android.Provider.MediaStore.IMediaColumns.RelativePath);

            //while (cursor.MoveToNext())
            //{
            //    // Get values of columns for a given video.
            //    long id = cursor.GetLong(idColumn);
            //    String name = cursor.getString(nameColumn);
            //    int duration = cursor.getInt(durationColumn);
            //    int size = cursor.getInt(sizeColumn);

            //    Uri contentUri = ContentUris.withAppendedId(
            //            MediaStore.Video.Media.EXTERNAL_CONTENT_URI, id);

            //    // Stores column values and the contentUri in a local object
            //    // that represents the media file.
            //    videoList.add(new Video(contentUri, name, duration, size));
            //}


            IWindowManager wm = Android.App.Application.Context.GetSystemService(Context.WindowService).JavaCast<IWindowManager>();
            SurfaceOrientation orientation = wm.DefaultDisplay.Rotation;
            bool isLandscape = orientation == SurfaceOrientation.Rotation90 || orientation == SurfaceOrientation.Rotation270;
            return isLandscape ? DeviceOrientation.Landscape : DeviceOrientation.Portrait;
        }
    }
}
