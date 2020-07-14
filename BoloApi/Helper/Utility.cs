using System;
using System.Collections.Generic;
using System.Linq;
using MailKit.Net.Smtp;
using MimeKit;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Diagnostics;
using System.Web;
using System.IO;
using System.Net;
using System.Text;

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

        public static string GenerateOTP()
        {
            Random r = new Random();
            return string.Format("{0}{1}{2}{3}{4}{5}", r.Next(0, 9), r.Next(0, 9), r.Next(0, 9), r.Next(0, 9), r.Next(0, 9), r.Next(0, 9));
        }

        public static void SendEmail(string toemail, string toname, string fromemail, string fromname, string Subject, string Body)
        {
            try
            {
                MimeMessage message = new MimeMessage();

                MailboxAddress from = new MailboxAddress(fromname, fromemail);
                message.From.Add(from);

                MailboxAddress to = new MailboxAddress(toname, toemail);
                message.To.Add(to);
                message.ReplyTo.Add(from);
                message.Subject = Subject;
                BodyBuilder bodyBuilder = new BodyBuilder();
                bodyBuilder.HtmlBody = Body;
                bodyBuilder.TextBody = Body;
                //bodyBuilder.Attachments.Add(env.WebRootPath + "\\file.png");
                message.Body = bodyBuilder.ToMessageBody();
                using (SmtpClient client = new SmtpClient())
                {
                    client.Connect("smtp.gmail.com", 465, true);
                    client.Authenticate("waarta@rudrasofttech.com", "hjgTY23#@sd");
                    client.Send(message);
                    client.Disconnect(true);
                    client.Dispose();
                }
            }
            catch(Exception ex) {
                throw ex;
            }
        }

        public static string SendSMS(string phone, string message)
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
