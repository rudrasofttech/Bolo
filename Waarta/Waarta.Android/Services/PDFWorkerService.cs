using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Android.App;
using Android.Content;
using Android.Graphics;
using Android.Graphics.Pdf;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;
using Java.IO;
using Waarta.Droid.Services;
using Waarta.Services;
using Xamarin.Forms;

[assembly: Dependency(typeof(PDFWorkerService))]
namespace Waarta.Droid.Services
{
    public class PDFWorkerService : IPDFWorker
    {
        public bool GenerateThumbnail(string source, string target)
        {
            ParcelFileDescriptor fileDescriptor = null;
            try
            {
                fileDescriptor = ParcelFileDescriptor.Open(new Java.IO.File(source), ParcelFileMode.ReadOnly);
            }
            catch (FileNotFoundException e)
            {
                throw e;
            }
            PdfRenderer renderer = new PdfRenderer(fileDescriptor);
            int pageCount = renderer.PageCount;
            if(pageCount > 0)
            {
                PdfRenderer.Page page = renderer.OpenPage(0);
                
                //Creates bitmap
                Bitmap bmp = Bitmap.CreateBitmap(page.Width, page.Height, Bitmap.Config.Argb8888);
                //renderes page as bitmap, to use portion of the page use second and third parameter
                page.Render(bmp, null, null, PdfRenderMode.ForDisplay);
                //Save the bitmap
                System.IO.MemoryStream stream = new System.IO.MemoryStream();
                bmp.CompressAsync(Bitmap.CompressFormat.Jpeg, 50, stream);
                byte[] bitmapData = stream.ToArray();
                System.IO.File.WriteAllBytes(target, bitmapData);
                page.Close();
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}