﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Waarta.Views
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class VideoPage : ContentPage
    {
        public Uri VideoUri
        {
            get;set;
        }
        public VideoPage()
        {
            InitializeComponent();
            
        }

        private void ContentPage_Appearing(object sender, EventArgs e)
        {
            
            Media.Source = VideoUri;
        }
    }
}