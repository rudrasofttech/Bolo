using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using Microsoft.Maui.Controls;

namespace YocailApp.ViewModel
{
    public class PostVM : BaseVM
    {

        public PostModel Post { get; set; }
        private bool _isOwner = false;
        public bool IsOwner
        {
            get => _isOwner;
            set
            {
                if (_isOwner != value)
                {
                    _isOwner = value;
                    OnPropertyChanged();
                }
            }
        }
    }
}
