using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace BoloApi.Controllers
{
    public class HomeController : Controller
    {

        public IActionResult Demo()
        {
            return View();
        }
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Discussions()
        {
            return View();
        }

        public IActionResult Meeting(string id)
        {
            ViewData["meetingid"] = id;
            ViewData["pageid"] = Guid.NewGuid().ToString();
            return View();
        }
        public IActionResult Privacy()
        {
            return View();
        }

        public IActionResult FAQ()
        {
            return View();
        }
        public IActionResult Chat()
        {
            return View();
        }

    }
}