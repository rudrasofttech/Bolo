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
    }
}
