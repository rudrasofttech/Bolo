using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class BlockedMember : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CountryItem",
                schema: "dbo");

            migrationBuilder.CreateTable(
                name: "BlockedMember",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: true),
                    BlockedID = table.Column<int>(type: "int", nullable: true),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false)
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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BlockedMember",
                schema: "dbo");

            migrationBuilder.CreateTable(
                name: "CountryItem",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CountryItem", x => x.ID);
                });
        }
    }
}
