
using FFImageLoading;
using FFImageLoading.Forms;
using Newtonsoft.Json;
using Plugin.Media.Abstractions;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Waarta.Models;
using Waarta.Resources;
using Waarta.Services;
using Xamarin.Forms;
using Xamarin.Forms.Internals;
using Xamarin.Forms.Xaml;


namespace Waarta.Views
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class MemberPhotoManage : ContentPage
    {
        readonly MemberService ms;
        public MemberDTO Member { get; set; }
		public MediaFile Path { get; set; }
        public MemberPhotoManage()
        {
            InitializeComponent();
            SavePhotoBtn.Text = AppResource.MpmSavePhotoBtn;
            ms = new MemberService();
        }

        private async void ContentPage_Appearing(object sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(Waarta.Helpers.Settings.Token))
            {
                await Navigation.PopModalAsync();
                return;
            }
            cropView.Source = ImageSource.FromStream(() => Path.GetStream());
        }

        private async void Button_Clicked(object sender, EventArgs e)
        {
            var result = await cropView.GetImageAsJpegAsync(50, 350, 350);
            using (var memoryStream = new MemoryStream())
            {
                result.CopyTo(memoryStream);
                string imgstr = Convert.ToBase64String(memoryStream.ToArray());
                if (!string.IsNullOrEmpty(Waarta.Helpers.Settings.Myself))
                {
                    Member.Pic = imgstr;
                    Waarta.Helpers.Settings.Myself = JsonConvert.SerializeObject(Member);
                    try
                    {
                        await ms.SavePic("data:image/jpeg;base64," + imgstr);
                    }
                    catch (ServerErrorException)
                    {
                        await DisplayAlert(AppResource.UniErrorMessageTitle, AppResource.UniUnreachableHostExceptionMessage, AppResource.UniCancelText);
                    }
                }
            }
            await Navigation.PopModalAsync();
        }
    }
}