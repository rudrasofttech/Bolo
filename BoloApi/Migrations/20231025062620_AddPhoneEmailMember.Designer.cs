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
    [Migration("20231025062620_AddPhoneEmailMember")]
    partial class AddPhoneEmailMember
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasDefaultSchema("dbo")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("ProductVersion", "5.0.17")
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

            modelBuilder.Entity("Bolo.Models.DiscoverPostView", b =>
                {
                    b.Property<int>("ID")
                        .HasColumnType("int");

                    b.ToView("DiscoverPostView");
                });

            modelBuilder.Entity("Bolo.Models.FlaggedItem", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("CommentID")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreateDate")
                        .HasColumnType("datetime2");

                    b.Property<int>("FlagType")
                        .HasColumnType("int");

                    b.Property<int>("MemberID")
                        .HasColumnType("int");

                    b.Property<int>("PostID")
                        .HasColumnType("int");

                    b.HasKey("ID");

                    b.HasIndex("MemberID");

                    b.ToTable("FlaggedItem");
                });

            modelBuilder.Entity("Bolo.Models.HashTag", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int?>("PostID")
                        .HasColumnType("int");

                    b.Property<string>("Tag")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("nvarchar(200)");

                    b.HasKey("ID");

                    b.HasIndex("PostID");

                    b.ToTable("HashTag");
                });

            modelBuilder.Entity("Bolo.Models.IgnoredMember", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<DateTime>("CreateDate")
                        .HasColumnType("datetime2");

                    b.Property<int?>("IgnoredID")
                        .HasColumnType("int");

                    b.Property<int?>("UserID")
                        .HasColumnType("int");

                    b.HasKey("ID");

                    b.HasIndex("IgnoredID");

                    b.HasIndex("UserID");

                    b.ToTable("IgnoredMember");
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
                        .HasMaxLength(1000)
                        .HasColumnType("nvarchar(1000)");

                    b.Property<int>("BirthYear")
                        .HasColumnType("int");

                    b.Property<string>("City")
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<string>("Country")
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<DateTime>("CreateDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("Email")
                        .HasMaxLength(250)
                        .HasColumnType("nvarchar(250)");

                    b.Property<int>("Gender")
                        .HasColumnType("int");

                    b.Property<bool>("IsEmailVerified")
                        .HasColumnType("bit");

                    b.Property<DateTime>("LastPulse")
                        .HasColumnType("datetime2");

                    b.Property<DateTime?>("ModifyDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("Name")
                        .HasMaxLength(200)
                        .HasColumnType("nvarchar(200)");

                    b.Property<byte[]>("Password")
                        .IsRequired()
                        .HasColumnType("varbinary(max)");

                    b.Property<string>("Phone")
                        .HasMaxLength(15)
                        .HasColumnType("nvarchar(15)");

                    b.Property<string>("Pic")
                        .HasColumnType("nvarchar(max)");

                    b.Property<Guid>("PublicID")
                        .HasColumnType("uniqueidentifier");

                    b.Property<byte[]>("SecurityAnswer")
                        .IsRequired()
                        .HasColumnType("varbinary(max)");

                    b.Property<string>("SecurityQuestion")
                        .IsRequired()
                        .HasMaxLength(300)
                        .HasColumnType("nvarchar(300)");

                    b.Property<string>("State")
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<int>("Status")
                        .HasColumnType("int");

                    b.Property<string>("ThoughtStatus")
                        .HasMaxLength(200)
                        .HasColumnType("nvarchar(200)");

                    b.Property<string>("UserName")
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)");

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

                    b.Property<string>("Comment")
                        .HasMaxLength(7999)
                        .HasColumnType("nvarchar(max)");

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

                    b.Property<string>("Tag")
                        .HasMaxLength(200)
                        .HasColumnType("nvarchar(200)");

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

                    b.Property<bool>("AcceptComment")
                        .HasColumnType("bit");

                    b.Property<bool>("AllowShare")
                        .HasColumnType("bit");

                    b.Property<int>("CommentCount")
                        .HasColumnType("int");

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

                    b.Property<int>("Rank")
                        .HasColumnType("int");

                    b.Property<int>("ReactionCount")
                        .HasColumnType("int");

                    b.Property<int>("ShareCount")
                        .HasColumnType("int");

                    b.Property<int>("Status")
                        .HasColumnType("int");

                    b.Property<string>("VideoURL")
                        .HasMaxLength(1000)
                        .HasColumnType("nvarchar(1000)");

                    b.HasKey("ID");

                    b.HasIndex("ModifierID");

                    b.HasIndex("OwnerID");

                    b.ToTable("MemberPost");
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

            modelBuilder.Entity("Bolo.Models.MemberRole", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int?>("MemberID")
                        .HasColumnType("int");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("ID");

                    b.HasIndex("MemberID");

                    b.ToTable("MemberRole");
                });

            modelBuilder.Entity("Bolo.Models.Notification", b =>
                {
                    b.Property<Guid>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<int?>("CommentID")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreateDate")
                        .HasColumnType("datetime2");

                    b.Property<int?>("PostID")
                        .HasColumnType("int");

                    b.Property<bool>("Seen")
                        .HasColumnType("bit");

                    b.Property<int?>("SourceID")
                        .HasColumnType("int");

                    b.Property<int?>("TargetID")
                        .HasColumnType("int");

                    b.Property<string>("Text")
                        .HasMaxLength(200)
                        .HasColumnType("nvarchar(200)");

                    b.Property<int>("Type")
                        .HasColumnType("int");

                    b.HasKey("ID");

                    b.HasIndex("CommentID");

                    b.HasIndex("PostID");

                    b.HasIndex("SourceID");

                    b.HasIndex("TargetID");

                    b.ToTable("Notification");
                });

            modelBuilder.Entity("Bolo.Models.PopularPublicAccountView", b =>
                {
                    b.Property<int>("Activity")
                        .HasColumnType("int");

                    b.Property<string>("Bio")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("BirthYear")
                        .HasColumnType("int");

                    b.Property<string>("City")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Country")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("CreateDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("Email")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("Gender")
                        .HasColumnType("int");

                    b.Property<int>("ID")
                        .HasColumnType("int");

                    b.Property<DateTime>("LastPulse")
                        .HasColumnType("datetime2");

                    b.Property<DateTime?>("ModifyDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Phone")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Pic")
                        .HasColumnType("nvarchar(max)");

                    b.Property<Guid>("PublicID")
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("SecurityQuestion")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("State")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("Status")
                        .HasColumnType("int");

                    b.Property<string>("ThoughtStatus")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UserName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("Visibility")
                        .HasColumnType("int");

                    b.ToView("PopularPublicAccountView");
                });

            modelBuilder.Entity("Bolo.Models.PostFeedViewItem", b =>
                {
                    b.Property<int>("ID")
                        .HasColumnType("int");

                    b.ToView("PostFeedView");
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

                    b.ToTable("PostPhoto");
                });

            modelBuilder.Entity("Bolo.Models.ProfileEmail", b =>
                {
                    b.Property<Guid>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("Email")
                        .HasMaxLength(500)
                        .HasColumnType("nvarchar(500)");

                    b.Property<int?>("MemberID")
                        .HasColumnType("int");

                    b.HasKey("ID");

                    b.HasIndex("MemberID");

                    b.ToTable("ProfileEmail");
                });

            modelBuilder.Entity("Bolo.Models.ProfileLink", b =>
                {
                    b.Property<Guid>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<int?>("MemberID")
                        .HasColumnType("int");

                    b.Property<string>("Name")
                        .HasMaxLength(200)
                        .HasColumnType("nvarchar(200)");

                    b.Property<string>("URL")
                        .HasMaxLength(300)
                        .HasColumnType("nvarchar(300)");

                    b.HasKey("ID");

                    b.HasIndex("MemberID");

                    b.ToTable("ProfileLink");
                });

            modelBuilder.Entity("Bolo.Models.ProfilePhone", b =>
                {
                    b.Property<Guid>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<int?>("MemberID")
                        .HasColumnType("int");

                    b.Property<string>("Phone")
                        .HasMaxLength(500)
                        .HasColumnType("nvarchar(500)");

                    b.HasKey("ID");

                    b.HasIndex("MemberID");

                    b.ToTable("ProfilePhone");
                });

            modelBuilder.Entity("Bolo.Models.PushNotificationWebApp", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Auth")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Endpoint")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("P256dh")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("UserID")
                        .HasColumnType("int");

                    b.HasKey("ID");

                    b.HasIndex("UserID");

                    b.ToTable("PushNotificationWebApp");
                });

            modelBuilder.Entity("Bolo.Models.SearchKeyword", b =>
                {
                    b.Property<Guid>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<DateTime>("CreateDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("IPAddress")
                        .HasMaxLength(20)
                        .HasColumnType("nvarchar(20)");

                    b.Property<int>("ResultCount")
                        .HasColumnType("int");

                    b.Property<string>("Text")
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.HasKey("ID");

                    b.ToTable("SearchKeyword");
                });

            modelBuilder.Entity("Bolo.Models.ChatMessage", b =>
                {
                    b.HasOne("Bolo.Models.Member", "SentBy")
                        .WithMany()
                        .HasForeignKey("SentByID");

                    b.HasOne("Bolo.Models.Member", "SentTo")
                        .WithMany()
                        .HasForeignKey("SentToID");

                    b.Navigation("SentBy");

                    b.Navigation("SentTo");
                });

            modelBuilder.Entity("Bolo.Models.Contact", b =>
                {
                    b.HasOne("Bolo.Models.Member", "Owner")
                        .WithMany()
                        .HasForeignKey("OwnerID");

                    b.HasOne("Bolo.Models.Member", "Person")
                        .WithMany()
                        .HasForeignKey("PersonID");

                    b.Navigation("Owner");

                    b.Navigation("Person");
                });

            modelBuilder.Entity("Bolo.Models.FlaggedItem", b =>
                {
                    b.HasOne("Bolo.Models.Member", "User")
                        .WithMany()
                        .HasForeignKey("MemberID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Bolo.Models.HashTag", b =>
                {
                    b.HasOne("Bolo.Models.MemberPost", "Post")
                        .WithMany()
                        .HasForeignKey("PostID");

                    b.Navigation("Post");
                });

            modelBuilder.Entity("Bolo.Models.IgnoredMember", b =>
                {
                    b.HasOne("Bolo.Models.Member", "Ignored")
                        .WithMany()
                        .HasForeignKey("IgnoredID");

                    b.HasOne("Bolo.Models.Member", "User")
                        .WithMany()
                        .HasForeignKey("UserID");

                    b.Navigation("Ignored");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Bolo.Models.MemberComment", b =>
                {
                    b.HasOne("Bolo.Models.Member", "CommentedBy")
                        .WithMany()
                        .HasForeignKey("CommentedByID");

                    b.HasOne("Bolo.Models.MemberPost", "Post")
                        .WithMany()
                        .HasForeignKey("PostID");

                    b.Navigation("CommentedBy");

                    b.Navigation("Post");
                });

            modelBuilder.Entity("Bolo.Models.MemberFollower", b =>
                {
                    b.HasOne("Bolo.Models.Member", "Follower")
                        .WithMany()
                        .HasForeignKey("FollowerID");

                    b.HasOne("Bolo.Models.Member", "Following")
                        .WithMany()
                        .HasForeignKey("FollowingID");

                    b.Navigation("Follower");

                    b.Navigation("Following");
                });

            modelBuilder.Entity("Bolo.Models.MemberPost", b =>
                {
                    b.HasOne("Bolo.Models.Member", "Modifier")
                        .WithMany()
                        .HasForeignKey("ModifierID");

                    b.HasOne("Bolo.Models.Member", "Owner")
                        .WithMany()
                        .HasForeignKey("OwnerID");

                    b.Navigation("Modifier");

                    b.Navigation("Owner");
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

                    b.Navigation("Comment");

                    b.Navigation("Post");

                    b.Navigation("ReactedBy");
                });

            modelBuilder.Entity("Bolo.Models.MemberRole", b =>
                {
                    b.HasOne("Bolo.Models.Member", null)
                        .WithMany("Roles")
                        .HasForeignKey("MemberID");
                });

            modelBuilder.Entity("Bolo.Models.Notification", b =>
                {
                    b.HasOne("Bolo.Models.MemberComment", "Comment")
                        .WithMany()
                        .HasForeignKey("CommentID");

                    b.HasOne("Bolo.Models.MemberPost", "Post")
                        .WithMany()
                        .HasForeignKey("PostID");

                    b.HasOne("Bolo.Models.Member", "Source")
                        .WithMany()
                        .HasForeignKey("SourceID");

                    b.HasOne("Bolo.Models.Member", "Target")
                        .WithMany()
                        .HasForeignKey("TargetID");

                    b.Navigation("Comment");

                    b.Navigation("Post");

                    b.Navigation("Source");

                    b.Navigation("Target");
                });

            modelBuilder.Entity("Bolo.Models.PostPhoto", b =>
                {
                    b.HasOne("Bolo.Models.MemberPost", null)
                        .WithMany("Photos")
                        .HasForeignKey("MemberPostID");
                });

            modelBuilder.Entity("Bolo.Models.ProfileEmail", b =>
                {
                    b.HasOne("Bolo.Models.Member", "Member")
                        .WithMany()
                        .HasForeignKey("MemberID");

                    b.Navigation("Member");
                });

            modelBuilder.Entity("Bolo.Models.ProfileLink", b =>
                {
                    b.HasOne("Bolo.Models.Member", "Member")
                        .WithMany()
                        .HasForeignKey("MemberID");

                    b.Navigation("Member");
                });

            modelBuilder.Entity("Bolo.Models.ProfilePhone", b =>
                {
                    b.HasOne("Bolo.Models.Member", "Member")
                        .WithMany()
                        .HasForeignKey("MemberID");

                    b.Navigation("Member");
                });

            modelBuilder.Entity("Bolo.Models.PushNotificationWebApp", b =>
                {
                    b.HasOne("Bolo.Models.Member", "User")
                        .WithMany()
                        .HasForeignKey("UserID");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Bolo.Models.Member", b =>
                {
                    b.Navigation("Roles");
                });

            modelBuilder.Entity("Bolo.Models.MemberPost", b =>
                {
                    b.Navigation("Photos");
                });
#pragma warning restore 612, 618
        }
    }
}
