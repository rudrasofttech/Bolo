﻿using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Input;

namespace YocailApp.ViewModel
{
    public class BaseVM : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler PropertyChanged;

        public MemberModel CurrentMember { get; set; }

        public bool _refreshing;
        public bool IsRefreshing
        {
            get { return _refreshing; }
            set
            {
                if (_refreshing != value)
                {
                    _refreshing = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _loading;
        public bool Loading
        {
            get => _loading;
            set
            {
                if (_loading != value)
                {
                    _loading = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _error;
        public bool Error
        {
            get => _error;
            set
            {
                if (_error != value)
                {
                    _error = value;
                    OnPropertyChanged();
                }
            }
        }

        private string _errorMessage = string.Empty;
        public string ErrorMessage
        {
            get => _errorMessage;
            set
            {
                if (_errorMessage != value)
                {
                    _errorMessage = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _success;
        public bool Success
        {
            get => _success;
            set
            {
                if (_success != value)
                {
                    _success = value;
                    OnPropertyChanged();
                }
            }
        }

        private string _successMessage = string.Empty;
        public string SuccessMessage
        {
            get => _successMessage;
            set
            {
                if (_successMessage != value)
                {
                    _successMessage = value;
                    OnPropertyChanged();
                }
            }
        }

        public void OnPropertyChanged([CallerMemberName] string name = "") =>
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));

        public string Token()
        {
            return AccessSecureStorage.GetAuthToken();
        }

        public BaseVM()
        {
            string temp = AccessSecureStorage.GetCurrentMember();
            if (!string.IsNullOrEmpty(temp))
            {
                CurrentMember = JsonSerializer.Deserialize<MemberModel>(AccessSecureStorage.GetCurrentMember()
                    , new JsonSerializerOptions() { PropertyNameCaseInsensitive = true });
            }

        }
    }

    public class CollectionBaseVM : BaseVM
    {
        private int _totalRecords = 0;
        public int TotalRecords
        {
            get => _totalRecords;
            set
            {
                if (_totalRecords != value)
                {
                    _totalRecords = value;
                    OnPropertyChanged();
                }
            }
        }

        private int _currentPage = 0;
        public int CurrentPage
        {
            get => _currentPage;
            set
            {
                if (_currentPage != value)
                {
                    _currentPage = value;
                    OnPropertyChanged();
                }
            }
        }

        public int TotalPages
        {
            get
            {
                return (int)Math.Ceiling((decimal)_totalRecords / (decimal)PageSize);
            }
        }

        public bool HasMorePages
        {
            get
            {
                return CurrentPage < (TotalPages - 1);
            }
        }

        public int PageSize { get; set; } = 10;

        public ICommand LoadMoreCommand { get; set; }
        public ICommand RefreshCommand { get; set; }
        public ICommand ItemThresholdReachedCommand { get; set; }

        public CollectionBaseVM() : base()
        {

        }

    }
}
