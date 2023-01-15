using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class IgnoredMember : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BlockedMember",
                schema: "dbo");

            migrationBuilder.CreateTable(
                name: "IgnoredMember",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: true),
                    IgnoredID = table.Column<int>(type: "int", nullable: true),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IgnoredMember", x => x.ID);
                    table.ForeignKey(
                        name: "FK_IgnoredMember_Member_IgnoredID",
                        column: x => x.IgnoredID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_IgnoredMember_Member_UserID",
                        column: x => x.UserID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IgnoredMember_IgnoredID",
                schema: "dbo",
                table: "IgnoredMember",
                column: "IgnoredID");

            migrationBuilder.CreateIndex(
                name: "IX_IgnoredMember_UserID",
                schema: "dbo",
                table: "IgnoredMember",
                column: "UserID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IgnoredMember",
                schema: "dbo");

            migrationBuilder.CreateTable(
                name: "BlockedMember",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BlockedID = table.Column<int>(type: "int", nullable: true),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlockedMember", x => x.ID);
                    table.ForeignKey(
                        name: "FK_BlockedMember_Member_BlockedID",
                        column: x => x.BlockedID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BlockedMember_Member_UserID",
                        column: x => x.UserID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BlockedMember_BlockedID",
                schema: "dbo",
                table: "BlockedMember",
                column: "BlockedID");

            migrationBuilder.CreateIndex(
                name: "IX_BlockedMember_UserID",
                schema: "dbo",
                table: "BlockedMember",
                column: "UserID");
        }
    }
}
