using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Input;
using Microsoft.Maui.Controls;

namespace YocailApp.ViewModel
{
    public class CommentVM : BaseVM
    {
        public CommentDTO Comment { get; set; }

        private bool _isOwner;

        public bool IsOwner
        {
            get { return _isOwner; }
            set
            {
                if (_isOwner != value)
                {
                    _isOwner = value;
                    OnPropertyChanged();
                }
            }
        }

        public ICommand DoubleTapCommand { get; set; }

        public CommentVM()
        {
            DoubleTapCommand = new Command(() =>
            {

            });
        }
    }
}
