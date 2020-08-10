using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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
    public partial class ManageProfilePage : ContentPage
    {

        readonly List<int> years;
        readonly List<String> genders;
        List<String> CountryList { get; set; }
        List<String> StatesList { get; set; }
        MemberService ms;
        public MemberDTO Member { get; set; }

        readonly Color loading;
        public ManageProfilePage()
        {
            InitializeComponent();
            genders = new List<String>
            {
                Gender.Female.ToString(),
                Gender.Male.ToString(),
                Gender.Other.ToString()
            };
            years = new List<int>();
            for (int start = DateTime.Now.Year - 15; start > (DateTime.Now.Year - 90); start--)
            {
                years.Add(start);
            }
            loading = Color.FromHex("c69500");
            CountryList = new List<string>();
            StatesList = new List<string>();
        }

        private async void NameTxt_Completed(object sender, EventArgs e)
        {
            if (!string.IsNullOrEmpty(NameTxt.Text.Trim()))
            {
                Member.Name = NameTxt.Text.Trim();
                NameTxt.BackgroundColor = loading;
                await ms.SaveName(Member.Name);
                NameTxt.BackgroundColor = Color.Transparent;
            }
        }

        private void ContentPage_Appearing(object sender, EventArgs e)
        {
            if (!string.IsNullOrEmpty(Waarta.Helpers.Settings.Myself))
            {
                Member = (MemberDTO)JsonConvert.DeserializeObject(Waarta.Helpers.Settings.Myself, typeof(MemberDTO));
            }
            ms = new MemberService();
            BindUI();
        }

        private void BindUI()
        {

            PopulateCountryList();
            Title = AppResource.MppTitle;
            NameTxt.Text = Member.Name;
            BioEditor.Text = Member.Bio;
            ThougthStatusTxt.Text = Member.ThoughtStatus;
            CityTxt.Text = Member.City;
            YearPicker.ItemsSource = null;
            YearPicker.ItemsSource = years;
            YearPicker.SelectedItem = Member.BirthYear;
            VisibilitySwitch.IsToggled = Member.Visibility != MemberProfileVisibility.Private;
            GenderPicker.ItemsSource = null;
            GenderPicker.ItemsSource = genders;
            GenderPicker.SelectedItem = Member.Gender.ToString();

            CountryPicker.ItemsSource = null;
            CountryPicker.ItemsSource = CountryList;
            CountryPicker.SelectedItem = Member.Country;

            if (Member.Country.ToLower() == "india")
            {
                PopulateStateList();
                StatePicker.ItemsSource = null;
                StatePicker.ItemsSource = StatesList;
                StatePicker.SelectedItem = Member.State;
                StatePicker.IsVisible = true;
                StateTxt.IsVisible = false;
            }
            else if (Member.Country.ToLower() == "usa")
            {
                PopulateUSStateList();
                StatePicker.ItemsSource = null;
                StatePicker.ItemsSource = StatesList;
                StatePicker.SelectedItem = Member.State;
                StatePicker.IsVisible = true;
                StateTxt.IsVisible = false;
            }
            else
            {
                StateTxt.Text = Member.State;
                StatePicker.IsVisible = false;
                StateTxt.IsVisible = true;
            }
        }

        #region CountryList
        private void PopulateCountryList()
        {
            CountryList.Clear();


            CountryList.Add("Afganistan");

            CountryList.Add("Albania");

            CountryList.Add("Algeria");

            CountryList.Add("American Samoa");

            CountryList.Add("Andorra");

            CountryList.Add("Angola");

            CountryList.Add("Anguilla");

            CountryList.Add("Antigua & Barbuda");

            CountryList.Add("Argentina");

            CountryList.Add("Armenia");

            CountryList.Add("Aruba");

            CountryList.Add("Australia");

            CountryList.Add("Austria");

            CountryList.Add("Azerbaijan");

            CountryList.Add("Bahamas");

            CountryList.Add("Bahrain");

            CountryList.Add("Bangladesh");

            CountryList.Add("Barbados");

            CountryList.Add("Belarus");

            CountryList.Add("Belgium");

            CountryList.Add("Belize");

            CountryList.Add("Benin");

            CountryList.Add("Bermuda");

            CountryList.Add("Bhutan");

            CountryList.Add("Bolivia");

            CountryList.Add("Bonaire");

            CountryList.Add("Bosnia & Herzegovina");

            CountryList.Add("Botswana");

            CountryList.Add("Brazil");

            CountryList.Add("British Indian Ocean Ter");

            CountryList.Add("Brunei");

            CountryList.Add("Bulgaria");

            CountryList.Add("Burkina Faso");

            CountryList.Add("Burundi");

            CountryList.Add("Cambodia");

            CountryList.Add("Cameroon");

            CountryList.Add("Canada");

            CountryList.Add("Canary Islands");

            CountryList.Add("Cape Verde");

            CountryList.Add("Cayman Islands");

            CountryList.Add("Central African Republic");

            CountryList.Add("Chad");

            CountryList.Add("Channel Islands");

            CountryList.Add("Chile");

            CountryList.Add("China");

            CountryList.Add("Christmas Island");

            CountryList.Add("Cocos Island");

            CountryList.Add("Colombia");

            CountryList.Add("Comoros");

            CountryList.Add("Congo");

            CountryList.Add("Cook Islands");

            CountryList.Add("Costa Rica");

            CountryList.Add("Cote DIvoire");

            CountryList.Add("Croatia");

            CountryList.Add("Cuba");

            CountryList.Add("Curaco");

            CountryList.Add("Cyprus");

            CountryList.Add("Czech Republic");

            CountryList.Add("Denmark");

            CountryList.Add("Djibouti");

            CountryList.Add("Dominica");

            CountryList.Add("Dominican Republic");

            CountryList.Add("East Timor");

            CountryList.Add("Ecuador");
            CountryList.Add("Egypt");

            CountryList.Add("El Salvador");

            CountryList.Add("Equatorial Guinea");

            CountryList.Add("Eritrea");

            CountryList.Add("Estonia");

            CountryList.Add("Ethiopia");

            CountryList.Add("Falkland Islands");

            CountryList.Add("Faroe Islands");

            CountryList.Add("Fiji");

            CountryList.Add("Finland");

            CountryList.Add("France");

            CountryList.Add("French Guiana");

            CountryList.Add("French Polynesia");

            CountryList.Add("French Southern Ter");

            CountryList.Add("Gabon");

            CountryList.Add("Gambia");

            CountryList.Add("Georgia");

            CountryList.Add("Germany");

            CountryList.Add("Ghana");

            CountryList.Add("Gibraltar");

            CountryList.Add("Great Britain");

            CountryList.Add("Greece");

            CountryList.Add("Greenland");

            CountryList.Add("Grenada");

            CountryList.Add("Guadeloupe");

            CountryList.Add("Guam");

            CountryList.Add("Guatemala");

            CountryList.Add("Guinea");

            CountryList.Add("Guyana");

            CountryList.Add("Haiti");

            CountryList.Add("Hawaii");

            CountryList.Add("Honduras");

            CountryList.Add("Hong Kong");

            CountryList.Add("Hungary");

            CountryList.Add("Iceland");

            CountryList.Add("Indonesia");

            CountryList.Add("India");

            CountryList.Add("Iran");

            CountryList.Add("Iraq");

            CountryList.Add("Ireland");

            CountryList.Add("Isle of Man");

            CountryList.Add("Israel");

            CountryList.Add("Italy");

            CountryList.Add("Jamaica");

            CountryList.Add("Japan");

            CountryList.Add("Jordan");

            CountryList.Add("Kazakhstan");

            CountryList.Add("Kenya");

            CountryList.Add("Kiribati");

            CountryList.Add("Korea North");

            CountryList.Add("Korea South");

            CountryList.Add("Kuwait");

            CountryList.Add("Kyrgyzstan");

            CountryList.Add("Laos");

            CountryList.Add("Latvia");

            CountryList.Add("Lebanon");

            CountryList.Add("Lesotho");

            CountryList.Add("Liberia");

            CountryList.Add("Libya");

            CountryList.Add("Liechtenstein");

            CountryList.Add("Lithuania");

            CountryList.Add("Luxembourg");

            CountryList.Add("Macau");

            CountryList.Add("Macedonia");

            CountryList.Add("Madagascar");

            CountryList.Add("Malaysia");

            CountryList.Add("Malawi");

            CountryList.Add("Maldives");

            CountryList.Add("Mali");

            CountryList.Add("Malta");

            CountryList.Add("Marshall Islands");

            CountryList.Add("Martinique");

            CountryList.Add("Mauritania");

            CountryList.Add("Mauritius");

            CountryList.Add("Mayotte");

            CountryList.Add("Mexico");

            CountryList.Add("Midway Islands");

            CountryList.Add("Moldova");

            CountryList.Add("Monaco");

            CountryList.Add("Mongolia");

            CountryList.Add("Montserrat");

            CountryList.Add("Morocco");

            CountryList.Add("Mozambique");

            CountryList.Add("Myanmar");

            CountryList.Add("Nambia");

            CountryList.Add("Nauru");

            CountryList.Add("Nepal");

            CountryList.Add("Netherland Antilles");

            CountryList.Add("Netherlands");

            CountryList.Add("Nevis");

            CountryList.Add("New Caledonia");

            CountryList.Add("New Zealand");

            CountryList.Add("Nicaragua");

            CountryList.Add("Niger");

            CountryList.Add("Nigeria");

            CountryList.Add("Niue");

            CountryList.Add("Norfolk Island");

            CountryList.Add("Norway");

            CountryList.Add("Oman");

            CountryList.Add("Pakistan");

            CountryList.Add("Palau Island");

            CountryList.Add("Palestine");

            CountryList.Add("Panama");

            CountryList.Add("Papua New Guinea");

            CountryList.Add("Paraguay");

            CountryList.Add("Peru");

            CountryList.Add("Phillipines");

            CountryList.Add("Pitcairn Island");

            CountryList.Add("Poland");

            CountryList.Add("Portugal");

            CountryList.Add("Puerto Rico");

            CountryList.Add("Qatar");

            CountryList.Add("Republic of Montenegro");

            CountryList.Add("Republic of Serbia");

            CountryList.Add("Reunion");

            CountryList.Add("Romania");

            CountryList.Add("Russia");

            CountryList.Add("Rwanda");

            CountryList.Add("St Barthelemy");

            CountryList.Add("St Eustatius");

            CountryList.Add("St Helena");

            CountryList.Add("St Kitts-Nevis");

            CountryList.Add("St Lucia");

            CountryList.Add("St Maarten");

            CountryList.Add("St Pierre & Miquelon");

            CountryList.Add("St Vincent & Grenadines");

            CountryList.Add("Saipan");

            CountryList.Add("Samoa");

            CountryList.Add("Samoa American");

            CountryList.Add("San Marino");

            CountryList.Add("Sao Tome & Principe");

            CountryList.Add("Saudi Arabia");

            CountryList.Add("Senegal");

            CountryList.Add("Seychelles");
            CountryList.Add("Sierra Leone");

            CountryList.Add("Singapore");

            CountryList.Add("Slovakia");

            CountryList.Add("Slovenia");

            CountryList.Add("Solomon Islands");

            CountryList.Add("Somalia");

            CountryList.Add("South Africa");

            CountryList.Add("Spain");

            CountryList.Add("Sri Lanka");

            CountryList.Add("Sudan");

            CountryList.Add("Suriname");

            CountryList.Add("Swaziland");

            CountryList.Add("Sweden");

            CountryList.Add("Switzerland");

            CountryList.Add("Syria");

            CountryList.Add("Tahiti");

            CountryList.Add("Taiwan");

            CountryList.Add("Tajikistan");

            CountryList.Add("Tanzania");

            CountryList.Add("Thailand");

            CountryList.Add("Togo");

            CountryList.Add("Tokelau");

            CountryList.Add("Tonga");

            CountryList.Add("Trinidad & Tobago");

            CountryList.Add("Tunisia");

            CountryList.Add("Turkey");

            CountryList.Add("Turkmenistan");

            CountryList.Add("Turks & Caicos Is");

            CountryList.Add("Tuvalu");

            CountryList.Add("Uganda");

            CountryList.Add("United Kingdom");

            CountryList.Add("Ukraine");

            CountryList.Add("UAE");

            CountryList.Add("USA");

            CountryList.Add("Uraguay");

            CountryList.Add("Uzbekistan");

            CountryList.Add("Vanuatu");

            CountryList.Add("Vatican City State");

            CountryList.Add("Venezuela");

            CountryList.Add("Vietnam");

            CountryList.Add("Virgin Islands (Brit)");

            CountryList.Add("Virgin Islands (USA)");

            CountryList.Add("Wake Island");

            CountryList.Add("Wallis & Futana Is");

            CountryList.Add("Yemen");

            CountryList.Add("Zaire");

            CountryList.Add("Zambia");

            CountryList.Add("Zimbabwe");


        }
        #endregion

        #region IndiaStateList
        private void PopulateStateList()
        {
            StatesList.Clear();
            StatesList.Add("Andhra Pradesh");

            StatesList.Add("Andaman and Nicobar Islands");

            StatesList.Add("Arunachal Pradesh");

            StatesList.Add("Assam");

            StatesList.Add("Bihar");

            StatesList.Add("Chandigarh");

            StatesList.Add("Chhattisgarh");

            StatesList.Add("Dadar and Nagar Haveli");

            StatesList.Add("Daman and Diu");

            StatesList.Add("Delhi");

            StatesList.Add("Lakshadweep");

            StatesList.Add("Puducherry");

            StatesList.Add("Goa");

            StatesList.Add("Gujarat");

            StatesList.Add("Haryana");

            StatesList.Add("Himachal Pradesh");

            StatesList.Add("Jammu and Kashmir");

            StatesList.Add("Jharkhand");

            StatesList.Add("Karnataka");

            StatesList.Add("Kerala");

            StatesList.Add("Madhya Pradesh");

            StatesList.Add("Maharashtra");

            StatesList.Add("Manipur");

            StatesList.Add("Meghalaya");

            StatesList.Add("Mizoram");

            StatesList.Add("Nagaland");

            StatesList.Add("Odisha");

            StatesList.Add("Punjab");

            StatesList.Add("Rajasthan");

            StatesList.Add("Sikkim");

            StatesList.Add("Tamil Nadu");

            StatesList.Add("Telangana");

            StatesList.Add("Tripura");

            StatesList.Add("Uttar Pradesh");

            StatesList.Add("Uttarakhand");

            StatesList.Add("West Bengal");
        }
        #endregion

        #region USStateList
        private void PopulateUSStateList()
        {
            StatesList.Clear();
            StatesList.Add("Alabama");
            StatesList.Add("Alaska");
            StatesList.Add("Arizona");
            StatesList.Add("Arkansas");
            StatesList.Add("California");
            StatesList.Add("Colorado");
            StatesList.Add("Connecticut");
            StatesList.Add("Delaware");
            StatesList.Add("District of Columbia");
            StatesList.Add("Florida");
            StatesList.Add("Georgia");
            StatesList.Add("Guam");
            StatesList.Add("Hawaii");
            StatesList.Add("Idaho");
            StatesList.Add("Illinois");
            StatesList.Add("Indiana");
            StatesList.Add("Iowa");
            StatesList.Add("Kansas");
            StatesList.Add("Kentucky");
            StatesList.Add("Louisiana");
            StatesList.Add("Maine");
            StatesList.Add("Maryland");
            StatesList.Add("Massachusetts");
            StatesList.Add("Michigan");
            StatesList.Add("Minnesota");
            StatesList.Add("Mississippi");
            StatesList.Add("Missouri");
            StatesList.Add("Montana");
            StatesList.Add("Nebraska");
            StatesList.Add("Nevada");
            StatesList.Add("New Hampshire");
            StatesList.Add("New Jersey");
            StatesList.Add("New Mexico");
            StatesList.Add("New York");
            StatesList.Add("North Carolina");
            StatesList.Add("North Dakota");
            StatesList.Add("Northern Marianas Islands");
            StatesList.Add("Ohio");
            StatesList.Add("Oklahoma");
            StatesList.Add("Oregon");
            StatesList.Add("Pennsylvania");
            StatesList.Add("Puerto Rico");
            StatesList.Add("Rhode Island");
            StatesList.Add("South Carolina");
            StatesList.Add("South Dakota");
            StatesList.Add("Tennessee");
            StatesList.Add("Texas");
            StatesList.Add("Utah");
            StatesList.Add("Vermont");
            StatesList.Add("Virginia");
            StatesList.Add("Virgin Islands");
            StatesList.Add("Washington");
            StatesList.Add("West Virginia");
            StatesList.Add("Wisconsin");
            StatesList.Add("Wyoming");
        }
        #endregion

        private async void BioEditor_Completed(object sender, EventArgs e)
        {
            if (Member.Bio == BioEditor.Text.Trim())
                return;
            Member.Bio = BioEditor.Text.Trim();
            BioEditor.BackgroundColor = loading;
            try
            {
                await ms.SaveBio(Member.Bio);
            }
            catch (ServerErrorException)
            {
                await DisplayAlert(AppResource.UniErrorMessageTitle, AppResource.UniUnreachableHostExceptionMessage, AppResource.UniCancelText);
            }
            BioEditor.BackgroundColor = Color.Transparent;
        }

        private async void ThougthStatusTxt_Completed(object sender, EventArgs e)
        {
            if (Member.ThoughtStatus == ThougthStatusTxt.Text.Trim())
                return;
            ThougthStatusTxt.BackgroundColor = loading;
            try
            {
                await ms.SaveOneLineIntro(ThougthStatusTxt.Text.Trim());
                Member.ThoughtStatus = ThougthStatusTxt.Text.Trim();
            }
            catch (ServerErrorException)
            {
                await DisplayAlert(AppResource.UniErrorMessageTitle, AppResource.UniUnreachableHostExceptionMessage, AppResource.UniCancelText);
            }
            ThougthStatusTxt.BackgroundColor = Color.Transparent;
        }


        private void VisibilitySwitch_Toggled(object sender, ToggledEventArgs e)
        {
            Member.Visibility = VisibilitySwitch.IsToggled ? MemberProfileVisibility.Public : MemberProfileVisibility.Private;
        }


        private void ContentPage_Disappearing(object sender, EventArgs e)
        {
            Waarta.Helpers.Settings.Myself = JsonConvert.SerializeObject(Member);
            ms.Dispose();
        }

        private async void YearPicker_Unfocused(object sender, FocusEventArgs e)
        {
            if (Member.BirthYear == (int)YearPicker.SelectedItem)
                return;
            YearPicker.BackgroundColor = loading;
            try
            {
                await ms.SaveBirthYear((int)YearPicker.SelectedItem);
                Member.BirthYear = (int)YearPicker.SelectedItem;
            }
            catch (ServerErrorException)
            {
                await DisplayAlert(AppResource.UniErrorMessageTitle, AppResource.UniUnreachableHostExceptionMessage, AppResource.UniCancelText);
            }
            YearPicker.BackgroundColor = Color.Transparent;
        }

        private async void GenderPicker_Unfocused(object sender, FocusEventArgs e)
        {
            if (Member.Gender == (Gender)Enum.Parse(typeof(Gender), GenderPicker.SelectedItem.ToString()))
                return;
            
            GenderPicker.BackgroundColor = loading;
            try
            {
                Gender g = (Gender)Enum.Parse(typeof(Gender), GenderPicker.SelectedItem.ToString());
                await ms.SaveGender(g);
                Member.Gender = g;
            }
            catch (ServerErrorException)
            {
                await DisplayAlert(AppResource.UniErrorMessageTitle, AppResource.UniUnreachableHostExceptionMessage, AppResource.UniCancelText);
            }
            GenderPicker.BackgroundColor = Color.Transparent;
        }

        private async void CountryPicker_Unfocused(object sender, FocusEventArgs e)
        {
            if (Member.Country == CountryPicker.SelectedItem.ToString())
                return;
            
            CountryPicker.BackgroundColor = loading;
            try
            {
                await ms.SaveCountry(CountryPicker.SelectedItem.ToString());
                Member.Country = CountryPicker.SelectedItem.ToString();
            }
            catch (ServerErrorException)
            {
                await DisplayAlert(AppResource.UniErrorMessageTitle, AppResource.UniUnreachableHostExceptionMessage, AppResource.UniCancelText);
            }
            CountryPicker.BackgroundColor = Color.Transparent;
            if (Member.Country.ToLower() == "india")
            {
                PopulateStateList();
                StatePicker.ItemsSource = null;
                StatePicker.ItemsSource = StatesList;
                StatePicker.SelectedItem = Member.State;
                StatePicker.IsVisible = true;
                StateTxt.IsVisible = false;
            }
            else if (Member.Country.ToLower() == "usa")
            {
                PopulateUSStateList();
                StatePicker.ItemsSource = null;
                StatePicker.ItemsSource = StatesList;
                StatePicker.SelectedItem = Member.State;
                StatePicker.IsVisible = true;
                StateTxt.IsVisible = false;
            }
            else
            {
                StateTxt.Text = Member.State;
                StatePicker.IsVisible = false;
                StateTxt.IsVisible = true;
            }
        }

        private async void StatePicker_Unfocused(object sender, FocusEventArgs e)
        {
            if (Member.State == StatePicker.SelectedItem.ToString())
                return;
            
            StatePicker.BackgroundColor = loading;
            try
            {
                await ms.SaveState(StatePicker.SelectedItem.ToString());
                Member.State = StatePicker.SelectedItem.ToString();
            }
            catch (ServerErrorException)
            {
                await DisplayAlert(AppResource.UniErrorMessageTitle, AppResource.UniUnreachableHostExceptionMessage, AppResource.UniCancelText);
            }
            StatePicker.BackgroundColor = Color.Transparent;
        }

        private async void StateTxt_Completed(object sender, EventArgs e)
        {
            if (Member.State == StateTxt.Text.Trim())
                return;
            
            StateTxt.BackgroundColor = loading;
            try
            {
                await ms.SaveState(StateTxt.Text.Trim());
                Member.State = StateTxt.Text.Trim();
            }
            catch (ServerErrorException)
            {
                await DisplayAlert(AppResource.UniErrorMessageTitle, AppResource.UniUnreachableHostExceptionMessage, AppResource.UniCancelText);
            }
            StateTxt.BackgroundColor = Color.Transparent;
        }

        private async void CityTxt_Completed(object sender, EventArgs e)
        {
            if (Member.City == CityTxt.Text.Trim())
                return;
            
            CityTxt.BackgroundColor = loading;
            try
            {
                await ms.SaveState(CityTxt.Text.Trim());
                Member.City = CityTxt.Text.Trim();
            }
            catch (ServerErrorException)
            {
                await DisplayAlert(AppResource.UniErrorMessageTitle, AppResource.UniUnreachableHostExceptionMessage, AppResource.UniCancelText);
            }
            CityTxt.BackgroundColor = Color.Transparent;
        }

        private async void VisibilitySwitch_Unfocused(object sender, FocusEventArgs e)
        {
            try
            {
                await ms.SaveVisibility(Member.Visibility);
            }
            catch (ServerErrorException)
            {
                await DisplayAlert(AppResource.UniErrorMessageTitle, AppResource.UniUnreachableHostExceptionMessage, AppResource.UniCancelText);
            }
        }
    }

}