using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class meetingmessage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MeetingMessage",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<Guid>(nullable: false),
                    SentByID = table.Column<int>(nullable: true),
                    MeetingID = table.Column<int>(nullable: true),
                    SentDate = table.Column<DateTime>(nullable: false),
                    Message = table.Column<string>(nullable: true)
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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MeetingMessage",
                schema: "dbo");
        }
    }
}
