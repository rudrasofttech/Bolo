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
    public class PostVM : BaseVM
    {
        public PostModel Post { get; set; }

        public bool ShowReactionCount
        {
            get
            {
                return Post.ReactionCount > 0;
            }
        }

        public string ReactionCountText
        {
            get
            {
                if (Post.ReactionCount == 1)
                {
                    return " reaction";
                }
                else if (Post.ReactionCount > 1)
                {
                    return " reactions";
                }
                else
                {
                    return string.Empty;
                }
            }
        }

        public bool ShowCommentCount
        {
            get
            {
                if (Post.AcceptComment)
                {
                    return Post.CommentCount > 0;
                }
                else
                    return Post.AcceptComment;
            }
        }

        public string CommentCountText
        {
            get
            {
                if (Post.CommentCount == 1)
                {
                    return " comment";
                }
                else if (Post.CommentCount > 1)
                {
                    return " comments";
                }
                else
                {
                    return string.Empty;
                }
            }
        }

        public int CommentCount
        {
            get => Post.CommentCount;
            set
            {
                if (Post.CommentCount != value)
                {
                    Post.CommentCount = value;
                    OnPropertyChanged();
                    OnPropertyChanged("ShowCommentCount");
                    OnPropertyChanged("CommentCountText");
                }
            }
        }

        public int ReactionCount
        {
            get => Post.ReactionCount;

            set
            {
                if (Post.ReactionCount != value)
                {
                    Post.ReactionCount = value;
                    OnPropertyChanged();
                    OnPropertyChanged("ShowReactionCount");
                    OnPropertyChanged("ReactionCountText");
                }
            }
        }

        public bool HasReacted
        {
            get => Post.HasReacted;
            set
            {
                if (Post.HasReacted != value)
                {
                    Post.HasReacted = value;
                    OnPropertyChanged();
                }
            }
        }
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
        public bool ShowCarousel
        {
            get => Post.Photos.Count > 1;
        }

        public bool ShowSinglePhoto
        {
            get => Post.Photos.Count == 1;
        }

        public string FirstPhoto
        {
            get => Post.Photos.First().PhotoURLTransformed;
        }

        public ICommand DoubleTapCommand { get; set; }

        public PostVM()
        {
            DoubleTapCommand = new Command(async () =>
            {
                await SendReaction();
            });
        }

        public async Task SendReaction()
        {
            Loading = true;
            HasReacted = !HasReacted;
            try
            {
                var client = await Utility.SharedClientAsync();
                using HttpResponseMessage response = await client.GetAsync($"api/post/addreaction/{Post.ID}");
                if (response.IsSuccessStatusCode)
                {
                    HttpContent content = response.Content;
                    string result = await content.ReadAsStringAsync();
                    JsonSerializerOptions l = new() { PropertyNameCaseInsensitive = true };
                    var data = JsonSerializer.Deserialize<AddReactionDTO>(result, l);
                    HasReacted = data.HasReacted;
                    ReactionCount = data.ReactionCount;
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    Application.Current.MainPage = new LoginPage();
                }
                else
                {
                    Error = true;
                    ErrorMessage = "";
                    HasReacted = !HasReacted;
                    Console.WriteLine("{0} ({1})", (int)response.StatusCode, response.ReasonPhrase);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error loading feed");
                Console.WriteLine(ex.Message);
                HasReacted = !HasReacted;
            }
            finally
            {
                Loading = false;

            }
        }
    }
}
