using CommunityToolkit.Maui.Alerts;
using CommunityToolkit.Maui.Core;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Input;
using System.Xml.Linq;
using YocailApp.Resources.Translations;

namespace YocailApp.ViewModel
{
    public class CommentPageVM : CollectionBaseVM
    {
        public PostModel Post { get; set; }

        private ObservableCollection<CommentVM> _comments;
        public ObservableCollection<CommentVM> Comments
        {
            get => _comments;
            set
            {
                if (_comments != value)
                {
                    _comments = value;
                    OnPropertyChanged();
                }
            }
        }

        public ICommand DeleteCommand { get; set; }
        public ICommand PostCommentCommand { get; set; }

        private string _commentdraft = string.Empty;
        public string CommentDraft
        {
            get => _commentdraft;
            set
            {
                if (_commentdraft != value)
                {
                    _commentdraft = value;
                    OnPropertyChanged();
                }
            }
        }

        public CommentPageVM() : base() 
        {
            PageSize = 50;
            
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
                IsRefreshing = true;
                CurrentPage = 0;
                TotalRecords = 0;
                if (Comments != null)
                    Comments.Clear();
                await LoadData();
                IsRefreshing = false;
            });
            PostCommentCommand = new Command(async () => { await SaveComment(); });
        }

        public async Task SaveComment()
        {
            if (Connectivity.Current.NetworkAccess != NetworkAccess.Internet)
            {
                await Utility.ShowToast(AppRes.NoInternetMsg);
                return;
            }

            Loading = true;
            try
            {
                var client = await Utility.SharedClientAsync();
                //using StringContent jsonContent = new(JsonSerializer.Serialize(new PostCommentDTO() { PostId = Post.ID, Comment = CommentDraft }), Encoding.UTF8, "application/json");
                var formcontent = new MultipartFormDataContent();
                formcontent.Add(new StringContent(Post.ID.ToString()), "PostId");
                formcontent.Add(new StringContent(CommentDraft), "Comment");
                using HttpResponseMessage response = await client.PostAsync("api/Post/addcomment", formcontent);
                if (response.IsSuccessStatusCode)
                {
                    HttpContent content = response.Content;
                    string result = await content.ReadAsStringAsync();
                    JsonSerializerOptions l = new JsonSerializerOptions() { PropertyNameCaseInsensitive = true };
                    var data = JsonSerializer.Deserialize<CommentDTO>(result, l);
                    CommentVM apm = new CommentVM()
                    {
                        Comment = data,
                        IsOwner = true
                    };
                    Comments.Insert(0, apm);
                    CommentDraft = string.Empty;
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    Application.Current.MainPage = new LoginPage();
                }
                else
                {
                    Error = true;
                    ErrorMessage = "";

                    Console.WriteLine("{0} ({1})", (int)response.StatusCode, await response.Content.ReadAsStringAsync());
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error loading comments");
                Console.WriteLine(ex.Message);
            }
            finally
            {
                Loading = false;
            }
        }

        public async Task LoadData()
        {
            Loading = true;
            try
            {
                var client = await Utility.SharedClientAsync();
                using HttpResponseMessage response = await client.GetAsync($"api/post/comments/{Post.ID}?ps={PageSize}&p={CurrentPage}");
                if (response.IsSuccessStatusCode)
                {
                    HttpContent content = response.Content;
                    string result = await content.ReadAsStringAsync();
                    JsonSerializerOptions l = new() { PropertyNameCaseInsensitive = true };
                    var data = JsonSerializer.Deserialize<CommentListPaged>(result, l);

                    CurrentPage = data.Current;
                    TotalRecords = data.Total;
                    PageSize = data.PageSize;
                    Comments ??= new ObservableCollection<CommentVM>();
                    foreach (var i in data.CommentList)
                    {
                        CommentVM apm = new CommentVM()
                        {
                            Comment = i,
                            IsOwner = i.PostedBy.ID == CurrentMember.ID
                        };
                        Comments.Add(apm);
                    }
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
                Console.WriteLine("Error loading comments");
                Console.WriteLine(ex.Message);
            }
            finally
            {
                Loading = false;
            }
        }

        public async void DeleteComment(CommentVM obj)
        {
            //Loading = true;
            try
            {
                var client = await Utility.SharedClientAsync();
                using HttpResponseMessage response = await client.GetAsync($"api/post/removecomment/{obj.Comment.ID}");
                if (response.IsSuccessStatusCode)
                {
                    Comments.Remove(Comments.First(t => t.Comment.ID == obj.Comment.ID));
                    if(Comments.Count == 0)
                    {
                        IsRefreshing= true;
                    }
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    Application.Current.MainPage = new LoginPage();
                }
                else
                {
                    Error = true;
                    ErrorMessage = AppRes.GenericServerErrorTxt;
                    await Utility.ShowToast(ErrorMessage);
                    Console.WriteLine("{0} ({1})", (int)response.StatusCode, response.ReasonPhrase);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error removing comments");
                Error = true;
                ErrorMessage = AppRes.GenericServerErrorTxt;
                await Utility.ShowToast(ErrorMessage);
                Console.WriteLine(ex.Message);
            }
            finally
            {
                //Loading = false;
            }
        }

        //public async void ApplyQueryAttributes(IDictionary<string, object> query)
        //{
        //    Post = query["Post"] as PostModel;
        //    //since this is fresh load clear collection
        //    Comments?.Clear();

        //    await LoadData();
        //}
    }
}
