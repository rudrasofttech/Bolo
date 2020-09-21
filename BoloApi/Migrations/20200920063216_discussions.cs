using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class discussions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MeetingMember",
                schema: "dbo");

            migrationBuilder.CreateTable(
                name: "Discussions",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OwnerID = table.Column<int>(nullable: true),
                    CreateDate = table.Column<DateTime>(nullable: false),
                    PublicID = table.Column<string>(nullable: true),
                    Status = table.Column<int>(nullable: false),
                    Name = table.Column<string>(maxLength: 100, nullable: true),
                    Purpose = table.Column<string>(maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Discussions", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Discussions_Member_OwnerID",
                        column: x => x.OwnerID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DiscussionMember",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MemberID = table.Column<int>(nullable: true),
                    DiscussionID = table.Column<int>(nullable: true),
                    Relation = table.Column<int>(nullable: false),
                    CreateDate = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiscussionMember", x => x.ID);
                    table.ForeignKey(
                        name: "FK_DiscussionMember_Discussions_DiscussionID",
                        column: x => x.DiscussionID,
                        principalSchema: "dbo",
                        principalTable: "Discussions",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DiscussionMember_Member_MemberID",
                        column: x => x.MemberID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DiscussionMessage",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SenderID = table.Column<int>(nullable: true),
                    DiscussionID = table.Column<int>(nullable: true),
                    SentDate = table.Column<DateTime>(nullable: false),
                    Message = table.Column<string>(nullable: true),
                    PublicID = table.Column<Guid>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiscussionMessage", x => x.ID);
                    table.ForeignKey(
                        name: "FK_DiscussionMessage_Discussions_DiscussionID",
                        column: x => x.DiscussionID,
                        principalSchema: "dbo",
                        principalTable: "Discussions",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DiscussionMessage_Member_SenderID",
                        column: x => x.SenderID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DiscussionMember_DiscussionID",
                schema: "dbo",
                table: "DiscussionMember",
                column: "DiscussionID");

            migrationBuilder.CreateIndex(
                name: "IX_DiscussionMember_MemberID",
                schema: "dbo",
                table: "DiscussionMember",
                column: "MemberID");

            migrationBuilder.CreateIndex(
                name: "IX_DiscussionMessage_DiscussionID",
                schema: "dbo",
                table: "DiscussionMessage",
                column: "DiscussionID");

            migrationBuilder.CreateIndex(
                name: "IX_DiscussionMessage_SenderID",
                schema: "dbo",
                table: "DiscussionMessage",
                column: "SenderID");

            migrationBuilder.CreateIndex(
                name: "IX_Discussions_OwnerID",
                schema: "dbo",
                table: "Discussions",
                column: "OwnerID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DiscussionMember",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "DiscussionMessage",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Discussions",
                schema: "dbo");

            migrationBuilder.CreateTable(
                name: "MeetingMember",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MeetingID = table.Column<int>(type: "int", nullable: true),
                    MemberID = table.Column<int>(type: "int", nullable: true),
                    Relation = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MeetingMember", x => x.ID);
                    table.ForeignKey(
                        name: "FK_MeetingMember_Meeting_MeetingID",
                        column: x => x.MeetingID,
                        principalSchema: "dbo",
                        principalTable: "Meeting",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MeetingMember_Member_MemberID",
                        column: x => x.MemberID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MeetingMember_MeetingID",
                schema: "dbo",
                table: "MeetingMember",
                column: "MeetingID");

            migrationBuilder.CreateIndex(
                name: "IX_MeetingMember_MemberID",
                schema: "dbo",
                table: "MeetingMember",
                column: "MemberID");
        }
    }
}
