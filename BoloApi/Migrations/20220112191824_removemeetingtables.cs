using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class removemeetingtables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MeetingMember",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "MeetingMessage",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Meeting",
                schema: "dbo");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Meeting",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    OwnerID = table.Column<int>(type: "int", nullable: true),
                    Pic = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PublicID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Purpose = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Meeting", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Meeting_Member_OwnerID",
                        column: x => x.OwnerID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

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
                    MemberType = table.Column<int>(type: "int", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "MeetingMessage",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MeetingID = table.Column<int>(type: "int", nullable: true),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SentByID = table.Column<int>(type: "int", nullable: true),
                    SentDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MeetingMessage", x => x.ID);
                    table.ForeignKey(
                        name: "FK_MeetingMessage_Meeting_MeetingID",
                        column: x => x.MeetingID,
                        principalSchema: "dbo",
                        principalTable: "Meeting",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MeetingMessage_Member_SentByID",
                        column: x => x.SentByID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Meeting_OwnerID",
                schema: "dbo",
                table: "Meeting",
                column: "OwnerID");

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

            migrationBuilder.CreateIndex(
                name: "IX_MeetingMessage_MeetingID",
                schema: "dbo",
                table: "MeetingMessage",
                column: "MeetingID");

            migrationBuilder.CreateIndex(
                name: "IX_MeetingMessage_SentByID",
                schema: "dbo",
                table: "MeetingMessage",
                column: "SentByID");
        }
    }
}
