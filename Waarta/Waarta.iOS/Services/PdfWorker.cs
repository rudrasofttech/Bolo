using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using CoreGraphics;
using Foundation;
using UIKit;
using Waarta.iOS.Services;
using Waarta.Services;
using Xamarin.Forms;

[assembly: Dependency(typeof(PdfWorker))]
namespace Waarta.iOS.Services
{
    public class PdfWorker : IPDFWorker
    {
        public bool GenerateThumbnail(string source, string target)
        {
            UIImage pdfImage = null;
            CGPDFDocument m_pdfDcument = null;
            MemoryStream stream = new MemoryStream();
            
            // Create memory stream from file stream.
            File.OpenRead(source).CopyTo(stream);
            // Create data provider from bytes.
            CGDataProvider provider = new CGDataProvider(stream.ToArray());
            try
            {
                //Load a PDF file.
                m_pdfDcument = new CGPDFDocument(provider);
            }
            catch (Exception)
            {
            }
            
            //Get PDF's page and convert as image.
            using (CGPDFPage pdfPage = m_pdfDcument.GetPage(0))
            {
                //initialise image context.
                UIGraphics.BeginImageContext(pdfPage.GetBoxRect(CGPDFBox.Media).Size);
                // get current context.
                CGContext context = UIGraphics.GetCurrentContext();
                context.SetFillColor(1.0f, 1.0f, 1.0f, 1.0f);
                // Gets page's bounds.
                CGRect bounds = new CGRect(pdfPage.GetBoxRect(CGPDFBox.Media).X, pdfPage.GetBoxRect(CGPDFBox.Media).Y, pdfPage.GetBoxRect(CGPDFBox.Media).Width, pdfPage.GetBoxRect(CGPDFBox.Media).Height);
                if (pdfPage != null)
                {
                    context.FillRect(bounds);
                    context.TranslateCTM(0, bounds.Height);
                    context.ScaleCTM(1.0f, -1.0f);
                    context.ConcatCTM(pdfPage.GetDrawingTransform(CGPDFBox.Crop, bounds, 0, true));
                    context.SetRenderingIntent(CGColorRenderingIntent.Default);
                    context.InterpolationQuality = CGInterpolationQuality.Default;
                    // Draw PDF page in the context.
                    context.DrawPDFPage(pdfPage);
                    // Get image from current context.
                    pdfImage = UIGraphics.GetImageFromCurrentImageContext();
                    UIGraphics.EndImageContext();
                }
            }
            pdfImage.AsJPEG((nfloat)0.5).Save(target, false);
            return true;
        }
    }
}