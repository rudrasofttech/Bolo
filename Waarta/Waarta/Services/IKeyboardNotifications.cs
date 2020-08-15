using System;
using System.Collections.Generic;
using System.Text;

namespace Waarta.Services
{
    public interface IKeyboardNotifications
    {
        event EventHandler<KeyboardHeightEventArgs> KeyboardShowing;

        void StartListening();
        void StopListening();
    }

    public class KeyboardHeightEventArgs : EventArgs
    {
        private double _height;
        public KeyboardHeightEventArgs(double height)
        {
            _height = height;
        }
        public double Height { get { return _height; } }
    }
}
