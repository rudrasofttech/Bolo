using Microsoft.AspNetCore.SignalR.Client;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using Waarta.Helpers;
using Waarta.Models;
using Waarta.Resources;
using Waarta.Services;
using Waarta.ViewModels;
using Xamarin.Essentials;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Waarta.Views
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class ChatPage : ContentPage
    {
        readonly HubConnection hc;
        readonly WaartaDataStore ds;
        bool hadUnseenMessages;
        public MemberDTO Other { get; set; }
        public MemberDTO Myself { get; set; }
        public Dictionary<Guid, ChatMessage> MessageList { get; set; }
        
        public event EventHandler<MemberDTO> UnseenMessageStatusUpdated;
        public ChatPage()
        {
            InitializeComponent();
            ds = new WaartaDataStore();

            hc = new HubConnectionBuilder().WithUrl("https://waarta.com/personchathub", options =>
            {
                options.AccessTokenProvider = () => Task.FromResult(Waarta.Helpers.Settings.Token);
                options.CloseTimeout = TimeSpan.FromMinutes(2);
            }).WithAutomaticReconnect().Build();

            hc.Closed += async (error) =>
            {
                await Task.Delay(new Random().Next(0, 5) * 1000);
                await hc.StartAsync();
            };

        }

        #region PersonalChatHub
        async Task Connect()
        {
            await hc.StartAsync();
        }
        async Task Disconnect()
        {

            await hc.StopAsync();
            _ = hc.DisposeAsync();
        }

        //async void SayHello()
        //{
        //    try
        //    {
        //        await hc.InvokeAsync("sayHello", Myself.ID.ToString().ToLower(), Other.ID.ToString().ToLower());
        //    }catch(Exception ex)
        //    {
        //        Console.WriteLine("SayHello gave exception");
        //        Console.WriteLine(ex.Message);
        //    }
        //}

        /// <summary>
        /// Save received messages to dictionary and ui as well.
        /// </summary>
        /// <param name="sender">Sender GUID</param>
        /// <param name="text">Message</param>
        /// <param name="timestamp">date and time when the message was sent</param>
        /// <param name="id">Message GUID</param>
        void ReceiveTextMessage(Guid sender, string text, DateTime timestamp, Guid id)
        {
            ChatMessage cm = new ChatMessage() { ID = id, Sender = sender, Text = text, TimeStamp = timestamp, Status = ChatMessageSentStatus.Seen };
            if (sender == Other.ID)
            {
                MessageList.Add(cm.ID, cm);
                AddMsgToStack(cm);
            }
        }

        bool SendTextMessage(string text)
        {
            ChatMessage cm = new ChatMessage() { ID = Guid.NewGuid(), Sender = Myself.ID, Status = ChatMessageSentStatus.Pending, Text = text, TimeStamp = DateTime.Now };
            MessageList.Add(cm.ID, cm);
            AddMsgToStack(cm);
            ds.SaveMessagestoFile(Myself, Other, MessageList);
            if (hc.State == HubConnectionState.Connected)
            {
                try
                {
                    _ = hc.InvokeAsync("SendTextMessageWithID", Other.ID.ToString().ToLower(), Myself.ID.ToString().ToLower(), cm.Text, cm.ID.ToString().ToLower());
                    return true;
                }
                catch (Exception ex)
                {
                    Debug.WriteLine("Error while sending text message");
                    Debug.WriteLine(ex.Message);
                    return false;
                }
            }
            else
            {
                return false;
            }
        }
        #endregion

        private void BackBtn_Clicked(object sender, EventArgs e)
        {
            Navigation.PopModalAsync(true);
        }

        private async void ContentPage_Appearing(object sender, EventArgs e)
        {
            Waarta.Helpers.Settings.Activity = ActivityStatus.Chat;
            BindUIControls();
            MessageList = ds.LoadMessagesFromFile(Myself, Other);
            foreach (ChatMessage cm in MessageList.Values)
            {
                if (cm.Status == ChatMessageSentStatus.Received)
                {
                    cm.Status = ChatMessageSentStatus.Seen;
                    hadUnseenMessages = true;
                }
                AddMsgToStack(cm);
            }
            //if there were unseenmessages from this member, then only update contact list file
            if (hadUnseenMessages)
            {
                UnseenMessageStatusUpdated?.Invoke(this, Other);   
            }
            
            SetHubconnectionOnFuncs();
            
            await Connect();

            //var lastChild = MsgStack.Children.LastOrDefault();
            //if (lastChild != null)
            //{
            //    Device.BeginInvokeOnMainThread(() =>
            //     ScrollViewSV.ScrollToAsync(lastChild, ScrollToPosition.End, true)
            //    );
            //}
        }

        private void BindUIControls()
        {
            this.ProPic.Source = Other.Image;
            this.NameTxt.Text = Other.Name.Length > 15 ? Other.Name.Substring(0, 12) + "..." : Other.Name;
            this.OnlineStatusTxt.Text = Other.Activity != ActivityStatus.Offline ? AppResource.UniOnlineText : AppResource.UniOfflineText;
        }

        private void SetHubconnectionOnFuncs()
        {
            hc.Remove("ReceiveTextMessage");
            hc.Remove("MessageSent");
            hc.Remove("ContactUpdated");
            hc.On<string, string, string, string>("ReceiveTextMessage", (sender, text, timestamp, id) =>
            {
                ReceiveTextMessage(new Guid(sender), text, DateTime.Parse(timestamp), new Guid(id));
            });

            hc.On<string, string, string, string>("MessageSent", (receiver, text, timestamp, id) =>
            {
                Guid mid = new Guid(id);
                MessageList[mid].Status = ChatMessageSentStatus.Sent;
                ds.SaveMessagestoFile(Myself, Other, MessageList);

            });

            hc.On<MemberDTO>("ContactUpdated", (dto) =>
            {
                MemberDTO temp = dto; 
                if (Other.ID == temp.ID)
                {
                    Other.Activity = temp.Activity;
                    Other.Bio = temp.Bio;
                    Other.BirthYear = temp.BirthYear;
                    Other.ChannelName = temp.ChannelName;
                    Other.City = temp.City;
                    Other.Country = temp.Country;
                    Other.Gender = temp.Gender;
                    Other.LastPulse = temp.LastPulse;
                    Other.Name = temp.Name;
                    if (Other.Pic != temp.Pic)
                    {
                        Other.Pic = temp.Pic;
                        this.ProPic.Source = Other.Image;
                    }
                    Other.State = temp.State;
                    Other.ThoughtStatus = temp.ThoughtStatus;
                    Other.Visibility = temp.Visibility;   
                }
            });
        }

        private void SendBtn_Clicked(object sender, EventArgs e)
        {
            if (!string.IsNullOrEmpty(MessageTxt.Text))
            {
                if (SendTextMessage(MessageTxt.Text.Trim()))
                {
                    MessageTxt.Text = string.Empty;
                }
            }
        }

        private void AddMsgToStack(ChatMessage cm)
        {

            int colno, rowno;
            Grid mgrid = new Grid();
            mgrid.RowDefinitions.Add(new RowDefinition());
            mgrid.BindingContext = cm;
            if (cm.Sender == Myself.ID)
            {
                mgrid.ColumnDefinitions.Add(new ColumnDefinition() { Width = new GridLength(40, GridUnitType.Absolute) });
                mgrid.ColumnDefinitions.Add(new ColumnDefinition() { Width = GridLength.Star });
                colno = 1; rowno = 0;
            }
            else
            {
                mgrid.ColumnDefinitions.Add(new ColumnDefinition() { Width = GridLength.Star });
                mgrid.ColumnDefinitions.Add(new ColumnDefinition() { Width = new GridLength(40, GridUnitType.Absolute) });
                colno = 0; rowno = 0;
            }
            
            mgrid.Children.Add(textlbl, colno, rowno);
            MsgStack.Children.Add(mgrid);
            
        }

        Label GetLabelForMessage(ChatMessage cm)
        {
            Label textlbl = new Label()
            {
                FontSize = 16,
                Text = cm.Text,
                Padding = new Thickness(5),
                TextColor = Color.Black
            };

            if (cm.Sender == Myself.ID)
            {
                textlbl.HorizontalOptions = LayoutOptions.End;
                textlbl.HorizontalTextAlignment = TextAlignment.End;
                textlbl.BackgroundColor = Color.FromRgb(219, 244, 253);
                textlbl.Margin = new Thickness(0, 3, 10, 2);
            }
            else
            {
                textlbl.HorizontalOptions = LayoutOptions.Start;
                textlbl.HorizontalTextAlignment = TextAlignment.Start;
                textlbl.BackgroundColor = Color.FromRgb(242, 246, 249);
                textlbl.Margin = new Thickness(10, 3, 0, 2);
            }

            return textlbl;
        }

        private void ContentPage_Disappearing(object sender, EventArgs e)
        {
            
            ds.SaveMessagestoFile(Myself, Other, MessageList);
            //try
            //{
            //    _ = Disconnect();
            //}
            //catch { }
        }
    }
}