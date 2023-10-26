using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Diagnostics;
using System.Web;
using System.IO;
using System.Net;
using System.Text;
using Microsoft.Extensions.Configuration;
using Bolo.Models;
using Microsoft.Extensions.Options;
using System.Text.RegularExpressions;

namespace Bolo.Helper
{
    public class NameUserIdProvider : IUserIdProvider
    {
        public virtual string GetUserId(HubConnectionContext connection)
        {
            return connection.User?.Identity?.Name;
        }
    }
    public class Utility
    {
        public const string UniversalGroup = "Universal";

        public const int MultipartBodyLengthLimit = 20971520;

        public static DateTime OTPExpiry
        {
            get
            {
                return DateTime.UtcNow.AddDays(1);
            }
        }

        public static DateTime TokenExpiry
        {
            get
            {
                return DateTime.UtcNow.AddDays(365);
            }
        }

        public static bool RegexMatch(string target, string rgx)
        {
            // Step 1: create new Regex.
            Regex regex = new Regex(rgx);

            // Step 2: call Match on Regex instance.
            Match match = regex.Match(target);

            // Step 3: test for Success.
            return match.Success;
        }

        public static string SendSMS(string phone, string message, string country)
        {
            string url = "http://login.bulksmsgateway.in/sendmessage.php";
            string result = "";
            message = System.Web.HttpUtility.UrlPathEncode(message);
            String strPost = "?user=" + System.Web.HttpUtility.UrlPathEncode("rajkiran.singh") + "&password=" + System.Web.HttpUtility.UrlPathEncode("Welcome1!") + "&sender=" + System.Web.HttpUtility.UrlPathEncode("WAARTA") + "&mobile=" + System.Web.HttpUtility.UrlPathEncode(phone) + "&type=" + HttpUtility.UrlPathEncode("3") + "&message=" + message;
            StreamWriter myWriter = null;
            HttpWebRequest objRequest = (HttpWebRequest)WebRequest.Create(url + strPost);
            objRequest.Method = "POST";
            objRequest.ContentLength = Encoding.UTF8.GetByteCount(strPost);
            objRequest.ContentType = "application/x-www-form-urlencoded";
            try
            {
                myWriter = new StreamWriter(objRequest.GetRequestStream());
                myWriter.Write(strPost);
            }
            catch (Exception e)
            {
                throw e;
            }
            finally
            {
                myWriter.Close();
            }
            HttpWebResponse objResponse = (HttpWebResponse)objRequest.GetResponse();
            using (StreamReader sr = new StreamReader(objResponse.GetResponseStream()))
            {
                result = sr.ReadToEnd();
                // Close and clean up the StreamReader sr.Close();
            }
            return result;
        }
    }


