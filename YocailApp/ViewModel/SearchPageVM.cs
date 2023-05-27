using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Input;

namespace YocailApp.ViewModel
{

    public delegate void SearchComplete();
    public class SearchPageVM : CollectionBaseVM
    {
        public event SearchComplete SearchCompleted;
        private string _keywords;
        public string Keywords
        {
            get => _keywords;

            set
            {
                if (_keywords != value)
                {
                    _keywords = value;
                    if (string.IsNullOrEmpty(_keywords))
                    {
                        SearchResults.Clear();
                        OnPropertyChanged("ShowExploreResult");
                        OnPropertyChanged("ShowSearchResult");
                    }
                    OnPropertyChanged();
                }
            }
        }

        private ObservableCollection<SearchResultItemVM> _searchResultItem = new ObservableCollection<SearchResultItemVM>();
        public ObservableCollection<SearchResultItemVM> SearchResults
        {
            get => _searchResultItem;
            set
            {
                if (_searchResultItem != value)
                {
                    _searchResultItem = value;
                    OnPropertyChanged();
                }
            }
        }
        public ObservableCollection<PostVM> _posts = new ObservableCollection<PostVM>();
        public ObservableCollection<PostVM> Posts
        {
            get => _posts;
            set
            {
                if (_posts != value)
                {
                    _posts = value;
                    OnPropertyChanged();
                    
                }
            }
        }

        public bool ShowSearchResult
        {
            get
            {
                return _searchResultItem.Count > 0;
            }
        }

        public bool ShowExploreResult
        {
            get
            {
                return !(_searchResultItem.Count > 0);
            }
        }

        public ICommand SearchCommand { get; set; }

        public SearchPageVM()
        {
            SearchCommand = new Command(async () => {
                await LoadData();
            });

            LoadMoreCommand = new Command(async () =>
            {
                if (HasMorePages)
                {
                    CurrentPage = CurrentPage + 1;
                    await LoadExploreData();
                }
            });

            RefreshCommand = new Command(async () =>
            {
                IsRefreshing = true;
                CurrentPage = 0;
                TotalRecords = 0;
                Posts?.Clear();
                await LoadExploreData();
                IsRefreshing = false;
            });
        }

        public async Task LoadData()
        {
            Loading = true;
            try
            {
                var client = await Utility.SharedClientAsync();
                using HttpResponseMessage response = await client.GetAsync($"api/search/?q={Keywords}");
                if (response.IsSuccessStatusCode)
                {
                    HttpContent content = response.Content;
                    string result = await content.ReadAsStringAsync();
                    JsonSerializerOptions l = new() { PropertyNameCaseInsensitive = true };
                    var data = JsonSerializer.Deserialize<List<SearchResultItem>>(result, l);
                    SearchResults.Clear();
                    foreach (var i in data)
                    {
                        SearchResults.Add(new SearchResultItemVM { Item = i });
                    }
                    OnPropertyChanged("SearchResults");
                    OnPropertyChanged("ShowExploreResult");
                    OnPropertyChanged("ShowSearchResult");
                    SearchCompleted();
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    Application.Current.MainPage = new LoginPage();
                }
                else
                {
                    Error = true;
                    ErrorMessage = "";
                    Console.WriteLine("{0} ({1})", (int)response.StatusCode, response.ReasonPhrase);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error loading search result");
                Console.WriteLine(ex.Message);
            }
            finally
            {
                Loading = false;
            }
        }

        public async Task LoadExploreData()
        {
            Loading = true;
            try
            {
                var client = await Utility.SharedClientAsync();
                using HttpResponseMessage response = await client.GetAsync($"api/post/explore?ps={PageSize}&p={CurrentPage}");
                if (response.IsSuccessStatusCode)
                {
                    HttpContent content = response.Content;
                    string result = await content.ReadAsStringAsync();
                    JsonSerializerOptions l = new() { PropertyNameCaseInsensitive = true };
                    var data = JsonSerializer.Deserialize<PostsPaged>(result, l);

                    CurrentPage = data.Current;
                    TotalRecords = data.Total;
                    PageSize = data.PageSize;
                    Posts ??= new ObservableCollection<PostVM>();
                    foreach (var i in data.Posts)
                    {
                        var apm = new PostVM()
                        {
                            Post = i,
                            IsOwner = i.Owner.ID == CurrentMember.ID
                        };
                        Posts.Add(apm);
                    }

                    OnPropertyChanged("PostsPaged");
                    OnPropertyChanged("HasMorePages");
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    Application.Current.MainPage = new LoginPage();
                }
                else
                {
                    Error = true;
                    ErrorMessage = "";
                    Console.WriteLine("{0} ({1})", (int)response.StatusCode, response.ReasonPhrase);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error loading feed");
                Console.WriteLine(ex.Message);
            }
            finally
            {
                Loading = false;
            }
        }
    }
}
