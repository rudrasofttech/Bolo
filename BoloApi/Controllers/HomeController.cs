using System;
using System.Linq;
using Bolo.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Hosting;
using BoloWeb.Helper;

namespace Bolo.Controllers
{
    public class HomeController : Controller
    {
        private readonly BoloContext _context;
        private readonly IConfiguration _config;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly EmailHelper emailWorker;
        public HomeController(BoloContext context, IConfiguration config, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _config = config;
            _webHostEnvironment = webHostEnvironment;
            emailWorker = new EmailHelper(config,_webHostEnvironment);
        }

        
        public IActionResult Index([FromQuery] string q = "")
        {
            ViewBag.Search = q;
            return View();
        }

        //[HttpGet]
        //[Route("conversation")]
        //public IActionResult Conversation()
        //{
        //    return View();
        //}

        //[HttpGet]
        //[Route("addpost")]
        //public IActionResult AddPost()
        //{
        //    return View(new PostPhotoDTO());
        //}

        //[HttpGet]
        //[Route("profile")]
        //public IActionResult Profile([FromQuery] string un = "")
        //{
        //    ViewBag.UserName = un;
        //    return View();
        //}

        //[HttpGet]
        //[Route("discover")]
        //public IActionResult Discover()
        //{
        //    return View();
        //}

        //[HttpGet]
        //[Route("updateprofile")]
        //public IActionResult UpdateProfile()
        //{
        //    return View();
        //}

        //[HttpGet]
        //[Route("post/{id}")]
        //public IActionResult Post(Guid id)
        //{
        //    ViewBag.PostId = id;
        //    return View();
        //}

        [HttpGet]
        public IActionResult EmailVerify(Guid id)
        {
            try
            {
                var m = _context.Members.FirstOrDefault(t => t.PublicID == id);
                if (m != null)
                {
                    m.IsEmailVerified = true;
                    _context.SaveChanges();
                    ViewBag.IsEmailVerified = true;
                }
                else
                {
                    ViewBag.Error = "Member not found";
                    ViewBag.IsEmailVerified = false;
                }
            }catch(Exception ex)
            {
                ViewBag.Error = $"Unable to process your request. {ex.Message}";
                ViewBag.IsEmailVerified = false;
            }
            return View();
        }

        //public IActionResult ChangeDP()
        //{
        //    foreach (var member in _context.Members)
        //    {
        //        try
        //        {
        //            if (!string.IsNullOrEmpty(member.Pic) && member.Pic.StartsWith("data:image/"))
        //            {
        //                string substr = member.Pic.Substring(member.Pic.IndexOf(";base64,") + 8, member.Pic.Length - (member.Pic.IndexOf(";base64,") + 8));
        //                byte[] data = System.Convert.FromBase64String(substr);
        //                string filename = string.Format("{0}.jpg", Guid.NewGuid().ToString());
        //                string webRootPath = _webHostEnvironment.WebRootPath;
        //                if (!Directory.Exists(Path.Combine(webRootPath, "dp")))
        //                    Directory.CreateDirectory(Path.Combine(webRootPath, "dp"));

        //                string abspath = Path.Combine(webRootPath, "dp", filename);
        //                string relpath = string.Format("dp/{0}", filename);
        //                using (var stream = new MemoryStream(data, 0, data.Length))
        //                {
        //                    System.Drawing.Image image = System.Drawing.Image.FromStream(stream);
        //                    image.Save(abspath, System.Drawing.Imaging.ImageFormat.Jpeg);
        //                }
        //                member.Pic = relpath;
        //            } 
        //        }
        //        catch
        //        {
        //            throw;
        //        }
        //    }
        //    _context.SaveChanges();
        //    return Ok();
        //}
    }
}