    public class LocationHelper
    {
        private readonly List<CountryItem> countries = new List<CountryItem>() { new CountryItem() { Code = "AD", Name = "Andorra" },
new CountryItem() { Code = "AE", Name = "United Arab Emirates" },
new CountryItem() { Code = "AF", Name = "Afghanistan" },
new CountryItem() { Code = "AG", Name = "Antigua and Barbuda" },
new CountryItem() { Code = "AI", Name = "Anguilla" },
new CountryItem() { Code = "AL", Name = "Albania" },
new CountryItem() { Code = "AM", Name = "Armenia" },
new CountryItem() { Code = "AO", Name = "Angola" },
new CountryItem() { Code = "AQ", Name = "Antarctica" },
new CountryItem() { Code = "AR", Name = "Argentina" },
new CountryItem() { Code = "AS", Name = "American Samoa" },
new CountryItem() { Code = "AT", Name = "Austria" },
new CountryItem() { Code = "AU", Name = "Australia" },
new CountryItem() { Code = "AW", Name = "Aruba" },
new CountryItem() { Code = "AX", Name = "Åland Islands" },
new CountryItem() { Code = "AZ", Name = "Azerbaijan" },
new CountryItem() { Code = "BA", Name = "Bosnia and Herzegovina" },
new CountryItem() { Code = "BB", Name = "Barbados" },
new CountryItem() { Code = "BD", Name = "Bangladesh" },
new CountryItem() { Code = "BE", Name = "Belgium" },
new CountryItem() { Code = "BF", Name = "Burkina Faso" },
new CountryItem() { Code = "BG", Name = "Bulgaria" },
new CountryItem() { Code = "BH", Name = "Bahrain" },
new CountryItem() { Code = "BI", Name = "Burundi" },
new CountryItem() { Code = "BJ", Name = "Benin" },
new CountryItem() { Code = "BL", Name = "Saint Barthélemy" },
new CountryItem() { Code = "BM", Name = "Bermuda" },
new CountryItem() { Code = "BN", Name = "Brunei Darussalam" },
new CountryItem() { Code = "BO", Name = "Bolivia, Plurinational State of" },
new CountryItem() { Code = "BQ", Name = "Bonaire, Sint Eustatius and Saba" },
new CountryItem() { Code = "BR", Name = "Brazil" },
new CountryItem() { Code = "BS", Name = "Bahamas" },
new CountryItem() { Code = "BT", Name = "Bhutan" },
new CountryItem() { Code = "BV", Name = "Bouvet Island" },
new CountryItem() { Code = "BW", Name = "Botswana" },
new CountryItem() { Code = "BY", Name = "Belarus" },
new CountryItem() { Code = "BZ", Name = "Belize" },
new CountryItem() { Code = "CA", Name = "Canada" },
new CountryItem() { Code = "CC", Name = "Cocos (Keeling) Islands" },
new CountryItem() { Code = "CD", Name = "Congo, the Democratic Republic of the" },
new CountryItem() { Code = "CF", Name = "Central African Republic" },
new CountryItem() { Code = "CG", Name = "Congo" },
new CountryItem() { Code = "CH", Name = "Switzerland" },
new CountryItem() { Code = "CI", Name = "Côte d'Ivoire" },
new CountryItem() { Code = "CK", Name = "Cook Islands" },
new CountryItem() { Code = "CL", Name = "Chile" },
new CountryItem() { Code = "CM", Name = "Cameroon" },
new CountryItem() { Code = "CN", Name = "China" },
new CountryItem() { Code = "CO", Name = "Colombia" },
new CountryItem() { Code = "CR", Name = "Costa Rica" },
new CountryItem() { Code = "CU", Name = "Cuba" },
new CountryItem() { Code = "CV", Name = "Cape Verde" },
new CountryItem() { Code = "CW", Name = "Curaçao" },
new CountryItem() { Code = "CX", Name = "Christmas Island" },
new CountryItem() { Code = "CY", Name = "Cyprus" },
new CountryItem() { Code = "CZ", Name = "Czech Republic" },
new CountryItem() { Code = "DE", Name = "Germany" },
new CountryItem() { Code = "DJ", Name = "Djibouti" },
new CountryItem() { Code = "DK", Name = "Denmark" },
new CountryItem() { Code = "DM", Name = "Dominica" },
new CountryItem() { Code = "DO", Name = "Dominican Republic" },
new CountryItem() { Code = "DZ", Name = "Algeria" },
new CountryItem() { Code = "EC", Name = "Ecuador" },
new CountryItem() { Code = "EE", Name = "Estonia" },
new CountryItem() { Code = "EG", Name = "Egypt" },
new CountryItem() { Code = "EH", Name = "Western Sahara" },
new CountryItem() { Code = "ER", Name = "Eritrea" },
new CountryItem() { Code = "ES", Name = "Spain" },
new CountryItem() { Code = "ET", Name = "Ethiopia" },
new CountryItem() { Code = "FI", Name = "Finland" },
new CountryItem() { Code = "FJ", Name = "Fiji" },
new CountryItem() { Code = "FK", Name = "Falkland Islands (Malvinas)" },
new CountryItem() { Code = "FM", Name = "Micronesia, Federated States of" },
new CountryItem() { Code = "FO", Name = "Faroe Islands" },
new CountryItem() { Code = "FR", Name = "France" },
new CountryItem() { Code = "GA", Name = "Gabon" },
new CountryItem() { Code = "GB", Name = "United Kingdom" },
new CountryItem() { Code = "GD", Name = "Grenada" },
new CountryItem() { Code = "GE", Name = "Georgia" },
new CountryItem() { Code = "GF", Name = "French Guiana" },
new CountryItem() { Code = "GG", Name = "Guernsey" },
new CountryItem() { Code = "GH", Name = "Ghana" },
new CountryItem() { Code = "GI", Name = "Gibraltar" },
new CountryItem() { Code = "GL", Name = "Greenland" },
new CountryItem() { Code = "GM", Name = "Gambia" },
new CountryItem() { Code = "GN", Name = "Guinea" },
new CountryItem() { Code = "GP", Name = "Guadeloupe" },
new CountryItem() { Code = "GQ", Name = "Equatorial Guinea" },
new CountryItem() { Code = "GR", Name = "Greece" },
new CountryItem() { Code = "GS", Name = "South Georgia and the South Sandwich Islands" },
new CountryItem() { Code = "GT", Name = "Guatemala" },
new CountryItem() { Code = "GU", Name = "Guam" },
new CountryItem() { Code = "GW", Name = "Guinea-Bissau" },
new CountryItem() { Code = "GY", Name = "Guyana" },
new CountryItem() { Code = "HK", Name = "Hong Kong" },
new CountryItem() { Code = "HM", Name = "Heard Island and McDonald Islands" },
new CountryItem() { Code = "HN", Name = "Honduras" },
new CountryItem() { Code = "HR", Name = "Croatia" },
new CountryItem() { Code = "HT", Name = "Haiti" },
new CountryItem() { Code = "HU", Name = "Hungary" },
new CountryItem() { Code = "ID", Name = "Indonesia" },
new CountryItem() { Code = "IE", Name = "Ireland" },
new CountryItem() { Code = "IL", Name = "Israel" },
new CountryItem() { Code = "IM", Name = "Isle of Man" },
new CountryItem() { Code = "IN", Name = "India" },
new CountryItem() { Code = "IO", Name = "British Indian Ocean Territory" },
new CountryItem() { Code = "IQ", Name = "Iraq" },
new CountryItem() { Code = "IR", Name = "Iran, Islamic Republic of" },
new CountryItem() { Code = "IS", Name = "Iceland" },
new CountryItem() { Code = "IT", Name = "Italy" },
new CountryItem() { Code = "JE", Name = "Jersey" },
new CountryItem() { Code = "JM", Name = "Jamaica" },
new CountryItem() { Code = "JO", Name = "Jordan" },
new CountryItem() { Code = "JP", Name = "Japan" },
new CountryItem() { Code = "KE", Name = "Kenya" },
new CountryItem() { Code = "KG", Name = "Kyrgyzstan" },
new CountryItem() { Code = "KH", Name = "Cambodia" },
new CountryItem() { Code = "KI", Name = "Kiribati" },
new CountryItem() { Code = "KM", Name = "Comoros" },
new CountryItem() { Code = "KN", Name = "Saint Kitts and Nevis" },
new CountryItem() { Code = "KP", Name = "Korea, Democratic People's Republic of" },
new CountryItem() { Code = "KR", Name = "Korea, Republic of" },
new CountryItem() { Code = "KW", Name = "Kuwait" },
new CountryItem() { Code = "KY", Name = "Cayman Islands" },
new CountryItem() { Code = "KZ", Name = "Kazakhstan" },
new CountryItem() { Code = "LA", Name = "Lao People's Democratic Republic" },
new CountryItem() { Code = "LB", Name = "Lebanon" },
new CountryItem() { Code = "LC", Name = "Saint Lucia" },
new CountryItem() { Code = "LI", Name = "Liechtenstein" },
new CountryItem() { Code = "LK", Name = "Sri Lanka" },
new CountryItem() { Code = "LR", Name = "Liberia" },
new CountryItem() { Code = "LS", Name = "Lesotho" },
new CountryItem() { Code = "LT", Name = "Lithuania" },
new CountryItem() { Code = "LU", Name = "Luxembourg" },
new CountryItem() { Code = "LV", Name = "Latvia" },
new CountryItem() { Code = "LY", Name = "Libya" },
new CountryItem() { Code = "MA", Name = "Morocco" },
new CountryItem() { Code = "MC", Name = "Monaco" },
new CountryItem() { Code = "MD", Name = "Moldova, Republic of" },
new CountryItem() { Code = "ME", Name = "Montenegro" },
new CountryItem() { Code = "MF", Name = "Saint Martin (French part)" },
new CountryItem() { Code = "MG", Name = "Madagascar" },
new CountryItem() { Code = "MH", Name = "Marshall Islands" },
new CountryItem() { Code = "MK", Name = "Macedonia, the Former Yugoslav Republic of" },
new CountryItem() { Code = "ML", Name = "Mali" },
new CountryItem() { Code = "MM", Name = "Myanmar" },
new CountryItem() { Code = "MN", Name = "Mongolia" },
new CountryItem() { Code = "MO", Name = "Macao" },
new CountryItem() { Code = "MP", Name = "Northern Mariana Islands" },
new CountryItem() { Code = "MQ", Name = "Martinique" },
new CountryItem() { Code = "MR", Name = "Mauritania" },
new CountryItem() { Code = "MS", Name = "Montserrat" },
new CountryItem() { Code = "MT", Name = "Malta" },
new CountryItem() { Code = "MU", Name = "Mauritius" },
new CountryItem() { Code = "MV", Name = "Maldives" },
new CountryItem() { Code = "MW", Name = "Malawi" },
new CountryItem() { Code = "MX", Name = "Mexico" },
new CountryItem() { Code = "MY", Name = "Malaysia" },
new CountryItem() { Code = "MZ", Name = "Mozambique" },
new CountryItem() { Code = "NA", Name = "Namibia" },
new CountryItem() { Code = "NC", Name = "New Caledonia" },
new CountryItem() { Code = "NE", Name = "Niger" },
new CountryItem() { Code = "NF", Name = "Norfolk Island" },
new CountryItem() { Code = "NG", Name = "Nigeria" },
new CountryItem() { Code = "NI", Name = "Nicaragua" },
new CountryItem() { Code = "NL", Name = "Netherlands" },
new CountryItem() { Code = "NO", Name = "Norway" },
new CountryItem() { Code = "NP", Name = "Nepal" },
new CountryItem() { Code = "NR", Name = "Nauru" },
new CountryItem() { Code = "NU", Name = "Niue" },
new CountryItem() { Code = "NZ", Name = "New Zealand" },
new CountryItem() { Code = "OM", Name = "Oman" },
new CountryItem() { Code = "PA", Name = "Panama" },
new CountryItem() { Code = "PE", Name = "Peru" },
new CountryItem() { Code = "PF", Name = "French Polynesia" },
new CountryItem() { Code = "PG", Name = "Papua New Guinea" },
new CountryItem() { Code = "PH", Name = "Philippines" },
new CountryItem() { Code = "PK", Name = "Pakistan" },
new CountryItem() { Code = "PL", Name = "Poland" },
new CountryItem() { Code = "PM", Name = "Saint Pierre and Miquelon" },
new CountryItem() { Code = "PN", Name = "Pitcairn" },
new CountryItem() { Code = "PR", Name = "Puerto Rico" },
new CountryItem() { Code = "PS", Name = "Palestine, State of" },
new CountryItem() { Code = "PT", Name = "Portugal" },
new CountryItem() { Code = "PW", Name = "Palau" },
new CountryItem() { Code = "PY", Name = "Paraguay" },
new CountryItem() { Code = "QA", Name = "Qatar" },
new CountryItem() { Code = "RE", Name = "Réunion" },
new CountryItem() { Code = "RO", Name = "Romania" },
new CountryItem() { Code = "RS", Name = "Serbia" },
new CountryItem() { Code = "RU", Name = "Russian Federation" },
new CountryItem() { Code = "RW", Name = "Rwanda" },
new CountryItem() { Code = "SA", Name = "Saudi Arabia" },
new CountryItem() { Code = "SB", Name = "Solomon Islands" },
new CountryItem() { Code = "SC", Name = "Seychelles" },
new CountryItem() { Code = "SD", Name = "Sudan" },
new CountryItem() { Code = "SE", Name = "Sweden" },
new CountryItem() { Code = "SG", Name = "Singapore" },
new CountryItem() { Code = "SH", Name = "Saint Helena, Ascension and Tristan da Cunha" },
new CountryItem() { Code = "SI", Name = "Slovenia" },
new CountryItem() { Code = "SJ", Name = "Svalbard and Jan Mayen" },
new CountryItem() { Code = "SK", Name = "Slovakia" },
new CountryItem() { Code = "SL", Name = "Sierra Leone" },
new CountryItem() { Code = "SM", Name = "San Marino" },
new CountryItem() { Code = "SN", Name = "Senegal" },
new CountryItem() { Code = "SO", Name = "Somalia" },
new CountryItem() { Code = "SR", Name = "Suriname" },
new CountryItem() { Code = "SS", Name = "South Sudan" },
new CountryItem() { Code = "ST", Name = "Sao Tome and Principe" },
new CountryItem() { Code = "SV", Name = "El Salvador" },
new CountryItem() { Code = "SX", Name = "Sint Maarten (Dutch part)" },
new CountryItem() { Code = "SY", Name = "Syrian Arab Republic" },
new CountryItem() { Code = "SZ", Name = "Swaziland" },
new CountryItem() { Code = "TC", Name = "Turks and Caicos Islands" },
new CountryItem() { Code = "TD", Name = "Chad" },
new CountryItem() { Code = "TF", Name = "French Southern Territories" },
new CountryItem() { Code = "TG", Name = "Togo" },
new CountryItem() { Code = "TH", Name = "Thailand" },
new CountryItem() { Code = "TJ", Name = "Tajikistan" },
new CountryItem() { Code = "TK", Name = "Tokelau" },
new CountryItem() { Code = "TL", Name = "Timor-Leste" },
new CountryItem() { Code = "TM", Name = "Turkmenistan" },
new CountryItem() { Code = "TN", Name = "Tunisia" },
new CountryItem() { Code = "TO", Name = "Tonga" },
new CountryItem() { Code = "TR", Name = "Turkey" },
new CountryItem() { Code = "TT", Name = "Trinidad and Tobago" },
new CountryItem() { Code = "TV", Name = "Tuvalu" },
new CountryItem() { Code = "TW", Name = "Taiwan, Province of China" },
new CountryItem() { Code = "TZ", Name = "Tanzania, United Republic of" },
new CountryItem() { Code = "UA", Name = "Ukraine" },
new CountryItem() { Code = "UG", Name = "Uganda" },
new CountryItem() { Code = "UM", Name = "United States Minor Outlying Islands" },
new CountryItem() { Code = "US", Name = "United States" },
new CountryItem() { Code = "UY", Name = "Uruguay" },
new CountryItem() { Code = "UZ", Name = "Uzbekistan" },
new CountryItem() { Code = "VA", Name = "Holy See (Vatican City State)" },
new CountryItem() { Code = "VC", Name = "Saint Vincent and the Grenadines" },
new CountryItem() { Code = "VE", Name = "Venezuela, Bolivarian Republic of" },
new CountryItem() { Code = "VG", Name = "Virgin Islands, British" },
new CountryItem() { Code = "VI", Name = "Virgin Islands, U.S." },
new CountryItem() { Code = "VN", Name = "Viet Nam" },
new CountryItem() { Code = "VU", Name = "Vanuatu" },
new CountryItem() { Code = "WF", Name = "Wallis and Futuna" },
new CountryItem() { Code = "WS", Name = "Samoa" },
new CountryItem() { Code = "YE", Name = "Yemen" },
new CountryItem() { Code = "YT", Name = "Mayotte" },
new CountryItem() { Code = "ZA", Name = "South Africa" },
new CountryItem() { Code = "ZM", Name = "Zambia" },
new CountryItem() { Code = "ZW", Name = "Zimbabwe" } };

        public List<CountryItem> Countries { get { return countries; } }

        public string GetCountryName(string code)
        {
            if(code == null)
                code = string.Empty;

            if (countries.Any(t => t.Code.ToLower() == code.ToLower()))
                return countries.First(t => t.Code.ToLower() == code.ToLower()).Name;
            else
                return code;
        }
    }
}
