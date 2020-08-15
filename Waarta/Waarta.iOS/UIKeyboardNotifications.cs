using System;
using Xamarin.Forms;
using Foundation;
using UIKit;
using Waarta.Services;
using Waarta.iOS.Services;

[assembly: Dependency(typeof(UIKeyboardNotifications))]
namespace Waarta.iOS.Services
{
    public class UIKeyboardNotifications : IKeyboardNotifications
    {
        public event EventHandler<KeyboardHeightEventArgs> KeyboardShowing;

        #region Properties
        private NSObject notification;
        private bool isListening;

        #endregion

        #region cTor
        [Preserve]
        public static void Init() { }

        //Just in case
        ~UIKeyboardNotifications()
        {
            StopListening();
        }
        #endregion

        #region Events
        void KeyboardWillShow(object sender, UIKit.UIKeyboardEventArgs args)
        {
            // Access strongly typed args
            //Console.WriteLine("Notification: {0}", args.Notification);
            //Console.WriteLine("FrameBegin", args.FrameBegin);
            double height = args.FrameBegin.Height;
            if (KeyboardShowing != null)
                KeyboardShowing.Invoke(this, new KeyboardHeightEventArgs(height));
        }
        #endregion

        #region Methods
        public void StartListening()
        {
            if (!isListening)
            {
                //// listening
                //notification = UIKeyboard.Notifications.ObserveWillShow((sender, args) => {
                //    /* Access strongly typed args */
                //    Console.WriteLine("Notification: {0}", args.Notification);
                //    Console.WriteLine("FrameBegin", args.FrameBegin);
                //    Console.WriteLine("FrameEnd", args.FrameEnd);
                //    Console.WriteLine("AnimationDuration", args.AnimationDuration);
                //    Console.WriteLine("AnimationCurve", args.AnimationCurve);
                //});
                notification = UIKeyboard.Notifications.ObserveWillShow(KeyboardWillShow);
                isListening = true;
            }
        }
        void Teardown()
        {
            StopListening();
        }
        public void StopListening()
        {
            if (isListening)
            {
                isListening = false;
                notification.Dispose();// To stop listening:
            }
        }

        #endregion


    }
}