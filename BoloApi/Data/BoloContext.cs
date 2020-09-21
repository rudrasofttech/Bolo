using Bolo.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Bolo.Data
{
    public class BoloContext : DbContext
    {
        public BoloContext(DbContextOptions<BoloContext> options) : base(options)
        {
        }

        public DbSet<Member> Members { get; set; }
        public DbSet<Meeting> Meetings { get; set; }
        //public DbSet<Discussion> Discussions { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        //public DbSet<DiscussionMember> DiscussionMembers { get; set; }
        //public DbSet<DiscussionMessage> DiscussionMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("dbo");
            modelBuilder.Entity<Member>().ToTable("Member");
            modelBuilder.Entity<Meeting>().ToTable("Meeting");
            modelBuilder.Entity<ChatMessage>().ToTable("ChatMessage");
            modelBuilder.Entity<Contact>().ToTable("Contact");
            //modelBuilder.Entity<DiscussionMember>().ToTable("DiscussionMember");
            //modelBuilder.Entity<DiscussionMessage>().ToTable("DiscussionMessage");
        }
    }
}
