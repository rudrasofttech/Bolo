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


    public class DiscoverPageVM : CollectionBaseVM
    {
        
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

        public DiscoverPageVM()
        {
            
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

                    OnPropertyChanged("Posts");
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
