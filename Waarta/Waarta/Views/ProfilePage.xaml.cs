using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows.Input;
using Waarta.Helpers;
using Waarta.Models;
using Waarta.Resources;
using Xamarin.Essentials;
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
            Title = AppResource.PPTitle;
            //ProfilePic.WidthRequest = Application.Current.MainPage.Width;
            //ProfilePic.HeightRequest = Application.Current.MainPage.Width;

        }

        private void BindUI()
        {
            mdto = (MemberDTO)BindingContext;
            ThoughtStatusLbl.IsVisible = mdto.ThoughtStatus.Length > 0;
            BioLbl.IsVisible = mdto.Bio.Length > 0;
            LocationLbl.IsVisible = mdto.Location.Length > 0;
            BioLbl.FormattedText = Convert(mdto.Bio);
        }

        public FormattedString Convert(string text)
        {
            var formatted = new FormattedString();

            foreach (var item in ProcessString(text))
                formatted.Spans.Add(CreateSpan(item));

            return formatted;
        }

        private Span CreateSpan(StringSection section)
        {
            var span = new Span()
            {
                Text = section.Text
            };

            if (!string.IsNullOrEmpty(section.Link))
            {
                span.GestureRecognizers.Add(new TapGestureRecognizer()
                {
                    Command = _navigationCommand,
                    CommandParameter = section.Link
                });
                span.TextColor = Utility.LinkColor;
            }

            return span;
        }

        public IList<StringSection> ProcessString(string rawText)
        {
            const string spanPattern = @"http(s)?://([\w-]+\.)+[\w-]+(/[\w- ./?%~&=]*)?";
            rawText = rawText ?? "";
            MatchCollection collection = Regex.Matches(rawText, spanPattern, RegexOptions.IgnoreCase);
            var sections = new List<StringSection>();
            var lastIndex = 0;
            foreach (Match item in collection)
            {
                var foundText = item.Value;
                //Add any string before the coincidence 
                sections.Add(new StringSection() { Text = rawText.Substring(lastIndex, item.Index - lastIndex) }); 
                lastIndex += item.Index + item.Length;
                // Get HTML href 
                var html = new StringSection() { Link = foundText, Text = item.Value }; sections.Add(html);
            }
            //Add additional text if there any left 
            if (rawText.Length > lastIndex) { sections.Add(new StringSection() { Text = rawText.Substring(lastIndex) }); }
            return sections;
        }
        
        private ICommand _navigationCommand => new Command<string>(async (url) =>
        {
            WebViewPage wvp = new WebViewPage()
            {
                Url = url
            };
            await Navigation.PushAsync(wvp);
        });
        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        { throw new NotImplementedException(); }



        private void ContentPage_Appearing(object sender, EventArgs e)
        {
            BindUI();
        }
    }

    public class StringSection { public string Text { get; set; } public string Link { get; set; } }

}