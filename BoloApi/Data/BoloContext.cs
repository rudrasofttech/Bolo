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
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<MemberPost> Posts { get; set; }
        public DbSet<PostPhoto> PostPhotos { get; set; }
        public DbSet<MemberFollower> Followers { get; set; }
        public DbSet<MemberReaction> Reactions { get; set; }
        public DbSet<MemberComment> Comments { get; set; }
        public DbSet<HashTag> HashTags { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("dbo");
            modelBuilder.Entity<Member>().ToTable("Member");
            modelBuilder.Entity<ChatMessage>().ToTable("ChatMessage");
            modelBuilder.Entity<Contact>().ToTable("Contact");
            modelBuilder.Entity<MemberPost>().ToTable("MemberPost");
            modelBuilder.Entity<PostPhoto>().ToTable("PostPhoto");
            modelBuilder.Entity<MemberFollower>().ToTable("MemberFollower");
            modelBuilder.Entity<MemberReaction>().ToTable("MemberReaction");
            modelBuilder.Entity<MemberComment>().ToTable("MemberComment");
            modelBuilder.Entity<HashTag>().ToTable("HashTag");
        }
    }
}
