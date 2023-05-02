using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Input;
using YocailApp.Resources.Translations;

namespace YocailApp.ViewModel
{
    public class MainPageVM : CollectionBaseVM
    {

        string feeddatapath = Utility.FeedDataFilePath;

        public ObservableCollection<PostVM> _posts;
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

        bool _hasCacheData;
        public bool HasCacheData
        {
            get => _hasCacheData; set
            {
                if (_hasCacheData != value)
                {
                    _hasCacheData = value;
                    OnPropertyChanged();
                }
            }
        }

        public MainPageVM()
        {
            LoadMoreCommand = new Command(async () =>
            {
                if (HasMorePages)
                {
                    CurrentPage = CurrentPage + 1;
                    await LoadData();
                }
            });

            RefreshCommand = new Command(async () =>
            {
                IsRefreshing= true;
                CurrentPage = 0;
                TotalRecords = 0;
                if (Posts != null)
                    Posts.Clear();
                await LoadData();
                IsRefreshing= false;
            });

        }

        public async Task LoadData()
        {
            Loading = true;
            try
            {
                var client = await Utility.SharedClientAsync();
                using HttpResponseMessage response = await client.GetAsync($"api/post/feed?ps={PageSize}&p={CurrentPage}");
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
                        PostVM apm = new PostVM()
                        {
                            Post = i,
                            IsOwner = i.Owner.ID == CurrentMember.ID
                        };
                        Posts.Add(apm);
                    }

                    var list = new List<PostModel>();
                    list.AddRange(Posts.Select(t => t.Post).ToList());
                    using FileStream outputStream = System.IO.File.OpenWrite(feeddatapath);
                    using StreamWriter streamWriter = new(outputStream);
                    await streamWriter.WriteAsync(JsonSerializer.Serialize(new PostsPaged() { Current = CurrentPage, PageSize = PageSize, Total = TotalRecords, Posts = list }));
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

        public void LoadFeedFromCache()
        {
            try
            {
                if (System.IO.File.Exists(feeddatapath))
                {
                    using Stream fileStream = System.IO.File.OpenRead(feeddatapath);
                    using var reader = new StreamReader(fileStream);
                    var c = reader.ReadToEnd();
                    JsonSerializerOptions l = new() { PropertyNameCaseInsensitive = true };
                    var data = JsonSerializer.Deserialize<PostsPaged>(c, l);
                    CurrentPage = data.Current;
                    TotalRecords = data.Total;
                    PageSize = data.PageSize;
                    Posts ??= new ObservableCollection<PostVM>();
                    foreach (var i in data.Posts)
                    {
                        PostVM apm = new PostVM()
                        {
                            Post = i,
                            IsOwner = i.Owner.ID == CurrentMember.ID
                        };
                        Posts.Add(apm);
                    }
                    _hasCacheData = true;
                    return;
                }
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
            }
            _hasCacheData = false;
        }
    }
}
