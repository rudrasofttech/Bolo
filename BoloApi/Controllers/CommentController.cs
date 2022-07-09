﻿using Bolo.Data;
using Bolo.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BoloWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CommentController : ControllerBase
    {
        private readonly BoloContext _context;
        private readonly IConfiguration _config;

        public CommentController(BoloContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }


        

        // GET api/<PhotoController>/5
        [HttpGet]
        [Route("addreaction/{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<PhotoController>
        [HttpPost]
        public async Task<ActionResult> PostAsync([FromForm] PostPhotoDTO value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { error = "Invalid Input" });
            }

            try
            {
                var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
                MemberPost p = new MemberPost()
                {
                    Describe = value.Describe,
                    Owner = member,
                    PostDate = DateTime.UtcNow,
                    PostType = MemberPostType.Photo,
                    Status = RecordStatus.Active,
                    VideoURL = string.Empty,
                    AcceptComment = value.AcceptComment,
                    PublicID = Guid.NewGuid()
                };
                foreach (string s in value.Photos.Where(t => !string.IsNullOrEmpty(t)))
                {
                    p.Photos.Add(new PostPhoto() { Photo = s });
                }
                _context.Posts.Add(p);
                await _context.SaveChangesAsync();
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = "Unable to process the request. " + ex.Message });
            }
        }

        // PUT api/<PhotoController>/5
        [HttpPut("{id}")]
        public async Task<ActionResult> PutAsync(int id, [FromBody] PutPhotoDTO value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { error = "Invalid Input" });
            }

            try
            {
                var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
                MemberPost p = await _context.Posts.FirstOrDefaultAsync(t => t.ID == id && t.Owner.ID == member.ID);
                p.Modifier = member;
                p.ModifyDate = DateTime.UtcNow;
                p.Describe = value.Describe;
                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = "Unable to process the request. " + ex.Message });
            }
        }

        // DELETE api/<PhotoController>/5
        [HttpPost("{id}")]
        [Route("Delete/{id}")]
        public async Task<ActionResult> DeleteAsync(int id)
        {
            try
            {
                var member = await _context.Members.FirstOrDefaultAsync(t => t.PublicID == new Guid(User.Identity.Name));
                MemberPost p = await _context.Posts.FirstOrDefaultAsync(t => t.ID == id && t.Owner.ID == member.ID);
                _context.Posts.Remove(p);
                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = "Unable to process the request. " + ex.Message });
            }
        }
    }
}