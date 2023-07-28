using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using System.Net.Mail;
using System.Threading.Tasks;
using System;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace BoloWeb.Helper
{
    public class EmailHelper
    {
        private readonly IConfiguration _config;
        protected readonly IWebHostEnvironment _hostingEnvironment;

        public EmailHelper(IConfiguration config, IWebHostEnvironment hostingEnvironment)
        {
            _config = config;
            _hostingEnvironment = hostingEnvironment;
        }


        public async Task<Tuple<bool, string>> SendEmailAsync(string toname, string toemail, string subject, string htmlmessage, string plainmessage, string fromname = "Yocail App",
            string fromemail = "yocail@rudrasofttech.com")
        {

            string template = System.IO.File.ReadAllText(_hostingEnvironment.ContentRootPath + "\\emailtemplate.html");
            template = template.Replace("[name]", toname);
            template = template.Replace("[message]", htmlmessage);
            template = template.Replace("[unsubscribelink]", $"https://www.yocail.com/account/unsubscribe/{toemail}");
            var client = new SendGridClient(_config["SG"]);
            var from = new EmailAddress(fromemail, fromname);
            var to = new EmailAddress(toemail, toname);
            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainmessage, template);
            var response = await client.SendEmailAsync(msg);
            var b = await response.Body.ReadAsStringAsync();
            return new Tuple<bool, string>(response.IsSuccessStatusCode, b);
        }


        public async Task<Tuple<bool, string>> SendVerificationEmailAsync(string toname, string toemail, string link)
        {
            string html = $"You have successfully registered. Please click on the link below to verify your email.<br/><br/><a href='{link}' target='_blank'>Verify your email</a>";
            string text = $"Dear {toname}\n\nYou have successfully registered. Please follow the link below to verify your email.\n\n{link}";
            return await SendEmailAsync(toname, toemail, "Welcome to Yocail", html, text);
        }
    }
}
