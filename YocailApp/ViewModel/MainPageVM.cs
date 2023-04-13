using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Input;
using YocailApp.Resources.Translations;

namespace YocailApp.ViewModel
{
    public class MainPageVM : BaseVM
    {

        string feeddatapath = System.IO.Path.Combine(FileSystem.Current.CacheDirectory, "feeddata.txt");
        PostsPaged _postPaged = new PostsPaged() { PageSize = 30 };
        public PostsPaged PostsPaged
        {
            get => _postPaged; set
            {
                if (value != null)
                {
                    _postPaged = value;
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
                if (PostsPaged.Current < (PostsPaged.TotalPages - 1))
                {
                    PostsPaged.Current++;
                }
                await LoadData();
            });
            RefreshCommand = new Command(async () =>
            {
                PostsPaged.Current = 0;
                PostsPaged.Total = 0;
                PostsPaged.PageSize = 30;
                PostsPaged.Posts.Clear();
                await LoadData();
            });
            LoadFeedFromCache();
        }

        public async Task LoadData()
        {
            Loading = true;
            try
            {
                var client = await Utility.SharedClientAsync();
                using HttpResponseMessage response = await client.GetAsync($"api/post/feed?ps={PostsPaged.PageSize}&p={PostsPaged.Current}");
                if (response.IsSuccessStatusCode)
                {
                    HttpContent content = response.Content;
                    string result = await content.ReadAsStringAsync();
                    JsonSerializerOptions l = new() { PropertyNameCaseInsensitive = true };
                    var data = JsonSerializer.Deserialize<PostsPaged>(result, l);

                    PostsPaged.Current = data.Current;
                    PostsPaged.Total = data.Total;
                    PostsPaged.PageSize = data.PageSize;
                    PostsPaged.Posts.AddRange(data.Posts);

                    using FileStream outputStream = System.IO.File.OpenWrite(feeddatapath);
                    using StreamWriter streamWriter = new(outputStream);
                    await streamWriter.WriteAsync(JsonSerializer.Serialize(PostsPaged));
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
                    using StreamReader reader = new StreamReader(fileStream);
                    var c = reader.ReadToEnd();
                    JsonSerializerOptions l = new() { PropertyNameCaseInsensitive = true };
                    PostsPaged = JsonSerializer.Deserialize<PostsPaged>(c, l);
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
