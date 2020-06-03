using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class memberactivitypulsecol : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "dbo");

            migrationBuilder.RenameTable(
                name: "Member",
                newName: "Member",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "Meeting",
                newName: "Meeting",
                newSchema: "dbo");

            migrationBuilder.AddColumn<int>(
                name: "Activity",
                schema: "dbo",
                table: "Member",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastPulse",
                schema: "dbo",
                table: "Member",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Activity",
                schema: "dbo",
                table: "Member");

            migrationBuilder.DropColumn(
                name: "LastPulse",
                schema: "dbo",
                table: "Member");

            migrationBuilder.RenameTable(
                name: "Member",
                schema: "dbo",
                newName: "Member");

            migrationBuilder.RenameTable(
                name: "Meeting",
                schema: "dbo",
                newName: "Meeting");
        }
    }
}
