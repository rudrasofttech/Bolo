using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Waarta.Models;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Waarta.Views
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class ProfilePage : ContentPage
    {
        MemberDTO mdto;
        public ProfilePage()
        {
            InitializeComponent();
            
            ProfilePic.WidthRequest = Application.Current.MainPage.Width;
            ProfilePic.HeightRequest = Application.Current.MainPage.Width;
            
        }

        private void BindUI()
        {
            mdto = (MemberDTO)BindingContext;
            ThoughtStatusLbl.IsVisible = mdto.ThoughtStatus.Length > 0;
            BioLbl.IsVisible = mdto.Bio.Length > 0;
            LocationLbl.IsVisible = mdto.Location.Length > 0;
        }

        private void ContentPage_Appearing(object sender, EventArgs e)
        {
            BindUI();
        }
    }
}