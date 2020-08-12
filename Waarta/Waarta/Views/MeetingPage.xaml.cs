using Microsoft.AspNetCore.SignalR.Client;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Plugin.FilePicker;
using Plugin.FilePicker.Abstractions;
using Plugin.Media;
using Plugin.Media.Abstractions;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Windows.Input;
using Waarta.Models;
using Waarta.Resources;
using Waarta.Services;
using Xamarin.Essentials;
using Xamarin.Forms;
using Xamarin.Forms.Markup;
using Xamarin.Forms.Xaml;

namespace Waarta.Views
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class MeetingPage : ContentPage
    {
        readonly HubConnection hc;
        readonly WaartaDataStore ds;
        readonly MeetingsService mss;
        public string MeetingID { get; set; }
        public UserInfo Myself { get; set; }
        public Dictionary<string, UserInfo> participants;
        public MeetingDTO Meeting { get; set; }
        public Dictionary<Guid, MeetingChatMessage> MessageList { get; set; }
        public bool ShouldCreateMessageGrid;
        public ICommand HyperLinkTapCommand => new Command<string>(async (url) => await Launcher.OpenAsync(url));
        public MeetingPage()
        {
            InitializeComponent();

            ds = new WaartaDataStore();
            mss = new MeetingsService();
            participants = new Dictionary<string, UserInfo>();
            MessageList = new Dictionary<Guid, MeetingChatMessage>();
            LeaveBtn.Text = "❮ " + AppResource.LeaveBtn;
            hc = new HubConnectionBuilder().WithUrl("https://waarta.com/meetinghub", options =>
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
            hc.Reconnected += Hc_Reconnected;
            
        }

        private async Task Hc_Reconnected(string arg)
        {
            foreach (MeetingChatMessage cm in MessageList.Values)
            {
                if (cm.Status == ChatMessageSentStatus.Pending && hc.State == HubConnectionState.Connected)
                {
                    await hc.InvokeAsync("SendTextMessageWithID", Meeting.ID.ToLower(), Myself, cm.Text, cm.ID);
                    cm.Status = ChatMessageSentStatus.Sent;
                }
            }
        }

        private void SetHubconnectionOnFuncs()
        {
            hc.Remove("SetMySelf");
            hc.Remove("ReceiveTextMessage");

            hc.On<UserInfo>("SetMyself", async (u) =>
            {
                Myself.ConnectionID = u.ConnectionID;
                if (hc.State == HubConnectionState.Connected)
                {
                    await hc.InvokeAsync("NotifyPresence", Meeting.ID, Myself);
                }
            });

            //Handle New User Arrived server call
            //userinfo paramt will be sent by server as provided by other
            //user
            hc.On<UserInfo>("NewUserArrived", async (u) =>
            {
                if (!participants.ContainsKey(u.MemberID))
                {
                    participants.Add(u.MemberID, u);
                    AddNoticeLabelToStack(u.Name + " Joined");
                    if (hc.State == HubConnectionState.Connected)
                    {
                        await hc.InvokeAsync("HelloUser", Meeting.ID, Myself, u);
                    }
                }
            });

            //receive updated user object from target
            //this can be any thing user name, video capability, audio capability or
            //peer capability and status of target user
            hc.On<UserInfo>("UpdateUser", (u) =>
            {
                if (this.participants.ContainsKey(u.MemberID))
                {
                    UserInfo ui = participants[u.MemberID];
                    ui.Name = u.Name;
                    ui.Pic = u.Pic;
                    ui.PeerCapable = u.PeerCapable;
                    ui.VideoCapable = u.VideoCapable;
                }
            });

            //userleft is called by server when a user invokes leavemeeting function
            //use this function to perform cleanup of peer object and user object
            hc.On<string>("UserLeft", (cid) =>
            {
                if (participants.ContainsKey(cid))
                {
                    AddNoticeLabelToStack(participants[cid].Name + " Left");
                    participants.Remove(cid);
                }

            });

            //this function is called by server when client invoke HelloUser server function
            //this is called in response to newuserarrived function
            //so that new user can add existing users to its list
            hc.On<UserInfo, UserInfo>("UserSaidHello", (sender, receiver) =>
            {
                if (Myself.MemberID == receiver.MemberID && !participants.ContainsKey(sender.MemberID))
                {
                    participants.Add(sender.MemberID, sender);
                    AddNoticeLabelToStack(sender.Name + " is here.");
                }
            });

            //this function is called by server when it receives a sendtextmessage from user.
            hc.On<UserInfo, string, DateTime>("ReceiveTextMessage", (ui, text, timestamp) =>
            {
                ReceiveTextMessage(ui, text, timestamp);
            });

            //this function is strictly call by server to transfer WebRTC peer data
            hc.On<UserInfo, string>("ReceiveSignal", (sender, data) =>
            {
                //console.log("receivesignal sender : " + sender);
                //console.log("receivesignal data : " + data);
            });
        }

        void ReceiveTextMessage(UserInfo ui, string text, DateTime timestamp)
        {
            MeetingChatMessage cm = new MeetingChatMessage() { ID = Guid.NewGuid(), Sender = ui, Text = text, TimeStamp = timestamp, Status = ChatMessageSentStatus.Received };

            MessageList.Add(cm.ID, cm);
            AddMsgToStack(cm);
            
        }

        private async void OptionsBtn_Clicked(object sender, EventArgs e)
        {
            string action = await DisplayActionSheet("", AppResource.UniCancelText, null, AppResource.UniTakePhotoText, AppResource.UniCaptureVideoText, AppResource.UniPhotosText, AppResource.UniVideosText, AppResource.UniDocText);
            
            if (action == AppResource.UniTakePhotoText)
            {
                await CrossMedia.Current.Initialize();
                if (!CrossMedia.Current.IsTakePhotoSupported)
                {
                    return;
                }
                var mediaOptions = new StoreCameraMediaOptions()
                {
                    PhotoSize = PhotoSize.Small,
                    CompressionQuality = 80
                };
                var selectedImage = await CrossMedia.Current.TakePhotoAsync(mediaOptions);
                if (selectedImage != null)
                {
                    string path = Path.Combine(ds.GetDataFolderPath(Myself, Meeting), string.Format("{0}{1}", Guid.NewGuid().ToString().ToLower(), Path.GetExtension(selectedImage.Path)));
                    using (FileStream outputFileStream = new FileStream(path, FileMode.Create))
                    {
                        selectedImage.GetStream().CopyTo(outputFileStream);
                    }
                    if (File.Exists(path))
                    {
                        AddUploadPhotoMsgToStack(path);
                    }
                }
            }
            else if (action == AppResource.UniCaptureVideoText)
            {
                await CrossMedia.Current.Initialize();
                if (!CrossMedia.Current.IsTakeVideoSupported)
                {
                    return;
                }
                var mediaOptions = new StoreVideoOptions()
                {
                    AllowCropping = true,
                    CompressionQuality = 100,
                    DefaultCamera = CameraDevice.Rear,
                    DesiredLength = TimeSpan.FromMinutes(1),
                    Quality = VideoQuality.Low
                };
                var selectedVideo = await CrossMedia.Current.TakeVideoAsync(mediaOptions);
                if (selectedVideo != null)
                {
                    string path = Path.Combine(ds.GetDataFolderPath(Myself, Meeting), string.Format("{0}{1}", Guid.NewGuid().ToString().ToLower(), Path.GetExtension(selectedVideo.Path)));
                    using (FileStream outputFileStream = new FileStream(path, FileMode.Create))
                    {
                        selectedVideo.GetStream().CopyTo(outputFileStream);
                    }
                    string thumbnailpath = path.Replace(Path.GetExtension(path), "-thumb.jpg");
                    DependencyService.Get<IVideoPicker>().GenerateThumbnail(path, thumbnailpath);
                    if (File.Exists(thumbnailpath))
                        AddUploadVideoMsgToStack(path, thumbnailpath);
                }
            }
            else if (action == AppResource.UniDocText) {
                FileData fileData = await CrossFilePicker.Current.PickFile();
                if (fileData == null)
                    return; // user canceled file picking
                else
                {
                    string path = Path.Combine(ds.GetDataFolderPath(Myself, Meeting), fileData.FileName);
                    File.WriteAllBytes(path, fileData.DataArray);
                    if (File.Exists(path))
                    {
                        AddUploadPhotoMsgToStack(path);
                    }
                }
            }
            else if (action == AppResource.UniPhotosText)
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
                    string path = Path.Combine(ds.GetDataFolderPath(Myself, Meeting), string.Format("{0}{1}", Guid.NewGuid().ToString().ToLower(), Path.GetExtension(selectedImage.Path)));
                    File.Copy(selectedImage.Path, path, true);
                    if (File.Exists(path))
                    {
                        AddUploadPhotoMsgToStack(path);
                    }
                }

            }
            else if (action == AppResource.UniVideosText)
            {
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
                    string path = Path.Combine(ds.GetDataFolderPath(Myself, Meeting), string.Format("{0}{1}", Guid.NewGuid().ToString().ToLower(), Path.GetExtension(selectedVideo.Path)));

                    File.Copy(selectedVideo.Path, path, true);

                    string thumbnailpath = path.Replace(Path.GetExtension(path), "-thumb.jpg");
                    DependencyService.Get<IVideoPicker>().GenerateThumbnail(path, thumbnailpath);
                    if (File.Exists(thumbnailpath))
                        AddUploadVideoMsgToStack(path, thumbnailpath);
                }
            }
        }

        private void AddUploadPhotoMsgToStack(string path)
        {
            MeetingChatMessage cm = new MeetingChatMessage()
            {
                ID = Guid.NewGuid(),
                Sender = Myself,
                MessageType = ChatMessageType.Photo,
                Status = ChatMessageSentStatus.Pending,
                Text = string.Format("https://waarta.com/api/meetings/media/{0}?f={1}", Meeting.ID.ToLower(), Path.GetFileName(path)),
                LocalPath = path,
                TimeStamp = DateTime.Now
            };
            Grid mgrid = AddMsgToStack(cm);
            mgrid.RowDefinitions.Add(new RowDefinition() { Height = 20 });
            mgrid.RowDefinitions.Add(new RowDefinition() { Height = 5 });

            ProgressBar pb = new ProgressBar() { HeightRequest = 5, Progress = 0, Margin = new Thickness(3) };
            mgrid.Children.Add(pb, 0, 3);
            FileInfo fi = new FileInfo(path);
            Label lsize = new Label() { Text = fi.Exists ? Waarta.Helpers.Utility.GetBytesReadable(fi.Length) : "", FontSize = 10, HeightRequest = 20, Margin = new Thickness(3), VerticalOptions = LayoutOptions.Start, HorizontalOptions = LayoutOptions.End };
            mgrid.Children.Add(lsize, 0, 2);
            UploadFile(Path.GetFileName(path), path, mgrid, cm);

            MessageList.Add(cm.ID, cm);
        }

        private void AddUploadVideoMsgToStack(string path, string thumbpath)
        {
            MeetingChatMessage cm = new MeetingChatMessage()
            {
                ID = Guid.NewGuid(),
                MessageType = ChatMessageType.Video,
                Sender = Myself,
                Status = ChatMessageSentStatus.Pending,
                Text = string.Format("https://waarta.com/api/meetings/media/{0}?f={1}", Meeting.ID.ToLower(), Path.GetFileName(path)),
                LocalPath = path,
                TimeStamp = DateTime.Now
            };

            Grid mgrid = AddMsgToStack(cm);
            mgrid.RowDefinitions.Add(new RowDefinition() { Height = 20 });
            mgrid.RowDefinitions.Add(new RowDefinition() { Height = 11 });

            ProgressBar pb = new ProgressBar() { HeightRequest = 5, Progress = 0, Margin = new Thickness(3) };
            mgrid.Children.Add(pb, 0, 3);
            FileInfo fi = new FileInfo(path);
            Label lsize = new Label() { Text = Waarta.Helpers.Utility.GetBytesReadable(fi.Length), FontSize = 10, HeightRequest = 20, Margin = new Thickness(3), VerticalOptions = LayoutOptions.Center, HorizontalOptions = LayoutOptions.End, VerticalTextAlignment = TextAlignment.Center, HorizontalTextAlignment = TextAlignment.Center };
            mgrid.Children.Add(lsize, 0, 2);

            UploadFile(Path.GetFileName(path), path, mgrid, cm, thumbpath);

            MessageList.Add(cm.ID, cm);
        }

        private async void ContentPage_Appearing(object sender, EventArgs e)
        {
            Waarta.Helpers.Settings.Activity = ActivityStatus.Meeting;
            if (ShouldCreateMessageGrid)
            {
                if (MessageList.Count == 0)
                {
                    AddDateLabelToStack(DateTime.Now);

                    if (!string.IsNullOrEmpty(Meeting.Name))
                    {
                        AddNoticeLabelToStack(Meeting.Name);
                    }
                    if (!string.IsNullOrEmpty(Meeting.Purpose))
                    {
                        AddNoticeLabelToStack(Meeting.Purpose);
                    }
                }
                //DateTime temp = DateTime.UtcNow;
                //MessageList = ds.LoadMessagesFromFile(Myself, Meeting);
                //foreach (MeetingChatMessage cm in MessageList.Values)
                //{
                //    if (temp.ToString("yyyy MMM d") != cm.TimeStamp.ToString("yyyy MMM d"))
                //    {
                //        temp = cm.TimeStamp;
                //        AddDateLabelToStack(cm.TimeStamp);
                //    }
                //    if (cm.Status == ChatMessageSentStatus.Received)
                //    {
                //        cm.Status = ChatMessageSentStatus.Seen;
                //    }
                //    cm.Text = cm.Text;
                //    AddMsgToStack(cm);
                //}
                ShouldCreateMessageGrid = false;
            }

            SetHubconnectionOnFuncs();

            await Connect();
        }

        async Task Connect()
        {
            if (hc != null)
            {
                if (hc.State == HubConnectionState.Disconnected)
                {
                    await hc.StartAsync();
                    if (hc.State == HubConnectionState.Connected)
                    {
                        await hc.InvokeAsync("JoinMeeting", Meeting.ID, Myself.Name);
                    }
                }
            }
        }
        public async Task Disconnect()
        {
            if (hc.State == HubConnectionState.Connected)
            {
                await hc.StopAsync();
            }
            _ = hc.DisposeAsync();
        }

        private Label AddDateLabelToStack(DateTime dt)
        {
            Label dtlbl = new Label()
            {
                Text = dt.ToLocalTime().ToString("yyyy MMM d"),
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

        private Label AddNoticeLabelToStack(string text)
        {
            Label dtlbl = new Label()
            {
                Text = text,
                TextColor = Color.FromHex("495057"),
                BackgroundColor = Color.Transparent,
                Margin = new Thickness(7),
                HorizontalOptions = LayoutOptions.CenterAndExpand,
                HorizontalTextAlignment = TextAlignment.Center,
                FontAttributes = FontAttributes.Bold,
                FontSize = 15
            };
            MsgStack.Children.Add(dtlbl);
            return dtlbl;
        }
        /// <summary>
        /// Add a chat message to ui
        /// </summary>
        /// <param name="cm">Target Chat Message Object</param>
        /// <returns></returns>
        private Grid AddMsgToStack(MeetingChatMessage cm)
        {
            Frame f = new Frame() { VerticalOptions = LayoutOptions.Start, Padding = new Thickness(0), CornerRadius = 10, HasShadow=false };
            Grid mgrid = new Grid() { Padding = new Thickness(5) };
            //row holds message option button
            mgrid.RowDefinitions.Add(new RowDefinition() { Height = 25 });
            //row holds message label or image 
            mgrid.RowDefinitions.Add(new RowDefinition());
            mgrid.ColumnDefinitions.Add(new ColumnDefinition() { Width = GridLength.Auto });
            mgrid.BindingContext = cm;

            Label lblSender = new Label() { Text = cm.Sender.Name, FontSize = 13, HorizontalOptions = LayoutOptions.Start, VerticalOptions = LayoutOptions.Center };

            ////Button will show different operations can be performed on a message
            //ImageButton MsgOptBtn = new ImageButton()
            //{
            //    WidthRequest = 20,
            //    HeightRequest = 20,
            //    Aspect = Aspect.AspectFit,
            //    Opacity = 0.7,
            //    Source = ImageSource.FromFile("verticalellipsis.png"),
            //    CommandParameter = cm.ID,
            //    VerticalOptions = LayoutOptions.Center,
            //    HorizontalOptions = LayoutOptions.End,
            //    BackgroundColor = Color.White,
            //    CornerRadius = 15
            //};

            //MsgOptBtn.Clicked += MsgOptBtn_Clicked;
            mgrid.Children.Add(lblSender, 0, 0);
            if (cm.Sender.MemberID == Myself.MemberID)
            {
                f.HorizontalOptions = LayoutOptions.End;
                mgrid.BackgroundColor = Color.FromRgb(219, 244, 253);
            }
            else
            {
                f.HorizontalOptions = LayoutOptions.Start;
                mgrid.BackgroundColor = Color.FromRgb(242, 246, 249);
            }
            //add "what to do instructions" label
            Label wtdLbl = null;
            if (cm.MessageType == ChatMessageType.Photo || cm.MessageType == ChatMessageType.Video || cm.MessageType == ChatMessageType.Document || cm.MessageType == ChatMessageType.Audio)
            {
                mgrid.RowDefinitions.Add(new RowDefinition() { Height = 20 });
                //"what to do instructions" label
                //this is only added for images, videos, files or other downloadables
                wtdLbl = new Label() { Text = AppResource.CPDownloadFileLabel, FontSize = 12, HeightRequest = 20, VerticalTextAlignment = TextAlignment.Center, HorizontalTextAlignment = TextAlignment.Center };
                wtdLbl.Text = AppResource.CPTapFileLabel;
                mgrid.Children.Add(wtdLbl, 0, 2);
            }
            switch (cm.MessageType)
            {
                case ChatMessageType.Text:
                    mgrid.Children.Add(GetLabelForMessage(cm), 0, 1);
                    break;
                case ChatMessageType.Photo:
                    ImageButton ibphoto = GetImageForMessage(cm);
                    //if message is received than download it to local , if it was sent then used attach event to open it
                    //if (cm.Sender.MemberID == Myself.MemberID || (cm.Sender.MemberID != Myself.MemberID && File.Exists(cm.LocalPath) && cm.FileDownloadStatus == FileDownloadStatus.Downloaded))
                    //{
                    ibphoto.Clicked += Img_Clicked;
                    //}
                    //else
                    //{
                    //    mgrid.RowDefinitions.Add(new RowDefinition() { Height = 11 });
                    //    ProgressBar pb = new ProgressBar() { HeightRequest = 5, Progress = 0, Margin = new Thickness(3), IsVisible = false, HorizontalOptions = LayoutOptions.CenterAndExpand };
                    //    mgrid.Children.Add(pb, 0, 3);

                    //    ChatMessageDownloadModel cmdm = new ChatMessageDownloadModel()
                    //    {
                    //        Grid = mgrid,
                    //        Length = 0,
                    //        Position = -1,
                    //        LocalPath = string.Empty,
                    //        MeetingMessage = cm
                    //    };
                    //    ibphoto.CommandParameter = cmdm;
                    //    ibphoto.Clicked += ImageDownloadBtn_Clicked;

                    //}
                    mgrid.Children.Add(ibphoto, 0, 1);
                    break;
                case ChatMessageType.Video:
                    ImageButton ib = GetVideoForMessage(cm);
                    //if message is received than download it to local
                    //if (cm.Sender.MemberID == Myself.MemberID || (cm.Sender.MemberID != Myself.MemberID && File.Exists(cm.LocalPath) && cm.FileDownloadStatus == FileDownloadStatus.Downloaded))
                    //{
                    ib.Clicked += VideoThumbBtn_Clicked;
                    //}
                    //else
                    //{
                    //    //mgrid.RowDefinitions.Add(new RowDefinition() { Height = 20 });
                    //    //Label lsize = new Label() { Text = AppResource.CPDownloadFileLabel, FontSize = 12, HeightRequest = 20, VerticalTextAlignment = TextAlignment.Center, HorizontalTextAlignment = TextAlignment.Center };
                    //    //mgrid.Children.Add(lsize, 0, 2);
                    //    //if (File.Exists(cm.LocalPath) && cm.FileDownloadStatus == FileDownloadStatus.Downloaded)
                    //    //{
                    //    //    ib.Clicked += VideoThumbBtn_Clicked;
                    //    //    lsize.Text = AppResource.CPTapFileLabel;
                    //    //}
                    //    //else
                    //    //{
                    //        mgrid.RowDefinitions.Add(new RowDefinition() { Height = 11 });
                    //        ProgressBar pb = new ProgressBar() { HeightRequest = 5, Progress = 0, Margin = new Thickness(3), IsVisible = false, HorizontalOptions = LayoutOptions.CenterAndExpand };
                    //        mgrid.Children.Add(pb, 0, 3);

                    //        ChatMessageDownloadModel cmdm = new ChatMessageDownloadModel()
                    //        {
                    //            Grid = mgrid,
                    //            Length = 0,
                    //            Position = -1,
                    //            LocalPath = string.Empty,
                    //            MeetingMessage = cm
                    //        };
                    //        ib.CommandParameter = cmdm;
                    //        ib.Clicked += VideoDownloadBtn_Clicked;
                    //    //}
                    //}
                    mgrid.Children.Add(ib, 0, 1);
                    break;
                case ChatMessageType.Audio:
                    ImageButton mphoto = GetAudioForMessage(cm);
                    //if message is received than download it to local , if it was sent then used attach event to open it
                    //if (cm.Sender.MemberID == Myself.MemberID || (cm.Sender.MemberID != Myself.MemberID && File.Exists(cm.LocalPath) && cm.FileDownloadStatus == FileDownloadStatus.Downloaded))
                    //{
                    mphoto.Clicked += Mphoto_Clicked;
                    //}
                    //else
                    //{
                    //    //mgrid.RowDefinitions.Add(new RowDefinition() { Height = 20 });
                    //    //Label lsize = new Label() { Text = AppResource.CPDownloadFileLabel, FontSize = 12, HeightRequest = 20, VerticalTextAlignment = TextAlignment.Center, HorizontalTextAlignment = TextAlignment.Center };
                    //    //mgrid.Children.Add(lsize, 0, 2);
                    //    //if (File.Exists(cm.LocalPath) && cm.FileDownloadStatus == FileDownloadStatus.Downloaded)
                    //    //{
                    //    //    mphoto.Clicked += Mphoto_Clicked;
                    //    //    lsize.Text = AppResource.CPTapFileLabel;
                    //    //}
                    //    //else
                    //    //{
                    //        mgrid.RowDefinitions.Add(new RowDefinition() { Height = 11 });
                    //        ProgressBar pb = new ProgressBar() { HeightRequest = 5, Progress = 0, Margin = new Thickness(3), IsVisible = false, HorizontalOptions = LayoutOptions.CenterAndExpand };
                    //        mgrid.Children.Add(pb, 0, 3);

                    //        ChatMessageDownloadModel cmdm = new ChatMessageDownloadModel()
                    //        {
                    //            Grid = mgrid,
                    //            Length = 0,
                    //            Position = -1,
                    //            LocalPath = string.Empty,
                    //            MeetingMessage = cm
                    //        };
                    //        mphoto.CommandParameter = cmdm;
                    //        mphoto.Clicked += VideoDownloadBtn_Clicked;
                    //    //}
                    //}
                    mgrid.Children.Add(mphoto, 0, 1);
                    break;
                case ChatMessageType.Document:
                    mgrid.Children.Add(GetLabelForMessage(cm), 0, 1);
                    break;
                default:
                    mgrid.Children.Add(GetLabelForMessage(cm), 0, 1);
                    break;
            }
            f.Content = mgrid;
            MsgStack.Children.Add(f);

            return mgrid;
        }

        ImageButton GetVideoForMessage(MeetingChatMessage cm)
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

        //private void VideoDownloadBtn_Clicked(object sender, EventArgs e)
        //{
        //    ImageButton btn = (sender as ImageButton);
        //    if (btn.CommandParameter is ChatMessageDownloadModel)
        //    {
        //        ChatMessageDownloadModel cmdm = btn.CommandParameter as ChatMessageDownloadModel;
        //        if (cmdm.Status == DownloadStatus.Completed)
        //        {
        //            ShowVideo(cmdm.MeetingMessage);
        //        }
        //        else
        //        {
        //            if (cmdm.Status == DownloadStatus.Downloading)
        //            {
        //                cmdm.Status = DownloadStatus.Canceled;
        //            }
        //            else
        //            {
        //                cmdm.Status = DownloadStatus.Pending;
        //            }

        //            DownloadFile(cmdm);
        //        }
        //    }
        //}

        //private void ImageDownloadBtn_Clicked(object sender, EventArgs e)
        //{
        //    ImageButton btn = (sender as ImageButton);
        //    if (btn.CommandParameter is ChatMessageDownloadModel)
        //    {
        //        ChatMessageDownloadModel cmdm = btn.CommandParameter as ChatMessageDownloadModel;
        //        if (cmdm.Status == DownloadStatus.Completed)
        //        {
        //            ShowPhoto(cmdm.MeetingMessage);
        //        }
        //        else
        //        {
        //            if (cmdm.Status == DownloadStatus.Downloading)
        //            {
        //                cmdm.Status = DownloadStatus.Canceled;
        //            }
        //            else
        //            {
        //                cmdm.Status = DownloadStatus.Pending;
        //            }

        //            DownloadFile(cmdm);
        //        }
        //    }
        //}

        ImageButton GetAudioForMessage(MeetingChatMessage cm)
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

        Label GetLabelForMessage(MeetingChatMessage cm)
        {
            Label textlbl = new Label()
            {
                FontSize = 16,
                Text = cm.Text
            };

            if (cm.Sender.MemberID == Myself.MemberID)
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
                string txt = cm.Text.Trim();
                Uri uri = new Uri(cm.Text.Trim());
                var namevals = HttpUtility.ParseQueryString(uri.Query);
                if (namevals.HasKeys())
                {
                    txt = namevals.Get("f");
                }
               
                var span = new Span()
                {
                    Text = txt,
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

        ImageButton GetImageForMessage(MeetingChatMessage cm)
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
            MeetingChatMessage cm = ((sender as ImageButton).CommandParameter as MeetingChatMessage);
            ShowPhoto(cm);
        }

        async void ShowPhoto(MeetingChatMessage cm)
        {
            PhotoPage pp = new PhotoPage()
            {
                ImgSource = string.IsNullOrEmpty(cm.LocalPath.Trim()) ? ImageSource.FromUri(new Uri(cm.Text.Trim())) : ImageSource.FromFile(cm.LocalPath)
            };
            await Navigation.PushModalAsync(pp);
        }

        private void Mphoto_Clicked(object sender, EventArgs e)
        {
            MeetingChatMessage cm = ((sender as ImageButton).CommandParameter as MeetingChatMessage);
            ShowVideo(cm);
        }

        private void VideoThumbBtn_Clicked(object sender, EventArgs e)
        {
            MeetingChatMessage cm = (MeetingChatMessage)(sender as ImageButton).CommandParameter;
            ShowVideo(cm);
        }

        private async void ShowVideo(MeetingChatMessage cm)
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
            //if meeting has a name save messages to a file
            if (!string.IsNullOrEmpty(Meeting.Name) && !string.IsNullOrEmpty(Waarta.Helpers.Settings.Myself))
            {
                Dictionary<Guid, MeetingChatMessage> temp = ds.LoadMessagesFromFile(Myself, Meeting);
                foreach(var pair in MessageList)
                {
                    if (!temp.ContainsKey(pair.Key))
                    {
                        temp.Add(pair.Key, pair.Value);
                    }
                }
                ds.SaveMessagestoFile(Myself, Meeting, temp);
            }
            //try
            //{
            //    _ = Disconnect();
            //}
            //catch { }
        }

        //async void DownloadFile(ChatMessageDownloadModel cmdm)
        //{
        //    Grid grid = cmdm.Grid;
        //    ChatMessage cm = cmdm.Message;
        //    ProgressBar bar = null;
        //    Label lb = null;
        //    foreach (View v in grid.Children)
        //    {
        //        if (v is ProgressBar)
        //            bar = v as ProgressBar;
        //        if (v is Label)
        //            lb = v as Label;
        //    }

        //    string filepathshort = cm.Text.ToLower().TrimStart("https://waarta.com/data/".ToCharArray());
        //    string targetfpath = Path.Combine(ds.GetDataFolderPath(Myself, Meeting), Path.GetFileName(filepathshort));
        //    if (File.Exists(targetfpath))
        //    {
        //        File.Delete(targetfpath);
        //    }
        //    cmdm.Position = 0;
        //    if (lb != null)
        //    {
        //        lb.Text = AppResource.CPCancelDownloadFileLabel;
        //    }
        //    while (cmdm.Position > -1 && (cmdm.Status == DownloadStatus.Downloading || cmdm.Status == DownloadStatus.Pending))
        //    {
        //        try
        //        {
        //            cmdm.Status = DownloadStatus.Downloading;
        //            cm.FileDownloadStatus = FileDownloadStatus.Downloading;
        //            DownloadedChunk dc = await ms.DownloadChunk(filepathshort, cmdm.Position);

        //            cmdm.Position = dc.Position;
        //            cmdm.Length = dc.Length;
        //            if (File.Exists(targetfpath))
        //            {
        //                using (FileStream stream = File.Open(targetfpath, FileMode.Append, FileAccess.Write))
        //                {
        //                    byte[] arr = Convert.FromBase64String(dc.Data);
        //                    stream.Write(arr, 0, arr.Length);
        //                }
        //            }
        //            else
        //            {
        //                using (FileStream stream = File.Open(targetfpath, FileMode.OpenOrCreate, FileAccess.Write))
        //                {
        //                    byte[] arr = Convert.FromBase64String(dc.Data);
        //                    stream.Write(arr, 0, arr.Length);
        //                }
        //            }
        //            if (bar != null)
        //            {
        //                bar.IsVisible = true;
        //                _ = bar.ProgressTo((double)cmdm.Position / dc.Length, 500, Easing.Linear);
        //            }
        //            if (dc.Position >= dc.Length)
        //            {
        //                cmdm.Status = DownloadStatus.Completed;
        //                cm.LocalPath = targetfpath;
        //                cm.FileDownloadStatus = FileDownloadStatus.Downloaded;
        //                if (lb != null)
        //                {
        //                    lb.Text = AppResource.CPTapFileLabel;
        //                }
        //                //DependencyService.Get<IVideoPicker>().GenerateThumbnail(cm.LocalPath, cm.LocalPath.ToLower().Replace(Path.GetExtension(cm.LocalPath), "-thumb.jpg"));
        //                await ms.DownloadChunk(cm.LocalPath.ToLower().Replace(Path.GetExtension(cm.LocalPath), "-thumb.jpg"), 0);
        //                if (bar != null)
        //                {
        //                    bar.IsVisible = false;
        //                }
        //                break;
        //            }
        //        }
        //        catch
        //        {
        //            cmdm.Status = DownloadStatus.Canceled;
        //            break;
        //        }
        //    }
        //    if (cmdm.Status == DownloadStatus.Canceled)
        //    {
        //        File.Delete(targetfpath);
        //        cmdm.Position = 0;
        //        if (bar != null)
        //        {
        //            bar.IsVisible = false;
        //            bar.Progress = 0;
        //        }
        //        if (lb != null)
        //        {
        //            lb.Text = AppResource.CPDownloadFileLabel;
        //        }
        //    }
        //}

        private async void UploadFile(string filename, string filePath, Grid grid, MeetingChatMessage cm, string thumbpath = "")
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
                    await mss.UploadChunk(Convert.ToBase64String(arrData), filename, false, Meeting.ID);

                    await bar.ProgressTo((double)objStream.Position / objStream.Length, 500, Easing.Linear);
                }
                grid.Children.Remove(bar);
                grid.RowDefinitions.RemoveAt(3);
                //upload thumbnail image
                if (File.Exists(thumbpath))
                {
                    await mss.UploadChunk(Convert.ToBase64String(File.ReadAllBytes(thumbpath)), Path.GetFileName(thumbpath), false, Meeting.ID);
                }
                if (hc.State == HubConnectionState.Connected)
                {
                    try
                    {
                        _ = hc.InvokeAsync("SendTextMessageWithID", Meeting.ID, Myself, cm.Text, cm.ID);
                        cm.Status = ChatMessageSentStatus.Sent;
                    }
                    catch (Exception ex)
                    {
                        Debug.WriteLine("Error while sending photo message");
                        Debug.WriteLine(ex.Message);
                    }
                }
                else
                {
                    cm.Status = ChatMessageSentStatus.Pending;
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
                    MsgStack.Children.Remove((View)ib.Parent.Parent);
                    break;
                default:
                    break;
            }
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

        bool SendTextMessage(string text)
        {
            MeetingChatMessage cm = new MeetingChatMessage() { ID = Guid.NewGuid(), Sender = Myself, MessageType = ChatMessageType.Text, Status = ChatMessageSentStatus.Pending, Text = text, TimeStamp = DateTime.Now };
            MessageList.Add(cm.ID, cm);
            AddMsgToStack(cm);
            //ds.SaveMessagestoFile(Myself, Meeting, MessageList);
            if (hc.State == HubConnectionState.Connected)
            {
                try
                {
                    _ = hc.InvokeAsync("SendTextMessageWithID", Meeting.ID.ToLower(), Myself, cm.Text, cm.ID);
                    cm.Status = ChatMessageSentStatus.Sent;
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
                cm.Status = ChatMessageSentStatus.Pending;
                return false;
            }
        }

        public void LeaveMeeting()
        {
            if ( hc != null && hc.State == HubConnectionState.Connected)
            {
                hc.InvokeAsync("LeaveMeeting", Meeting.ID, Myself.MemberID);
            }
            if (String.IsNullOrEmpty(Meeting.Name))
            {
                string path = ds.GetDataFolderPath(Myself, Meeting);
                if (Directory.Exists(path))
                {
                    Directory.Delete(path, true);
                }
            }
        }

        private async void LeaveBtn_Clicked(object sender, EventArgs e)
        {
            LeaveMeeting();
            try
            {
                _ = hc.StopAsync();
                _ = hc.DisposeAsync();
            }
            catch { }
            
            await Navigation.PopModalAsync();
        }

        private async void InviteBtn_Clicked(object sender, EventArgs e)
        {
            await Share.RequestAsync(new ShareTextRequest()
            {
                Title = AppResource.MeetInviteOptionTitle,
                Text = string.Format(AppResource.MeetInviteText, Meeting.ID),
                Subject = AppResource.MeetInviteSubject
            }); ;
        }
    }
}