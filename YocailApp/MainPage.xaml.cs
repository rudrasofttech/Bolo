﻿using System.Diagnostics;
using System.Text;
using System.Text.Json;
using YocailApp.Resources.Translations;
using YocailApp.ViewModel;

namespace YocailApp
{
    public partial class MainPage : ContentPage
    {

        public MainPage()
        {
            InitializeComponent();
            Loaded += MainPage_Loaded;
        }

        private void MainPage_Loaded(object sender, EventArgs e)
        {
            (BindingContext as MainPageVM).CurrentMember = JsonSerializer.Deserialize<MemberModel>(AccessSecureStorage.GetCurrentMember()
                , new JsonSerializerOptions() { PropertyNameCaseInsensitive = true });
            (BindingContext as MainPageVM).LoadFeedFromCache();
            if (!(BindingContext as MainPageVM).HasCacheData)
            if ((BindingContext as MainPageVM).Posts.Count == 0)
            {
                _= (BindingContext as MainPageVM).LoadData();
            }
        }

        

        private async void PostCV_HamburgerMenuClicked(PostVM sender)
        {
            var actions = new List<string>();
            if(sender.IsOwner)
            {
                actions.Add(AppRes.EditTxt);
                actions.Add(AppRes.DeleteTxt);
            }
            else
            {
                actions.Add(AppRes.IgnoreMemberTxt);
                actions.Add(AppRes.ReportTxt);
            }
            string action = await DisplayActionSheet(AppRes.ActionTxt, AppRes.CancelTxt, null, buttons: actions.ToArray());
            Debug.WriteLine("Action: " + action);
        }

        private void ScrollView_Scrolled(object sender, ScrolledEventArgs e)
        {
            
        }
    }
}