using Microsoft.AspNetCore.SignalR.Client;
using Newtonsoft.Json;
using Plugin.Media;
using Plugin.Media.Abstractions;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using System.Xml;
using Waarta.Helpers;
using Waarta.Models;
using Waarta.Resources;
using Waarta.Services;
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
        readonly MemberService ms;
        public MemberDTO Other { get; set; }
        public MemberDTO Myself { get; set; }
        public Dictionary<Guid, ChatMessage> MessageList { get; set; }
        public bool ShouldCreateMessageGrid;
        public ICommand HyperLinkTapCommand => new Command<string>(async (url) => await Launcher.OpenAsync(url));

        public event EventHandler<MemberDTO> UnseenMessageStatusUpdated;
        public ChatPage()
        {
            InitializeComponent();
            ds = new WaartaDataStore();
            ms = new MemberService();
            hc = new HubConnectionBuilder().WithUrl("https://waarta.com/personchathub", options =>
            {
                options.AccessTokenProvider = () => Task.FromResult(Waarta.Helpers.Settings.Token);
                options.CloseTimeout = TimeSpan.FromMinutes(2);
            }).WithAutomaticReconnect().Build();
            SetHubconnectionOnFuncs();
            hc.Closed += async (error) =>
            {
                await Task.Delay(new Random().Next(0, 5) * 1000);
                await hc.StartAsync();
            };
        }

        #region PersonalChatHub
        async Task Connect()
        {
            if (hc != null)
            {
                if (hc.State == HubConnectionState.Disconnected)
                {
                    await hc.StartAsync();
                }
            }
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
            ChatMessage cm = new ChatMessage() { ID = Guid.NewGuid(), Sender = Myself.ID, MessageType = ChatMessageType.Text, Status = ChatMessageSentStatus.Pending, Text = text, TimeStamp = DateTime.Now };
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
            Navigation.PopModalAsync();
        }

        private async void ContentPage_Appearing(object sender, EventArgs e)
        {
            Waarta.Helpers.Settings.Activity = ActivityStatus.Chat;
            BindUIControls();
            if (ShouldCreateMessageGrid)
            {
                DateTime temp = DateTime.UtcNow;
                MessageList = ds.LoadMessagesFromFile(Myself, Other);
                foreach (ChatMessage cm in MessageList.Values)
                {
                    if(temp.ToString("yyyy MMM d") != cm.TimeStamp.ToString("yyyy MMM d"))
                    {
                        temp = cm.TimeStamp;
                        AddDateLabelToStack(cm.TimeStamp);
                    }
                    if (cm.Status == ChatMessageSentStatus.Received)
                    {
                        cm.Status = ChatMessageSentStatus.Seen;
                    }
                    cm.Text = cm.Text;
                    AddMsgToStack(cm);
                }
                ShouldCreateMessageGrid = false;
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

        private void AddUploadPhotoMsgToStack(string path)
        {
            ChatMessage cm = new ChatMessage() { ID = Guid.NewGuid(), Sender = Myself.ID, MessageType = ChatMessageType.Photo, Status = ChatMessageSentStatus.Pending, Text = string.Format("https://waarta.com/data/{0}/{1}", Myself.ID.ToString().ToLower(), Path.GetFileName(path)), LocalPath = path, TimeStamp = DateTime.Now };
            Grid mgrid = AddMsgToStack(cm);
            mgrid.RowDefinitions.Add(new RowDefinition() { Height = 20 });
            mgrid.RowDefinitions.Add(new RowDefinition() { Height = 5 });

            ProgressBar pb = new ProgressBar() { HeightRequest = 5, Progress = 0, Margin = new Thickness(3) };
            mgrid.Children.Add(pb, 0, 3);
            FileInfo fi = new FileInfo(path);
            Label lsize = new Label() { Text = fi.Exists ? GetBytesReadable(fi.Length) : "", FontSize = 10, HeightRequest = 20, Margin = new Thickness(3), VerticalOptions = LayoutOptions.Start, HorizontalOptions = LayoutOptions.End };
            mgrid.Children.Add(lsize, 0, 2);
            UploadFile(Path.GetFileName(path), path, mgrid, cm);

            MessageList.Add(cm.ID, cm);

            if (hc.State == HubConnectionState.Connected)
            {
                try
                {
                    _ = hc.InvokeAsync("SendTextMessageWithID", Other.ID.ToString().ToLower(), Myself.ID.ToString().ToLower(), cm.Text, cm.ID.ToString().ToLower());
                }
                catch (Exception ex)
                {
                    Debug.WriteLine("Error while sending photo message");
                    Debug.WriteLine(ex.Message);
                }
            }
        }

        private void AddUploadVideoMsgToStack(string path, string thumbpath)
        {
            ChatMessage cm = new ChatMessage()
            {
                ID = Guid.NewGuid(),
                MessageType = ChatMessageType.Video,
                Sender = Myself.ID,
                Status = ChatMessageSentStatus.Pending,
                Text = string.Format("https://waarta.com/data/{0}/{1}", Myself.ID.ToString().ToLower(), Path.GetFileName(path)),
                LocalPath = path,
                TimeStamp = DateTime.Now
            };

            Grid mgrid = AddMsgToStack(cm);
            mgrid.RowDefinitions.Add(new RowDefinition() { Height = 20 });
            mgrid.RowDefinitions.Add(new RowDefinition() { Height = 11 });

            ProgressBar pb = new ProgressBar() { HeightRequest = 5, Progress = 0, Margin = new Thickness(3) };
            mgrid.Children.Add(pb, 0, 3);
            FileInfo fi = new FileInfo(path);
            Label lsize = new Label() { Text = GetBytesReadable(fi.Length), FontSize = 10, HeightRequest = 20, Margin = new Thickness(3), VerticalOptions = LayoutOptions.Center, HorizontalOptions = LayoutOptions.End, VerticalTextAlignment = TextAlignment.Center, HorizontalTextAlignment = TextAlignment.Center };
            mgrid.Children.Add(lsize, 0, 2);

            UploadFile(Path.GetFileName(path), path, mgrid, cm, thumbpath);

            MessageList.Add(cm.ID, cm);
        }

        public string GetBytesReadable(long i)
        {
            // Get absolute value
            long absolute_i = (i < 0 ? -i : i);
            // Determine the suffix and readable value
            string suffix;
            double readable;
            if (absolute_i >= 0x1000000000000000) // Exabyte
            {
                suffix = "EB";
                readable = (i >> 50);
            }
            else if (absolute_i >= 0x4000000000000) // Petabyte
            {
                suffix = "PB";
                readable = (i >> 40);
            }
            else if (absolute_i >= 0x10000000000) // Terabyte
            {
                suffix = "TB";
                readable = (i >> 30);
            }
            else if (absolute_i >= 0x40000000) // Gigabyte
            {
                suffix = "GB";
                readable = (i >> 20);
            }
            else if (absolute_i >= 0x100000) // Megabyte
            {
                suffix = "MB";
                readable = (i >> 10);
            }
            else if (absolute_i >= 0x400) // Kilobyte
            {
                suffix = "KB";
                readable = i;
            }
            else
            {
                return i.ToString("0 B"); // Byte
            }
            // Divide by 1024 to get fractional value
            readable /= 1024;
            // Return formatted number with suffix
            return readable.ToString("0.### ") + suffix;
        }

        async void DownloadFile(ChatMessageDownloadModel cmdm)
        {
            Grid grid = cmdm.Grid;
            ChatMessage cm = cmdm.Message;
            ProgressBar bar = null;
            Label lb = null;
            foreach (View v in grid.Children)
            {
                if (v is ProgressBar)
                    bar = v as ProgressBar;
                if (v is Label)
                    lb = v as Label;
            }

            string filepathshort = cm.Text.ToLower().TrimStart("https://waarta.com/data/".ToCharArray());
            string targetfpath = Path.Combine(ds.GetDataFolderPath(Myself, Other), Path.GetFileName(filepathshort));
            if (File.Exists(targetfpath))
            {
                File.Delete(targetfpath);
            }
            cmdm.Position = 0;
            if (lb != null)
            {
                lb.Text = AppResource.CPCancelDownloadFileLabel;
            }
            while (cmdm.Position > -1 && (cmdm.Status == DownloadStatus.Downloading || cmdm.Status == DownloadStatus.Pending))
            {
                try
                {
                    cmdm.Status = DownloadStatus.Downloading;
                    cm.FileDownloadStatus = FileDownloadStatus.Downloading;
                    DownloadedChunk dc = await ms.DownloadChunk(filepathshort, cmdm.Position);

                    cmdm.Position = dc.Position;
                    cmdm.Length = dc.Length;
                    if (File.Exists(targetfpath))
                    {
                        using (FileStream stream = File.Open(targetfpath, FileMode.Append, FileAccess.Write))
                        {
                            byte[] arr = Convert.FromBase64String(dc.Data);
                            stream.Write(arr, 0, arr.Length);
                        }
                    }
                    else
                    {
                        using (FileStream stream = File.Open(targetfpath, FileMode.OpenOrCreate, FileAccess.Write))
                        {
                            byte[] arr = Convert.FromBase64String(dc.Data);
                            stream.Write(arr, 0, arr.Length);
                        }
                    }
                    if (bar != null)
                    {
                        bar.IsVisible = true;
                        _ = bar.ProgressTo((double)cmdm.Position / dc.Length, 500, Easing.Linear);
                    }
                    if (dc.Position >= dc.Length)
                    {
                        cmdm.Status = DownloadStatus.Completed;
                        cm.LocalPath = targetfpath;
                        cm.FileDownloadStatus = FileDownloadStatus.Downloaded;
                        if (lb != null)
                        {
                            lb.Text = AppResource.CPTapFileLabel;
                        }
                        //DependencyService.Get<IVideoPicker>().GenerateThumbnail(cm.LocalPath, cm.LocalPath.ToLower().Replace(Path.GetExtension(cm.LocalPath), "-thumb.jpg"));
                        await ms.DownloadChunk(cm.LocalPath.ToLower().Replace(Path.GetExtension(cm.LocalPath), "-thumb.jpg"), 0);
                        if (bar != null)
                        {
                            bar.IsVisible = false;
                        }
                        break;
                    }
                }
                catch
                {
                    cmdm.Status = DownloadStatus.Canceled;
                    break;
                }
            }
            if (cmdm.Status == DownloadStatus.Canceled)
            {
                File.Delete(targetfpath);
                cmdm.Position = 0;
                if (bar != null)
                {
                    bar.IsVisible = false;
                    bar.Progress = 0;
                }
                if (lb != null)
                {
                    lb.Text = AppResource.CPDownloadFileLabel;
                }
            }
        }

        private async void UploadFile(string filename, string filePath, Grid grid, ChatMessage cm, string thumbpath = "")
        {
            ProgressBar bar = null;
            foreach (View v in grid.Children)
            {
                if (v is ProgressBar)
                {
                    bar = v as ProgressBar;
                    break;
                }
            }
            using (Stream objStream = File.OpenRead(filePath))
            {
                // Read data from file
                byte[] arrData = { };

                // Read data from file until read position is not equals to length of file
                while (objStream.Position != objStream.Length)
                {
                    // Read number of remaining bytes to read
                    long lRemainingBytes = objStream.Length - objStream.Position;

                    // If bytes to read greater than 2 mega bytes size create array of 2 mega bytes
                    // Else create array of remaining bytes
                    if (lRemainingBytes > 262144)
                    {
                        arrData = new byte[262144];
                    }
                    else
                    {
                        arrData = new byte[lRemainingBytes];
                    }

                    // Read data from file
                    objStream.Read(arrData, 0, arrData.Length);

                    // Other code whatever you want to deal with read data
                    await ms.UploadChunk(Convert.ToBase64String(arrData), filename, false);

                    await bar.ProgressTo((double)objStream.Position / objStream.Length, 500, Easing.Linear);
                }
                grid.Children.Remove(bar);
                //upload thumbnail image
                if (File.Exists(thumbpath))
                {
                    await ms.UploadChunk(Convert.ToBase64String(File.ReadAllBytes(thumbpath)), Path.GetFileName(thumbpath), false);
                }
                if (hc.State == HubConnectionState.Connected)
                {
                    try
                    {
                        _ = hc.InvokeAsync("SendTextMessageWithID", Other.ID.ToString().ToLower(), Myself.ID.ToString().ToLower(), cm.Text, cm.ID.ToString().ToLower());
                        cm.Status = ChatMessageSentStatus.Sent;
                    }
                    catch (Exception ex)
                    {
                        Debug.WriteLine("Error while sending photo message");
                        Debug.WriteLine(ex.Message);
                    }
                }
            }
        }

        private Label AddDateLabelToStack(DateTime dt)
        {
            Label dtlbl = new Label() { Text = dt.ToLocalTime().ToString("yyyy MMM d"), 
                TextColor = Color.FromHex("495057"), 
                BackgroundColor = Color.Transparent, 
                Margin = new Thickness(7),
                HorizontalOptions = LayoutOptions.CenterAndExpand,
                HorizontalTextAlignment = TextAlignment.Center,
                FontAttributes = FontAttributes.Bold,
                FontSize = 12
            };
            MsgStack.Children.Add(dtlbl);
            return dtlbl;
        }

        /// <summary>
        /// Add a chat message to ui
        /// </summary>
        /// <param name="cm">Target Chat Message Object</param>
        /// <returns></returns>
        private Grid AddMsgToStack(ChatMessage cm)
        {
            Grid mgrid = new Grid() { VerticalOptions = LayoutOptions.Start, Padding = new Thickness(5) };
            //row holds message option button
            mgrid.RowDefinitions.Add(new RowDefinition() { Height = 25 });
            //row holds message label or image 
            mgrid.RowDefinitions.Add(new RowDefinition());
            mgrid.ColumnDefinitions.Add(new ColumnDefinition() { Width = GridLength.Auto });
            mgrid.BindingContext = cm;

            //Button will show different operations can be performed on a message
            ImageButton MsgOptBtn = new ImageButton()
            {
                WidthRequest = 20,
                HeightRequest = 20,
                Aspect = Aspect.AspectFit,
                Opacity = 0.7,
                Source = ImageSource.FromFile("verticalellipsis.png"),
                CommandParameter = cm.ID,
                VerticalOptions = LayoutOptions.Center,
                HorizontalOptions = LayoutOptions.End,
                BackgroundColor = Color.White,
                CornerRadius = 15
            };

            MsgOptBtn.Clicked += MsgOptBtn_Clicked;
            mgrid.Children.Add(MsgOptBtn, 0, 0);
            if (cm.Sender == Myself.ID)
            {
                mgrid.HorizontalOptions = LayoutOptions.End;
                mgrid.BackgroundColor = Color.FromRgb(219, 244, 253);
            }
            else
            {
                mgrid.HorizontalOptions = LayoutOptions.Start;
                mgrid.BackgroundColor = Color.FromRgb(242, 246, 249);
            }

            switch (cm.MessageType)
            {
                case ChatMessageType.Text:
                    mgrid.Children.Add(GetLabelForMessage(cm), 0, 1);
                    break;
                case ChatMessageType.Photo:
                    ImageButton ibphoto = GetImageForMessage(cm);
                    //if message is received than download it to local , if it was sent then used attach event to open it
                    if (cm.Sender == Myself.ID)
                    {
                        ibphoto.Clicked += Img_Clicked;
                    }
                    else
                    {
                        mgrid.RowDefinitions.Add(new RowDefinition() { Height = 20 });
                        Label lsize = new Label() { Text = AppResource.CPDownloadFileLabel, FontSize = 12, HeightRequest = 20, VerticalTextAlignment = TextAlignment.Center, HorizontalTextAlignment = TextAlignment.Center };
                        mgrid.Children.Add(lsize, 0, 2);
                        if (File.Exists(cm.LocalPath) && cm.FileDownloadStatus == FileDownloadStatus.Downloaded)
                        {
                            ibphoto.Clicked += Img_Clicked;
                            lsize.Text = AppResource.CPTapFileLabel;
                        }
                        else
                        {
                            mgrid.RowDefinitions.Add(new RowDefinition() { Height = 11 });
                            ProgressBar pb = new ProgressBar() { HeightRequest = 5, Progress = 0, Margin = new Thickness(3), IsVisible = false, HorizontalOptions = LayoutOptions.CenterAndExpand };
                            mgrid.Children.Add(pb, 0, 3);

                            ChatMessageDownloadModel cmdm = new ChatMessageDownloadModel()
                            {
                                Grid = mgrid,
                                Length = 0,
                                Position = -1,
                                LocalPath = string.Empty,
                                Message = cm
                            };
                            ibphoto.CommandParameter = cmdm;
                            ibphoto.Clicked += ImageDownloadBtn_Clicked;
                        }
                    }
                    mgrid.Children.Add(ibphoto, 0, 1);
                    break;
                case ChatMessageType.Video:
                    ImageButton ib = GetVideoForMessage(cm);
                    //if message is received than download it to local
                    if (cm.Sender == Myself.ID)
                    {
                        ib.Clicked += VideoThumbBtn_Clicked;
                    }
                    else
                    {
                        mgrid.RowDefinitions.Add(new RowDefinition() { Height = 20 });
                        Label lsize = new Label() { Text = AppResource.CPDownloadFileLabel, FontSize = 12, HeightRequest = 20, VerticalTextAlignment = TextAlignment.Center, HorizontalTextAlignment = TextAlignment.Center };
                        mgrid.Children.Add(lsize, 0, 2);
                        if (File.Exists(cm.LocalPath) && cm.FileDownloadStatus == FileDownloadStatus.Downloaded)
                        {
                            ib.Clicked += VideoThumbBtn_Clicked;
                            lsize.Text = AppResource.CPTapFileLabel;
                        }
                        else
                        {
                            mgrid.RowDefinitions.Add(new RowDefinition() { Height = 11 });
                            ProgressBar pb = new ProgressBar() { HeightRequest = 5, Progress = 0, Margin = new Thickness(3), IsVisible = false, HorizontalOptions = LayoutOptions.CenterAndExpand };
                            mgrid.Children.Add(pb, 0, 3);

                            ChatMessageDownloadModel cmdm = new ChatMessageDownloadModel()
                            {
                                Grid = mgrid,
                                Length = 0,
                                Position = -1,
                                LocalPath = string.Empty,
                                Message = cm
                            };
                            ib.CommandParameter = cmdm;
                            ib.Clicked += VideoDownloadBtn_Clicked;
                        }
                    }
                    mgrid.Children.Add(ib, 0, 1);
                    break;
                case ChatMessageType.Audio:
                    ImageButton mphoto = GetAudioForMessage(cm);
                    //if message is received than download it to local , if it was sent then used attach event to open it
                    if (cm.Sender == Myself.ID)
                    {
                        mphoto.Clicked += Mphoto_Clicked;
                    }
                    else
                    {
                        mgrid.RowDefinitions.Add(new RowDefinition() { Height = 20 });
                        Label lsize = new Label() { Text = AppResource.CPDownloadFileLabel, FontSize = 12, HeightRequest = 20, VerticalTextAlignment = TextAlignment.Center, HorizontalTextAlignment = TextAlignment.Center };
                        mgrid.Children.Add(lsize, 0, 2);
                        if (File.Exists(cm.LocalPath) && cm.FileDownloadStatus == FileDownloadStatus.Downloaded)
                        {
                            mphoto.Clicked += Mphoto_Clicked;
                            lsize.Text = AppResource.CPTapFileLabel;
                        }
                        else
                        {
                            mgrid.RowDefinitions.Add(new RowDefinition() { Height = 11 });
                            ProgressBar pb = new ProgressBar() { HeightRequest = 5, Progress = 0, Margin = new Thickness(3), IsVisible = false, HorizontalOptions = LayoutOptions.CenterAndExpand };
                            mgrid.Children.Add(pb, 0, 3);

                            ChatMessageDownloadModel cmdm = new ChatMessageDownloadModel()
                            {
                                Grid = mgrid,
                                Length = 0,
                                Position = -1,
                                LocalPath = string.Empty,
                                Message = cm
                            };
                            mphoto.CommandParameter = cmdm;
                            mphoto.Clicked += VideoDownloadBtn_Clicked;
                        }
                    }
                    mgrid.Children.Add(mphoto, 0, 1);
                    break;
                case ChatMessageType.Document:
                    break;
                default:
                    mgrid.Children.Add(GetLabelForMessage(cm), 0, 1);
                    break;
            }
            MsgStack.Children.Add(mgrid);

            return mgrid;
        }

        ImageButton GetVideoForMessage(ChatMessage cm)
        {
            ImageButton VideoThumbBtn = new ImageButton()
            {
                WidthRequest = 250,
                HeightRequest = 250,
                Aspect = Aspect.AspectFill,
                Source = cm.Thumbnail,
                CommandParameter = cm,
                VerticalOptions = LayoutOptions.Center,
                HorizontalOptions = LayoutOptions.Center
            };

            return VideoThumbBtn;
        }

        private void VideoDownloadBtn_Clicked(object sender, EventArgs e)
        {
            ImageButton btn = (sender as ImageButton);
            if (btn.CommandParameter is ChatMessageDownloadModel)
            {
                ChatMessageDownloadModel cmdm = btn.CommandParameter as ChatMessageDownloadModel;
                if (cmdm.Status == DownloadStatus.Completed)
                {
                    ShowVideo(cmdm.Message);
                }
                else
                {
                    if (cmdm.Status == DownloadStatus.Downloading)
                    {
                        cmdm.Status = DownloadStatus.Canceled;
                    }
                    else
                    {
                        cmdm.Status = DownloadStatus.Pending;
                    }

                    DownloadFile(cmdm);
                }
            }
        }

        private void ImageDownloadBtn_Clicked(object sender, EventArgs e)
        {
            ImageButton btn = (sender as ImageButton);
            if (btn.CommandParameter is ChatMessageDownloadModel)
            {
                ChatMessageDownloadModel cmdm = btn.CommandParameter as ChatMessageDownloadModel;
                if (cmdm.Status == DownloadStatus.Completed)
                {
                    ShowPhoto(cmdm.Message);
                }
                else
                {
                    if (cmdm.Status == DownloadStatus.Downloading)
                    {
                        cmdm.Status = DownloadStatus.Canceled;
                    }
                    else
                    {
                        cmdm.Status = DownloadStatus.Pending;
                    }

                    DownloadFile(cmdm);
                }
            }
        }

        ImageButton GetAudioForMessage(ChatMessage cm)
        {

            ImageButton musicBtn = new ImageButton()
            {
                WidthRequest = 100,
                HeightRequest = 100,
                Aspect = Aspect.AspectFit,
                Source = ImageSource.FromFile("music.png"),
                CommandParameter = cm
            };
            return musicBtn;
        }

        Label GetLabelForMessage(ChatMessage cm)
        {
            Label textlbl = new Label()
            {
                FontSize = 16,
                Text = cm.Text
            };

            if (cm.Sender == Myself.ID)
            {
                textlbl.HorizontalOptions = LayoutOptions.End;
                textlbl.HorizontalTextAlignment = TextAlignment.End;
                
            }
            else
            {
                textlbl.HorizontalOptions = LayoutOptions.Start;
                textlbl.HorizontalTextAlignment = TextAlignment.Start;
            }

            if ((cm.Text.ToLower().StartsWith("http://") || cm.Text.ToLower().StartsWith("https://")) && cm.Text.Trim().IndexOf(" ") == -1)
            {
                var span = new Span()
                {
                    Text = cm.Text.Trim(),
                    TextColor = Color.FromHex("0064DA"),
                    TextDecorations = TextDecorations.Underline
                };
                span.GestureRecognizers.Add(new TapGestureRecognizer() { Command = HyperLinkTapCommand, CommandParameter = cm.Text });
                textlbl.WidthRequest = 250;
                textlbl.FormattedText = new FormattedString();
                textlbl.FormattedText.Spans.Add(span);
            }

            return textlbl;
        }

        ImageButton GetImageForMessage(ChatMessage cm)
        {
            ImageButton img = new ImageButton()
            {
                WidthRequest = 250,
                HeightRequest = 250,
                Aspect = Aspect.AspectFill,
                Source = string.IsNullOrEmpty(cm.LocalPath.Trim()) ? ImageSource.FromUri(new Uri(cm.Text.Trim())) : ImageSource.FromFile(cm.LocalPath),
                CommandParameter = cm
            };

            return img;
        }

        private void Img_Clicked(object sender, EventArgs e)
        {
            ChatMessage cm = ((sender as ImageButton).CommandParameter as ChatMessage);
            ShowPhoto(cm);
        }

        async void ShowPhoto(ChatMessage cm)
        {
            PhotoPage pp = new PhotoPage()
            {
                ImgSource = string.IsNullOrEmpty(cm.LocalPath.Trim()) ? ImageSource.FromUri(new Uri(cm.Text.Trim())) : ImageSource.FromFile(cm.LocalPath)
            };
            await Navigation.PushModalAsync(pp);
        }

        private void Mphoto_Clicked(object sender, EventArgs e)
        {
            ChatMessage cm = ((sender as ImageButton).CommandParameter as ChatMessage);
            ShowVideo(cm);
        }

        private void VideoThumbBtn_Clicked(object sender, EventArgs e)
        {
            ChatMessage cm = (ChatMessage)(sender as ImageButton).CommandParameter;
            ShowVideo(cm);
        }

        private async void ShowVideo(ChatMessage cm)
        {
            VideoPage vp = new VideoPage();

            if (File.Exists(cm.LocalPath))
            {
                FileInfo fi = new FileInfo(cm.LocalPath);
                Console.WriteLine(fi.Length);
            }
            vp.VideoUri = !string.IsNullOrEmpty(cm.LocalPath) ? new Uri(cm.LocalPath.Trim()) : new Uri(cm.Text.Trim());
            await Navigation.PushModalAsync(vp);
        }

        void DeleteChatMessage(Guid id)
        {
            if (MessageList.ContainsKey(id))
            {
                if (File.Exists(MessageList[id].LocalPath))
                {
                    File.Delete(MessageList[id].LocalPath);
                }
                MessageList.Remove(id);
            }
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

        private async void OptionsBtn_Clicked(object sender, EventArgs e)
        {
            string action = await DisplayActionSheet("", AppResource.UniCancelText, null, AppResource.UniPhotosText, AppResource.UniVideosText, AppResource.UniDocText);
            Console.WriteLine("Action: " + action);
            if (action == AppResource.UniPhotosText)
            {

                await CrossMedia.Current.Initialize();
                if (!CrossMedia.Current.IsPickPhotoSupported)
                {
                    return;
                }
                var mediaOptions = new PickMediaOptions()
                {
                    PhotoSize = PhotoSize.Small,
                    CompressionQuality = 50
                };
                var selectedImage = await CrossMedia.Current.PickPhotoAsync(mediaOptions);
                if (selectedImage != null)
                {
                    string path = Path.Combine(ds.GetDataFolderPath(Myself, Other), string.Format("{0}{1}", Guid.NewGuid().ToString().ToLower(), Path.GetExtension(Path.Combine(selectedImage.AlbumPath, selectedImage.Path))));
                    File.Copy(selectedImage.Path, path, true);
                    if (File.Exists(path))
                    {
                        AddUploadPhotoMsgToStack(path);
                    }
                }

            }
            else if (action == AppResource.UniVideosText)
            {
                //string filename = await DependencyService.Get<IVideoPicker>().GetVideoFileAsync();

                await CrossMedia.Current.Initialize();
                if (!CrossMedia.Current.IsPickVideoSupported)
                {
                    return;
                }


                var selectedVideo = await CrossMedia.Current.PickVideoAsync();
                if (selectedVideo != null)
                {
                    int videolength = DependencyService.Get<IVideoPicker>().GetVideoLengthInMinutes(Path.Combine(selectedVideo.AlbumPath, selectedVideo.Path));
                    if (videolength > 10000)
                    {
                        await DisplayAlert(AppResource.ChatVideoLengthExceedTitle, AppResource.ChatVideoLengthExceedMsg, AppResource.UniCancelText);
                        return;
                    }
                    string path = Path.Combine(ds.GetDataFolderPath(Myself, Other), string.Format("{0}{1}", Guid.NewGuid().ToString().ToLower(), Path.GetExtension(Path.Combine(selectedVideo.AlbumPath, selectedVideo.Path))));

                    File.Copy(selectedVideo.Path, path, true);
                    //string finalpath = Path.Combine(ds.GetDataFolderPath(Myself, Other), string.Format("{0}{1}", Guid.NewGuid().ToString().ToLower(), Path.GetExtension(Path.Combine(selectedVideo.AlbumPath, selectedVideo.Path))));
                    //await DependencyService.Get<IVideoPicker>().CompressVideo(path, finalpath);

                    //if (File.Exists(finalpath))
                    //{
                    //    Console.WriteLine("Done");
                    //}
                    string thumbnailpath = path.Replace(Path.GetExtension(path), "-thumb.jpg");
                    DependencyService.Get<IVideoPicker>().GenerateThumbnail(path, thumbnailpath);
                    if (File.Exists(thumbnailpath))
                        AddUploadVideoMsgToStack(path, thumbnailpath);
                }
            }
        }

        private async void MsgOptBtn_Clicked(object sender, EventArgs e)
        {
            string action = await DisplayActionSheet("Message Options", "Cancel", null, "Delete");

            switch (action)
            {
                case "Delete":
                    ImageButton ib = (sender as ImageButton);
                    Guid mid = new Guid(ib.CommandParameter.ToString());
                    DeleteChatMessage(mid);
                    MsgStack.Children.Remove((View)ib.Parent);
                    break;
                default:
                    break;
            }
        }
    }

    public class ChatMessageDownloadModel
    {
        public ChatMessage Message { get; set; }
        public Grid Grid { get; set; }

        public string LocalPath { get; set; }
        public long Length { get; set; }
        public long Position { get; set; }
        public DownloadStatus Status { get; set; }

        public ChatMessageDownloadModel()
        {
            Status = DownloadStatus.Pending;
        }
    }

    public enum DownloadStatus
    {
        Pending,
        Downloading,
        Canceled,
        Completed
    }
}