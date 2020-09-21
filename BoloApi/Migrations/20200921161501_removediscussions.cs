using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class removediscussions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
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
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Discussions",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    OwnerID = table.Column<int>(type: "int", nullable: true),
                    PublicID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Purpose = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
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
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DiscussionID = table.Column<int>(type: "int", nullable: true),
                    MemberID = table.Column<int>(type: "int", nullable: true),
                    Relation = table.Column<int>(type: "int", nullable: false)
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
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DiscussionID = table.Column<int>(type: "int", nullable: true),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PublicID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SenderID = table.Column<int>(type: "int", nullable: true),
                    SentDate = table.Column<DateTime>(type: "datetime2", nullable: false)
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
    }
}
