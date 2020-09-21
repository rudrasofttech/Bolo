using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class membermeeting : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MeetingMember",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MemberID = table.Column<int>(nullable: true),
                    MeetingID = table.Column<int>(nullable: true),
                    Relation = table.Column<int>(nullable: false),
                    CreateDate = table.Column<DateTime>(nullable: false)
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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MeetingMember",
                schema: "dbo");
        }
    }
}
