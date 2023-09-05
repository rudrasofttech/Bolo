﻿using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace YocailApp.ViewModel
{
    public class ProfileVM : CollectionBaseVM, IQueryAttributable
    {
        public string UserName { get; private set; } = string.Empty;

        private MemberModel _member = new MemberModel();
        public MemberModel Member
        {
            get
            {
                return _member;
            }
            set
            {
                _member = value;
                OnPropertyChanged();
                OnPropertyChanged("ProfilePic");
                OnPropertyChanged("ProfilePicVisible");
                OnPropertyChanged("NameVisible");
                OnPropertyChanged("Name");
                OnPropertyChanged("ThoughtStatusVisible");
                OnPropertyChanged("ThoughtStatus");
                OnPropertyChanged("Bio");
                OnPropertyChanged("BioVisible");
                OnPropertyChanged("ManageProfileButtonVisible");
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
        

        public bool ProfilePicVisible
        {
            get { return !string.IsNullOrEmpty(Member.Pic); }
        }

        public bool ManageProfileButtonVisible
        {
            get
            {
                if (Member == null)
                    return false;
                else if (Member.UserName == CurrentMember.UserName)
                    return true;
                else
                    return false;
            }
        }

        public bool NameVisible
        {
            get
            {
                return !string.IsNullOrEmpty(Member.Name);
            }
        }
        public string Name { get { return Member.Name; } }

        public bool ThoughtStatusVisible
        {
            get
            {
                return !string.IsNullOrEmpty(Member.ThoughtStatus);
            }
        }
        public string ThoughtStatus { get { return Member.ThoughtStatus; } }

        public string Bio { get { return Member.Bio; } }
        public bool BioVisible { get { return !string.IsNullOrEmpty(Member.Bio); } }

        public ProfileVM()
        {
            LoadMoreCommand = new Command(async () =>
            {
                if (HasMorePages)
                {
                    CurrentPage++;
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

        public void ApplyQueryAttributes(IDictionary<string, object> query)
        {
            UserName = query["username"] as string;
            OnPropertyChanged("UserName");
        }

        public async Task LoadData()
        {
            if (Member == null || Member.UserName != UserName)
                Posts?.Clear();

            await LoadMemberProfileAsync();
            await LoadExploreData();
        }

        public async Task LoadMemberProfileAsync()
        {

            if (!string.IsNullOrEmpty(UserName))
            {
                try
                {
                    var client = await Utility.SharedClientAsync();
                    using HttpResponseMessage response = await client.GetAsync($"api/members/{UserName}");
                    if (response.IsSuccessStatusCode)
                    {
                        HttpContent content = response.Content;
                        string result = await content.ReadAsStringAsync();
                        JsonSerializerOptions l = new() { PropertyNameCaseInsensitive = true };
                        Member = JsonSerializer.Deserialize<MemberModel>(result, l);
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
            else
            {
                Member = CurrentMember;
            }
        }

        public async Task LoadExploreData()
        {
            if (Member != null)
            {
                Loading = true;
                try
                {
                    var client = await Utility.SharedClientAsync();
                    using HttpResponseMessage response = await client.GetAsync($"api/post?q={Member.UserName}&ps={PageSize}&p={CurrentPage}");
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
}
