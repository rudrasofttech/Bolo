﻿// <auto-generated />
using System;
using Bolo.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Bolo.Migrations
{
    [DbContext(typeof(BoloContext))]
    partial class BoloContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
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

            modelBuilder.Entity("Bolo.Models.Meeting", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<DateTime>("CreateDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(50)")
                        .HasMaxLength(50);

                    b.Property<int?>("OwnerID")
                        .HasColumnType("int");

                    b.Property<string>("Pic")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PublicID")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Purpose")
                        .HasColumnType("nvarchar(250)")
                        .HasMaxLength(250);

                    b.Property<int>("Status")
                        .HasColumnType("int");

                    b.HasKey("ID");

                    b.HasIndex("OwnerID");

                    b.ToTable("Meeting");
                });

            modelBuilder.Entity("Bolo.Models.MeetingMember", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<DateTime>("CreateDate")
                        .HasColumnType("datetime2");

                    b.Property<int?>("MeetingID")
                        .HasColumnType("int");

                    b.Property<int?>("MemberID")
                        .HasColumnType("int");

                    b.Property<int>("MemberType")
                        .HasColumnType("int");

                    b.HasKey("ID");

                    b.HasIndex("MeetingID");

                    b.HasIndex("MemberID");

                    b.ToTable("MeetingMember");
                });

            modelBuilder.Entity("Bolo.Models.MeetingMessage", b =>
                {
                    b.Property<Guid>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<int?>("MeetingID")
                        .HasColumnType("int");

                    b.Property<string>("Message")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("SentByID")
                        .HasColumnType("int");

                    b.Property<DateTime>("SentDate")
                        .HasColumnType("datetime2");

                    b.HasKey("ID");

                    b.HasIndex("MeetingID");

                    b.HasIndex("SentByID");

                    b.ToTable("MeetingMessage");
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

            modelBuilder.Entity("Bolo.Models.WebPage", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Description")
                        .HasColumnType("nvarchar(200)")
                        .HasMaxLength(200);

                    b.Property<string>("Domain")
                        .HasColumnType("nvarchar(300)")
                        .HasMaxLength(300);

                    b.Property<DateTime>("EntryDate")
                        .HasColumnType("datetime2");

                    b.Property<DateTime>("LastCrawled")
                        .HasColumnType("datetime2");

                    b.Property<string>("MetaDescription")
                        .HasColumnType("nvarchar(300)")
                        .HasMaxLength(300);

                    b.Property<string>("PageData")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Title")
                        .HasColumnType("nvarchar(100)")
                        .HasMaxLength(100);

                    b.Property<string>("URL")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("ID");

                    b.ToTable("WebPage");
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

            modelBuilder.Entity("Bolo.Models.Meeting", b =>
                {
                    b.HasOne("Bolo.Models.Member", "Owner")
                        .WithMany()
                        .HasForeignKey("OwnerID");
                });

            modelBuilder.Entity("Bolo.Models.MeetingMember", b =>
                {
                    b.HasOne("Bolo.Models.Meeting", "Meeting")
                        .WithMany()
                        .HasForeignKey("MeetingID");

                    b.HasOne("Bolo.Models.Member", "Member")
                        .WithMany()
                        .HasForeignKey("MemberID");
                });

            modelBuilder.Entity("Bolo.Models.MeetingMessage", b =>
                {
                    b.HasOne("Bolo.Models.Meeting", "Meeting")
                        .WithMany()
                        .HasForeignKey("MeetingID");

                    b.HasOne("Bolo.Models.Member", "SentBy")
                        .WithMany()
                        .HasForeignKey("SentByID");
                });
#pragma warning restore 612, 618
        }
    }
}
