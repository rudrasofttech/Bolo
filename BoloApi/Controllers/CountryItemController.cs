using Bolo.Data;
using Bolo.Helper;
using Bolo.Hubs;
using Bolo.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Linq;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BoloWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CountryItemController : ControllerBase
    {
        private readonly BoloContext _context;
        public CountryItemController(BoloContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IEnumerable<CountryItem> Get()
        {
            return _context.CountryItems.ToList();
        }

        [HttpGet("{id}")]
        public CountryItem Get(string id)
        {
            return _context.CountryItems.FirstOrDefault(t => t.Code == id);
        }
    }
}
