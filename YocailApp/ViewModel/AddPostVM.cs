using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace YocailApp.ViewModel
{
    public class AddPostVM : BaseVM
    {
        public ObservableCollection<string> _pathList = new ObservableCollection<string>();
        public ObservableCollection<string> PathList
        {
            get => _pathList; set
            {
                if (_pathList != value)
                {
                    _pathList = value;
                    OnPropertyChanged();
                }
            }
        }

        public bool HasPhotos { get { return PathList.Any(); } }
        public bool SingleItem => PathList.Count == 1;
        public bool MultipleItem => PathList.Count > 1;

        public string FirstPath => PathList.Count > 0 ? PathList.First() : string.Empty;

        private string _describe = string.Empty;
        public string Describe
        {
            get => _describe; set
            {
                if (_describe != value)
                {
                    _describe = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool? _acceptComment = null;
        public bool? AcceptComment
        {
            get => _acceptComment;
            set
            {
                if (_acceptComment != value)
                {
                    _acceptComment = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool? _allowShare = null;
        public bool? AllowShare
        {
            get => _allowShare;
            set
            {
                if (_allowShare != value)
                {
                    _allowShare = value;
                    OnPropertyChanged();
                }
            }
        }

        public void AddPath(string p)
        {
            _pathList.Add(p);
            OnPropertyChanged("PathList");
            OnPropertyChanged("HasPhotos");
            OnPropertyChanged("SingleItem");
            OnPropertyChanged("MultipleItem");
            OnPropertyChanged("FirstPath");
        }

        public void RemovePath(string p)
        {
            _pathList.Remove(p);
            OnPropertyChanged("PathList");
            OnPropertyChanged("HasPhotos");
            OnPropertyChanged("SingleItem");
            OnPropertyChanged("MultipleItem");
            OnPropertyChanged("FirstPath");
        }
    }
}
