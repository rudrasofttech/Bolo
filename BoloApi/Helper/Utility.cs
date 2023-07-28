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
}
