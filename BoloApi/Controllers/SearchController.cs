using System;
using System.Collections.Generic;
using System.Linq;
using Bolo.Data;
using Bolo.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Bolo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SearchController : ControllerBase
    {
        private readonly BoloContext _context;

        public SearchController(BoloContext context)
        {
            _context = context;
        }

        // GET: api/<SearchController>
        //[HttpGet]
        //public async Task<IEnumerable<SearchResultPost>> GetAsync([FromQuery] string q)
        //{
        //    List<SearchResultPost> result = new List<SearchResultPost>();
        //    SearchHelper sh = new SearchHelper() { query = q };
        //    await sh.SearchAsync();
        //    Dictionary<string, SearchResultPost> results = sh.SearchResult;
        //    foreach (var item in results)
        //    {
        //        result.Add(item.Value);
        //    }
        //    return result;
        //}

        [HttpGet]
        public List<SearchResultItem> Get([FromQuery] string q = "")
        {
            int take = q.Length > 3 ? 50 : 10;
            var result = new List<SearchResultItem>();
            if (!string.IsNullOrEmpty(q))
            {
                var tags = _context.HashTags.Where(t => t.Tag.StartsWith("#" + q))
                     .GroupBy(t => t.Tag)
                     .Select(t => new HashtagDTO() { Tag = t.Key, PostCount = t.Count() })
                     .OrderByDescending(t => t.PostCount).Take(take);

                foreach (var ht in tags)
                    result.Add(new SearchResultItem() { Hashtag = ht });

                var members = _context.Members.Where(t => t.UserName.Contains(q) || t.Name.Contains(q))
                    .Select(t => new MemberSmallDTO(t)).Take(take);
                foreach (var m in members)
                    result.Add(new SearchResultItem() { Member = m });

                _context.SearchKeywords.Add(new SearchKeyword()
                {
                    CreateDate = DateTime.UtcNow,
                    ID = Guid.NewGuid(),
                    IPAddress = Request.HttpContext.Connection.RemoteIpAddress.ToString(),
                    Text = q,
                    ResultCount = result.Count
                });
                _context.SaveChanges();
            }
            return result;
        }


    }
}
