using Microsoft.AspNetCore.SignalR.Client;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Waarta.Models;
using Waarta.Resources;
using Waarta.Services;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Waarta.Views
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class Conversations : ContentPage
    {
        readonly HubConnection hc;
        readonly WaartaDataStore ds;
        readonly ContactsService cService;
        readonly MemberService mService;
        public Dictionary<Guid, ContactDTO> ContactDictionary { get; private set; }

        MemberDTO mdto = null;
        public bool ShouldBindContactList;
        public Conversations()
        {
            InitializeComponent();
            ContactDictionary = new Dictionary<Guid, ContactDTO>();
            ds = new WaartaDataStore();
            mService = new MemberService();
            cService = new ContactsService();
            
            ShouldBindContactList = true;
            BindingContext = this;
            Waarta.Helpers.Settings.Activity = ActivityStatus.Online;

            this.Title = AppResource.ConTitle;
            SearchBar.Placeholder = AppResource.ConSearchBarPH;
            
            
            ContactListView.RefreshCommand = new Command(async () => {
                await LoadContactsfromServer();
                ContactListView.ItemsSource = null;
                ContactListView.ItemsSource = ContactDictionary;
                ContactListView.IsRefreshing = false;
            });

            hc = new HubConnectionBuilder().WithUrl("https://waarta.com/personchathub", options =>
            {
                options.AccessTokenProvider = () => Task.FromResult(Waarta.Helpers.Settings.Token);
            }).WithAutomaticReconnect().Build();

            hc.Closed += async (error) =>
            {
                await Task.Delay(new Random().Next(0, 5) * 1000);
                await hc.StartAsync();
            };
        }

        private void ContentPage_Appearing(object sender, EventArgs e)
        {
            if (!string.IsNullOrEmpty(Waarta.Helpers.Settings.Myself))
            {
                mdto = (MemberDTO)JsonConvert.DeserializeObject(Waarta.Helpers.Settings.Myself, typeof(MemberDTO));
                cService.Token = Waarta.Helpers.Settings.Token;
                mService.Token = Waarta.Helpers.Settings.Token;
            }
            if (mdto == null)
            {
                LoginMsgLbl.IsVisible = true;
                GotoLoginBtn.IsVisible = true;
                SearchBar.IsVisible = false;
                ContactListView.IsVisible = false;
                return;
            }
            else
            {
                LoginMsgLbl.IsVisible = false;
                GotoLoginBtn.IsVisible = false;
                SearchBar.IsVisible = true;
                ContactListView.IsVisible = true;
            }
            if (ShouldBindContactList)
            {
                //load contacts from local data store
                this.LoadContactsfromFile();
                ShouldBindContactList = false;
            }

            try
            {
                _ = ConnectHub();
                SetHubconnectionOnFuncs();
            }
            catch { }
        }

        private void Lp_LoggedIn(object sender, MemberDTO e)
        {
            if (!string.IsNullOrEmpty(Waarta.Helpers.Settings.Myself))
            {
                mdto = (MemberDTO)JsonConvert.DeserializeObject(Waarta.Helpers.Settings.Myself, typeof(MemberDTO));
                cService.Token = Waarta.Helpers.Settings.Token;
                mService.Token = Waarta.Helpers.Settings.Token;
            }
            
        }

        async Task ConnectHub()
        {
            await hc.StartAsync();
        }
        async Task DisconnectHub()
        {

            await hc.StopAsync();
        }

        private void SetHubconnectionOnFuncs()
        {
            hc.Remove("ReceiveTextMessage");
            hc.Remove("ContactUpdated");
            hc.On<Guid, string, DateTime, Guid>("ReceiveTextMessage", (sender, text, timestamp, id) =>
            {
            ReceiveTextMessage(sender, text, timestamp, id);
            });


            hc.On<MemberDTO>("ContactUpdated", (temp) =>
            {
                if (ContactDictionary.ContainsKey(temp.ID))
                {
                    ContactDictionary[temp.ID].Person.Activity = temp.Activity;
                    ContactDictionary[temp.ID].Person.Bio = temp.Bio;
                    ContactDictionary[temp.ID].Person.BirthYear = temp.BirthYear;
                    ContactDictionary[temp.ID].Person.ChannelName = temp.ChannelName;
                    ContactDictionary[temp.ID].Person.City = temp.City;
                    ContactDictionary[temp.ID].Person.Country = temp.Country;
                    ContactDictionary[temp.ID].Person.Gender = temp.Gender;
                    ContactDictionary[temp.ID].Person.LastPulse = temp.LastPulse;
                    ContactDictionary[temp.ID].Person.Name = temp.Name;
                    ContactDictionary[temp.ID].Person.Pic = temp.Pic;
                    ContactDictionary[temp.ID].Person.State = temp.State;
                    ContactDictionary[temp.ID].Person.ThoughtStatus = temp.ThoughtStatus;
                    ContactDictionary[temp.ID].Person.Visibility = temp.Visibility;
                    ContactListView.ItemsSource = ContactDictionary;
                }
            });
        }

        void ReceiveTextMessage(Guid sender, string text, DateTime timestamp, Guid id)
        {
            ChatMessage cm = new ChatMessage() { ID = id, Sender = sender, Text = text, TimeStamp = timestamp, Status = ChatMessageSentStatus.Seen };
            if (ContactDictionary.ContainsKey(sender))
            {
                cm.Status = ChatMessageSentStatus.Received;
                Dictionary<Guid, ChatMessage> temp = ds.LoadMessagesFromFile(mdto, ContactDictionary[sender].Person);
                temp.Add(cm.ID, cm);
                ds.SaveMessagestoFile(mdto, ContactDictionary[sender].Person, temp);
                ContactDictionary[sender].UnseenMessageCount++;
                
                ContactListView.ItemsSource = null;
                ContactListView.ItemsSource = ContactDictionary;
            }

        }

        /// <summary>
        /// Function loads current member contacts from local file storage.
        /// </summary>
        private void LoadContactsfromFile()
        {            
            ContactDictionary = ds.LoadContactsfromFile(mdto);
            
            ContactListView.ItemsSource = ContactDictionary;
        }

        private async Task LoadContactsfromServer()
        {
            List<ContactDTO> temp = await cService.GetContacts();
            foreach (ContactDTO t in temp)
            {
                if (ContactDictionary.ContainsKey(t.Person.ID))
                {
                    ContactDictionary[t.Person.ID].RecentMessage = t.RecentMessage;
                    ContactDictionary[t.Person.ID].RecentMessageDate = t.RecentMessageDate;
                    ContactDictionary[t.Person.ID].Person = t.Person;
                }
                else
                {
                    ContactDictionary.Add(t.Person.ID, t);
                }

                if (t.MessagesOnServer.Count > 0)
                {
                    Dictionary<Guid, ChatMessage> msgs = ds.LoadMessagesFromFile(mdto, t.Person);
                    foreach (ChatMessageDTO i in t.MessagesOnServer)
                    {
                        if (!msgs.ContainsKey(i.ID))
                        {
                            var mi = new ChatMessage() { ID = i.ID, Sender = i.SentBy.ID, Text = i.Message, TimeStamp = i.SentDate, Status = ChatMessageSentStatus.Received };
                            msgs.Add(mi.ID, mi);

                            ContactDictionary[t.Person.ID].RecentMessageDate = mi.TimeStamp;
                            ContactDictionary[mi.Sender].UnseenMessageCount += 1;

                        }
                    }
                    ds.SaveMessagestoFile(mdto, t.Person, msgs);
                }
            }
            ds.SaveContactstoFile(mdto, ContactDictionary);
        }

        private async void OpenChatPage(MemberDTO m)
        {

            ChatPage cp = new ChatPage
            {
                Other = m,
                Myself = mdto,
                ShouldCreateMessageGrid = true
            };
            cp.UnseenMessageStatusUpdated += Cp_UnseenMessageStatusUpdated;
            await Navigation.PushModalAsync(cp);
        }
        
        private void ListView_ItemTapped(object sender, ItemTappedEventArgs e)
        {
            KeyValuePair<Guid, ContactDTO> item = (KeyValuePair<Guid, ContactDTO>)e.Item;
            OpenChatPage(item.Value.Person);
        }

        private void Cp_UnseenMessageStatusUpdated(object sender, MemberDTO e)
        {
            if (ContactDictionary.ContainsKey(e.ID))
            {
                ContactDictionary[e.ID].UnseenMessageCount = 0;
                ContactListView.ItemsSource = null;
                ContactListView.ItemsSource = ContactDictionary;
            }
        }

        private async void SearchBar_SearchButtonPressed(object sender, EventArgs e)
        {
            List<MemberDTO> result = await mService.Search(SearchBar.Text.Trim());
            Dictionary<Guid, ContactDTO> SearchDictionary = new Dictionary<Guid, ContactDTO>();
            int i = 0;
            foreach(MemberDTO m in result)
            {
                if (!ContactDictionary.ContainsKey(m.ID))
                {
                    SearchDictionary.Add(m.ID, new ContactDTO()
                    {
                        BoloRelation = BoloRelationType.Search,
                        CreateDate = DateTime.Now,
                        ID = ++i,
                        MessagesOnServer = new List<ChatMessageDTO>(),
                        Person = m,
                        RecentMessage = ""
                    });
                }
                else
                {
                    SearchDictionary.Add(m.ID, ContactDictionary[m.ID]);
                }
            }

            ContactListView.ItemsSource = SearchDictionary;
        }

        private void SearchBar_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (string.IsNullOrEmpty(SearchBar.Text)){
                this.LoadContactsfromFile();
            }
        }

        private void ContentPage_Disappearing(object sender, EventArgs e)
        {
            if (mdto != null)
            {
                ds.SaveContactstoFile(mdto, ContactDictionary);
            }
            //_ = DisconnectHub();
        }

        private void ChatMenuItem_Clicked(object sender, EventArgs e)
        {
            var mi = ((MenuItem)sender);
            KeyValuePair<Guid, ContactDTO> item = (KeyValuePair<Guid, ContactDTO>)mi.CommandParameter;
            OpenChatPage(item.Value.Person);
        }

        private void ProfileMenuItem_Clicked(object sender, EventArgs e)
        {
            var mi = ((MenuItem)sender);
            KeyValuePair<Guid, ContactDTO> item = (KeyValuePair<Guid, ContactDTO>)mi.CommandParameter;
            //Debug.WriteLine("More Context Action clicked: " + mi.CommandParameter);
            ProfilePage pp = new ProfilePage() {
                BindingContext = item.Value.Person
            };
            Navigation.PushAsync(pp);
        }

        private async void ClearMenuItem_Clicked(object sender, EventArgs e)
        {
            bool answer = await DisplayAlert("Are you sure?", "All messages from this contact will be removed.", "Yes", "No");
            Debug.WriteLine("Answer: " + answer);
            if (answer)
            {
                var mi = ((MenuItem)sender);
                KeyValuePair<Guid, ContactDTO> item = (KeyValuePair<Guid, ContactDTO>)mi.CommandParameter;
                ds.ClearMessagesFromFile(mdto, item.Value.Person);
            }
        }

        private void GotoLoginBtn_Clicked(object sender, EventArgs e)
        {
            LoginPage lp = new LoginPage();
            lp.LoggedIn += Lp_LoggedIn;
            Shell.Current.Navigation.PushModalAsync(lp);
        }
    }
}