using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace BoloApi.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Meetings()
        {
            return View();
        }
        
        public IActionResult Meeting(string id)
        {
            ViewData["meetingid"] = id;
            return View();
        }

        public IActionResult Chat()
        {
            return View();
        }

    }
}