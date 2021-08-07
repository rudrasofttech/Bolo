using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Bolo.Data;
using Bolo.Models;
using BoloWeb.Helper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BoloWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly BoloContext _context;

        public SearchController(BoloContext context)
        {
            _context = context;
        }

        // GET: api/<SearchController>
        [HttpGet]
        public async Task<IEnumerable<SearchResultPost>> GetAsync([FromQuery] string q)
        {
            List<SearchResultPost> result = new List<SearchResultPost>();
            SearchHelper sh = new SearchHelper() { query = q };
            await sh.SearchAsync();
            Dictionary<string, SearchResultPost> results = sh.SearchResult;
            foreach (var item in results)
            {
                result.Add(item.Value);
            }
            return result;
        }

        [HttpPost]
        [Route("savewebpage")]
        public IActionResult SaveWebpage(WebPageDTO page)
        {
            var wp = _context.WebPages.FirstOrDefault(t => t.URL == page.URL.ToLower());
            if (wp == null)
            {
                wp = new WebPage()
                {
                    Domain = page.Domain,
                    EntryDate = DateTime.UtcNow,
                    MetaDescription = page.MetaDescription,
                    PageData = page.PageData,
                    LastCrawled = DateTime.UtcNow,
                    Title = page.Title,
                    URL = page.URL.Trim().ToLower(),
                    HTML = page.HTML
                };
                _context.WebPages.Add(wp);
                _context.SaveChanges();
            }
            else
            {
                wp.Domain = page.Domain;
                wp.LastCrawled = DateTime.UtcNow;
                wp.MetaDescription = page.MetaDescription;
                wp.PageData = page.PageData;
                wp.Title = page.Title;
                wp.HTML = page.HTML;
                _context.SaveChanges();
            }
            return Ok();
        }

        [HttpGet]
        [Route("getwebpage")]
        public ActionResult<WebPage> GetWebpage([FromQuery]string url)
        {
            var wp = _context.WebPages.FirstOrDefault(t => t.URL == url.ToLower());
            if(wp != null)
            {
                return wp;
            }
            else
            {
                return NotFound();
            }
        }

        [HttpGet]
        [Route("getlatest")]
        public ActionResult<IList<WebPage>> GetLatestEntry()
        {
            var wp = _context.WebPages.OrderByDescending(t => t.EntryDate).Take(20).ToList<WebPage>();
            if (wp != null)
            {
                return wp;
            }
            else
            {
                return NotFound();
            }
        }
    }
}
