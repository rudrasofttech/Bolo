using System;
using System.Threading.Tasks;
using Xamarin.Forms;
using Foundation;
using UIKit;
using Waarta.Services;
using System.IO;
using Waarta.iOS.Services;
using AVFoundation;
using CoreMedia;
using CoreGraphics;

[assembly: Dependency(typeof(VideoPicker))]
namespace Waarta.iOS.Services
{

    public class VideoPicker : IVideoPicker
    {
        TaskCompletionSource<string> taskCompletionSource;
        UIImagePickerController imagePicker;

        public Task<string> GetVideoFileAsync()
        {
            // Create and define UIImagePickerController
            imagePicker = new UIImagePickerController
            {
                SourceType = UIImagePickerControllerSourceType.SavedPhotosAlbum,
                MediaTypes = new string[] { "public.movie" }
            };

            // Set event handlers
            imagePicker.FinishedPickingMedia += OnImagePickerFinishedPickingMedia;
            imagePicker.Canceled += OnImagePickerCancelled;

            // Present UIImagePickerController;
            UIWindow window = UIApplication.SharedApplication.KeyWindow;
            var viewController = window.RootViewController;
            viewController.PresentViewController(imagePicker, true, null);

            // Return Task object
            taskCompletionSource = new TaskCompletionSource<string>();
            return taskCompletionSource.Task;
        }

        void OnImagePickerFinishedPickingMedia(object sender, UIImagePickerMediaPickedEventArgs args)
        {
            if (args.MediaType == "public.movie")
            {
                taskCompletionSource.SetResult(args.MediaUrl.AbsoluteString);
            }
            else
            {
                taskCompletionSource.SetResult(null);
            }
            imagePicker.DismissModalViewController(true);
        }

        void OnImagePickerCancelled(object sender, EventArgs args)
        {
            taskCompletionSource.SetResult(null);
            imagePicker.DismissModalViewController(true);
        }

        void UnregisterEventHandlers()
        {
            imagePicker.FinishedPickingMedia -= OnImagePickerFinishedPickingMedia;
            imagePicker.Canceled -= OnImagePickerCancelled;
        }

        public bool GenerateThumbnail(string source, string target)
        {
            AVAssetImageGenerator imageGenerator = new AVAssetImageGenerator(AVAsset.FromUrl(new Foundation.NSUrl(source)))
            {
                AppliesPreferredTrackTransform = true
            };
            CGImage cgImage = imageGenerator.CopyCGImageAtTime(new CMTime(0, 1000000), actualTime: out _, outError: out _);
            if (cgImage != null)
            {
                new UIImage(cgImage).AsPNG().Save(target, false);
                return true;
            }
            else
            {
                return false;
            }
        }

        public int GetVideoLengthInMinutes(string path)
        {
            AVAsset avasset = AVAsset.FromUrl((new Foundation.NSUrl(path)));
            var length = avasset.Duration.Seconds.ToString();
            var lengthseconds = Convert.ToInt32(length) / 1000;
            return lengthseconds;
        }

        public Task<bool> CompressVideo(string source, string target)
        {
            var task = new TaskCompletionSource<bool>();
            try
            {
                var mediaUrl = new Foundation.NSUrl(source);

                var export = new AVAssetExportSession(AVAsset.FromUrl(mediaUrl), AVAssetExportSession.PresetMediumQuality)
                {
                    OutputUrl = NSUrl.FromFilename(target),
                    OutputFileType = AVFileType.Mpeg4,
                    ShouldOptimizeForNetworkUse = true
                };

                export.ExportAsynchronously(() =>
                {
                    if (export.Status == AVAssetExportSessionStatus.Completed)
                    {
                        var videoData = NSData.FromUrl(NSUrl.FromString(export.OutputUrl.ToString()));
                        if (videoData.Save(target, false, out NSError err))
                        {
                            task.SetResult(true);
                        }
                        else
                        {
                            task.SetResult(false);
                        }
                    }
                    else
                        task.SetResult(false);
                });

            }
            catch (Exception ex)
            {
                task.SetException(ex);
            }
            return task.Task;
        }
    }
}