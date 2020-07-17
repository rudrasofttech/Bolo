using Newtonsoft.Json;
using System;
using System.Collections.Generic;
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
        ContactsService cService;
        MemberService mService;
        public Dictionary<Guid, ContactDTO> ContactDictionary { get; private set; }
        MemberDTO mdto = null;
        public Conversations()
        {
            InitializeComponent();

            this.Title = AppResource.ConTitle;
            SearchBar.Placeholder = AppResource.ConSearchBarPH;
            ContactDictionary = new Dictionary<Guid, ContactDTO>();
            BindingContext = this;
        }

        private async void ContentPage_Appearing(object sender, EventArgs e)
        {

            if (!string.IsNullOrEmpty(Waarta.Helpers.Settings.Myself))
            {
                mdto = (MemberDTO)JsonConvert.DeserializeObject(Waarta.Helpers.Settings.Myself, typeof(MemberDTO));
            }
            mService = new MemberService();
            cService = new ContactsService();
            if (mdto == null)
            {
                await Navigation.PushModalAsync(new LoginPage());
                mdto = (MemberDTO)JsonConvert.DeserializeObject(Waarta.Helpers.Settings.Myself, typeof(MemberDTO));
            }
            //load contacts from local data store
            this.LoadContactsfromFile();

            if (ContactDictionary.Count == 0)
            {
                try
                {
                    //load contact from server without waiting
                    //you will get latest of contacts info and 
                    //latest unread messages from server
                    await LoadContactsfromServer();
                    ContactListView.ItemsSource = ContactDictionary;
                }
                catch (ServerErrorException)
                {

                }
            }
            

        }

        /// <summary>
        /// Function loads current member contacts from local file storage.
        /// </summary>
        private void LoadContactsfromFile()
        {
            ContactDictionary.Clear();
            string filePath = Path.Combine(Waarta.Helpers.Settings.LocalAppDataPath, string.Format("Contacts{0}.txt", mdto.ID.ToString().ToLower()));
            if (File.Exists(filePath))
            {
                ContactDictionary = (Dictionary<Guid, ContactDTO>)JsonConvert.DeserializeObject(File.ReadAllText(filePath), typeof(Dictionary<Guid, ContactDTO>));
            }
            else
            {
                ContactDictionary = new Dictionary<Guid, ContactDTO>();
            }
            ContactListView.ItemsSource = ContactDictionary;
        }

        private async Task LoadContactsfromServer()
        {
            string filePath = Path.Combine(Waarta.Helpers.Settings.LocalAppDataPath, string.Format("Contacts{0}.txt", mdto.ID.ToString().ToLower()));
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
                    Dictionary<Guid, ChatMessage> msgs = new Dictionary<Guid, ChatMessage>();
                    //local message file path
                    string lmfpath = Path.Combine(Waarta.Helpers.Settings.LocalAppDataPath, string.Format("{0}{1}.txt", mdto.ID.ToString().ToLower(), t.Person.ID.ToString().ToLower()));
                    if (File.Exists(lmfpath))
                    {
                        try
                        {
                            msgs = (Dictionary<Guid, ChatMessage>)JsonConvert.DeserializeObject(File.ReadAllText(lmfpath), typeof(Dictionary<Guid, ChatMessage>));
                        }
                        catch { }
                    }
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
                    string msgsstr = JsonConvert.SerializeObject(msgs);
                    File.WriteAllText(lmfpath, msgsstr);
                }
            }

            File.WriteAllText(filePath, JsonConvert.SerializeObject(ContactDictionary));

        }

        private void ListView_ItemSelected(object sender, SelectedItemChangedEventArgs e)
        {

        }

        private void ListView_ItemTapped(object sender, ItemTappedEventArgs e)
        {

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
    }
}