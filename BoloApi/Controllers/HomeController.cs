﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Bolo.Data;
using Bolo.Helper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Bolo.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Routing;
using Microsoft.Data.SqlClient;

namespace Bolo.Controllers
{
    public class HomeController : Controller
    {
        private readonly BoloContext _context;
        private readonly IConfiguration _config;
        public HomeController(BoloContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }
        public IActionResult Index([FromQuery] string q = "")
        {
            ViewBag.Search = q;
            return View();
        }

        public IActionResult Conversation()
        {
            return View();
        }

        [Route("addpost")]
        public IActionResult AddPost()
        {
            return View(new PostPhotoDTO());
        }

        [Route("profile")]
        public IActionResult Profile([FromQuery] string un = "")
        {
            ViewBag.UserName = un;
            return View();
        }

        [Route("discover")]
        public IActionResult Discover()
        {
            return View();
        }

        [Route("updateprofile")]
        public IActionResult UpdateProfile()
        {
            return View();
        }

        [Route("forgotpassword")]
        public async Task<IActionResult> ForgotPasswordAsync([FromQuery] string username = "")
        {
            if (!string.IsNullOrEmpty(username))
            {
                var member = _context.Members.FirstOrDefault(t => t.UserName == username || t.Email == username || t.Phone == username);
                if (member != null)
                {
                    Random r = new Random();
                    string password = string.Format("{0}{1}{2}{3}{4}{5}", r.Next(0, 9), r.Next(0, 9), r.Next(0, 9), r.Next(0, 9), r.Next(0, 9), r.Next(0, 9));
                    member.Password = EncryptionHelper.CalculateSHA256(password);
                    await _context.SaveChangesAsync();
                    if (!string.IsNullOrEmpty(member.Email))
                    {
                        EmailUtility eu = new EmailUtility(_config);
                        eu.SendEmail(member.Email, member.UserName, _config["AdminEmail"], _config["AdminName"], "Waarta Password Changed", string.Format("Your password is {0}", password));
                    }
                    if (!string.IsNullOrEmpty(member.Phone))
                    {
                        try
                        {
                            Bolo.Helper.Utility.SendSMS(member.Phone,
                                string.Format("Your {1} passcode is: {0}", password, _config["SiteName"]),
                                member.Country);
                        }
                        catch
                        {

                        }
                    }
                    ViewBag.Success = "Password sent at registered email and phone.";
                }
            }
            return View();
        }

        [Route("ignored")]
        public IActionResult Ignored()
        {
            return View();
        }

        [Route("post/{id}")]
        public IActionResult Post(Guid id)
        {
            ViewBag.PostId = id;
            return View();
        }


        [HttpGet]
        [Route("query")]
        public IActionResult Query() { return View(); }


        [HttpPost]
        [Route("query")]
        [Authorize]
        public IActionResult Query([FromForm] string sql)
        {
            try
            {
                Member member = _context.Members.First(t => t.PublicID == new Guid(User.Identity.Name));
                if (member.UserName.ToLower() == "rajkiransingh")
                {
                    using (SqlConnection connection = new SqlConnection(_config.GetConnectionString("DefaultConnection")))
                    {
                        using (SqlCommand command = new SqlCommand(sql, connection))
                        {
                            connection.Open();
                            int result = command.ExecuteNonQuery();
                            ViewBag.Success = "Result " + result;
                        }

                    }
                }
            }
            catch(Exception ex) {
                ViewBag.Error = ex.Message;
            }
            return View();
        }
    }
}