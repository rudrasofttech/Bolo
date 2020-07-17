 using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Bolo.Data;
using Bolo.Models;
using Microsoft.AspNetCore.Authorization;
using Org.BouncyCastle.Asn1.Misc;

namespace Bolo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ContactsController : ControllerBase
    {
        private readonly BoloContext _context;

        public ContactsController(BoloContext context)
        {
            _context = context;
        }

        // GET: api/Contacts
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<Contact>>> GetContacts()
        {
            return await _context.Contacts.ToListAsync();
        }

        // GET: api/Contacts/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Contact>> GetContact(int id)
        {
            var contact = await _context.Contacts.FindAsync(id);

            if (contact == null)
            {
                return NotFound();
            }

            return contact;
        }

        [HttpGet]
        [Route("Member")]
        public async Task<ActionResult<IEnumerable<ContactDTO>>> GetContactsByMember()
        {
            List<ChatMessage> cmlist = new List<ChatMessage>();
            cmlist.AddRange(await _context.ChatMessages.Include(t => t.SentBy).Where(t => t.SentTo.PublicID == new Guid(User.Identity.Name)).OrderByDescending(t => t.SentDate).ToListAsync());
            var contacts = await _context.Contacts.Include(t => t.Person).Where(t => t.Owner.PublicID == new Guid(User.Identity.Name)).OrderByDescending(t => t.CreateDate).ToListAsync();
            List<ContactDTO> result = new List<ContactDTO>();
            foreach (Contact c in contacts)
            {
                ContactDTO cdto = new ContactDTO(c);
                cdto.MessagesOnServer.AddRange(cmlist.Where(t => t.SentBy.PublicID == c.Person.PublicID).OrderBy(t => t.SentDate).Select(t => new ChatMessageDTO(t)).ToList());
                result.Add(cdto);
            }

            return result;
        }

        // PUT: api/Contacts/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutContact(int id, Contact contact)
        {
            if (id != contact.ID)
            {
                return BadRequest();
            }

            _context.Entry(contact).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ContactExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Contacts
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Contact>> PostContact(Contact contact)
        {
            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetContact", new { id = contact.ID }, contact);
        }

        // DELETE: api/Contacts/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Contact>> DeleteContact(int id)
        {
            var contact = await _context.Contacts.FindAsync(id);
            if (contact == null)
            {
                return NotFound();
            }

            _context.Contacts.Remove(contact);
            await _context.SaveChangesAsync();

            return contact;
        }

        private bool ContactExists(int id)
        {
            return _context.Contacts.Any(e => e.ID == id);
        }
    }
}
