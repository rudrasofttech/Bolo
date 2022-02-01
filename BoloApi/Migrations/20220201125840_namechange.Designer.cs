﻿// <auto-generated />
using System;
using Bolo.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Bolo.Migrations
{
    [DbContext(typeof(BoloContext))]
    [Migration("20220201125840_namechange")]
    partial class namechange
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasDefaultSchema("dbo")
                .HasAnnotation("ProductVersion", "3.1.5")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("Bolo.Models.ChatMessage", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Message")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("MessageType")
                        .HasColumnType("int");

                    b.Property<Guid>("PublicID")
                        .HasColumnType("uniqueidentifier");

                    b.Property<int?>("SentByID")
                        .HasColumnType("int");

                    b.Property<DateTime>("SentDate")
                        .HasColumnType("datetime2");

                    b.Property<int>("SentStatus")
                        .HasColumnType("int");

                    b.Property<int?>("SentToID")
                        .HasColumnType("int");

                    b.HasKey("ID");

                    b.HasIndex("SentByID");

                    b.HasIndex("SentToID");

                    b.ToTable("ChatMessage");
                });

            modelBuilder.Entity("Bolo.Models.Contact", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("BoloRelation")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreateDate")
                        .HasColumnType("datetime2");

                    b.Property<int?>("OwnerID")
                        .HasColumnType("int");

                    b.Property<int?>("PersonID")
                        .HasColumnType("int");

                    b.HasKey("ID");

                    b.HasIndex("OwnerID");

                    b.HasIndex("PersonID");

                    b.ToTable("Contact");
                });

            modelBuilder.Entity("Bolo.Models.Member", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("Activity")
                        .HasColumnType("int");

                    b.Property<string>("Bio")
                        .HasColumnType("nvarchar(1000)")
                        .HasMaxLength(1000);

                    b.Property<int>("BirthYear")
                        .HasColumnType("int");

                    b.Property<string>("Channelname")
                        .HasColumnType("nvarchar(100)")
                        .HasMaxLength(100);

                    b.Property<string>("City")
                        .HasColumnType("nvarchar(100)")
                        .HasMaxLength(100);

                    b.Property<string>("Country")
                        .HasColumnType("nvarchar(100)")
                        .HasMaxLength(100);

                    b.Property<string>("CountryCode")
                        .HasColumnType("nvarchar(4)")
                        .HasMaxLength(4);

                    b.Property<DateTime>("CreateDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("Email")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("Gender")
                        .HasColumnType("int");

                    b.Property<DateTime>("LastPulse")
                        .HasColumnType("datetime2");

                    b.Property<DateTime?>("ModifyDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(200)")
                        .HasMaxLength(200);

                    b.Property<string>("OTP")
                        .HasColumnType("nvarchar(250)")
                        .HasMaxLength(250);

                    b.Property<DateTime>("OTPExpiry")
                        .HasColumnType("datetime2");

                    b.Property<string>("Phone")
                        .HasColumnType("nvarchar(15)")
                        .HasMaxLength(15);

                    b.Property<string>("Pic")
                        .HasColumnType("nvarchar(max)");

                    b.Property<Guid>("PublicID")
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("State")
                        .HasColumnType("nvarchar(100)")
                        .HasMaxLength(100);

                    b.Property<int>("Status")
                        .HasColumnType("int");

                    b.Property<string>("ThoughtStatus")
                        .HasColumnType("nvarchar(200)")
                        .HasMaxLength(200);

                    b.Property<int>("Visibility")
                        .HasColumnType("int");

                    b.HasKey("ID");

                    b.ToTable("Member");
                });

            modelBuilder.Entity("Bolo.Models.MemberComment", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<DateTime>("CommentDate")
                        .HasColumnType("datetime2");

                    b.Property<int?>("CommentedByID")
                        .HasColumnType("int");

                    b.Property<int?>("PostID")
                        .HasColumnType("int");

                    b.HasKey("ID");

                    b.HasIndex("CommentedByID");

                    b.HasIndex("PostID");

                    b.ToTable("MemberComment");
                });

            modelBuilder.Entity("Bolo.Models.MemberFollower", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<DateTime>("FollowedDate")
                        .HasColumnType("datetime2");

                    b.Property<int?>("FollowerID")
                        .HasColumnType("int");

                    b.Property<int?>("FollowingID")
                        .HasColumnType("int");

                    b.Property<int>("Status")
                        .HasColumnType("int");

                    b.HasKey("ID");

                    b.HasIndex("FollowerID");

                    b.HasIndex("FollowingID");

                    b.ToTable("MemberFollower");
                });

            modelBuilder.Entity("Bolo.Models.MemberPost", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Describe")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("ModifierID")
                        .HasColumnType("int");

                    b.Property<DateTime>("ModifyDate")
                        .HasColumnType("datetime2");

                    b.Property<int?>("OwnerID")
                        .HasColumnType("int");

                    b.Property<DateTime>("PostDate")
                        .HasColumnType("datetime2");

                    b.Property<int>("PostType")
                        .HasColumnType("int");

                    b.Property<Guid>("PublicID")
                        .HasColumnType("uniqueidentifier");

                    b.Property<int>("Status")
                        .HasColumnType("int");

                    b.Property<string>("VideoURL")
                        .HasColumnType("nvarchar(1000)")
                        .HasMaxLength(1000);

                    b.HasKey("ID");

                    b.HasIndex("ModifierID");

                    b.HasIndex("OwnerID");

                    b.ToTable("Posts");
                });

            modelBuilder.Entity("Bolo.Models.MemberReaction", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int?>("CommentID")
                        .HasColumnType("int");

                    b.Property<int?>("PostID")
                        .HasColumnType("int");

                    b.Property<int?>("ReactedByID")
                        .HasColumnType("int");

                    b.Property<int>("Reaction")
                        .HasColumnType("int");

                    b.Property<DateTime>("ReactionDate")
                        .HasColumnType("datetime2");

                    b.HasKey("ID");

                    b.HasIndex("CommentID");

                    b.HasIndex("PostID");

                    b.HasIndex("ReactedByID");

                    b.ToTable("MemberReaction");
                });

            modelBuilder.Entity("Bolo.Models.PostPhoto", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int?>("MemberPostID")
                        .HasColumnType("int");

                    b.Property<string>("Photo")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("ID");

                    b.HasIndex("MemberPostID");

                    b.ToTable("PostPhotos");
                });

            modelBuilder.Entity("Bolo.Models.ChatMessage", b =>
                {
                    b.HasOne("Bolo.Models.Member", "SentBy")
                        .WithMany()
                        .HasForeignKey("SentByID");

                    b.HasOne("Bolo.Models.Member", "SentTo")
                        .WithMany()
                        .HasForeignKey("SentToID");
                });

            modelBuilder.Entity("Bolo.Models.Contact", b =>
                {
                    b.HasOne("Bolo.Models.Member", "Owner")
                        .WithMany()
                        .HasForeignKey("OwnerID");

                    b.HasOne("Bolo.Models.Member", "Person")
                        .WithMany()
                        .HasForeignKey("PersonID");
                });

            modelBuilder.Entity("Bolo.Models.MemberComment", b =>
                {
                    b.HasOne("Bolo.Models.Member", "CommentedBy")
                        .WithMany()
                        .HasForeignKey("CommentedByID");

                    b.HasOne("Bolo.Models.MemberPost", "Post")
                        .WithMany()
                        .HasForeignKey("PostID");
                });

            modelBuilder.Entity("Bolo.Models.MemberFollower", b =>
                {
                    b.HasOne("Bolo.Models.Member", "Follower")
                        .WithMany()
                        .HasForeignKey("FollowerID");

                    b.HasOne("Bolo.Models.Member", "Following")
                        .WithMany()
                        .HasForeignKey("FollowingID");
                });

            modelBuilder.Entity("Bolo.Models.MemberPost", b =>
                {
                    b.HasOne("Bolo.Models.Member", "Modifier")
                        .WithMany()
                        .HasForeignKey("ModifierID");

                    b.HasOne("Bolo.Models.Member", "Owner")
                        .WithMany()
                        .HasForeignKey("OwnerID");
                });

            modelBuilder.Entity("Bolo.Models.MemberReaction", b =>
                {
                    b.HasOne("Bolo.Models.MemberComment", "Comment")
                        .WithMany()
                        .HasForeignKey("CommentID");

                    b.HasOne("Bolo.Models.MemberPost", "Post")
                        .WithMany()
                        .HasForeignKey("PostID");

                    b.HasOne("Bolo.Models.Member", "ReactedBy")
                        .WithMany()
                        .HasForeignKey("ReactedByID");
                });

            modelBuilder.Entity("Bolo.Models.PostPhoto", b =>
                {
                    b.HasOne("Bolo.Models.MemberPost", null)
                        .WithMany("Photos")
                        .HasForeignKey("MemberPostID");
                });
#pragma warning restore 612, 618
        }
    }
}
