using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class MemberColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Bio",
                schema: "dbo",
                table: "Member",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BirthYear",
                schema: "dbo",
                table: "Member",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Gender",
                schema: "dbo",
                table: "Member",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<byte[]>(
                name: "Pic",
                schema: "dbo",
                table: "Member",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SearchStatus",
                schema: "dbo",
                table: "Member",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Bio",
                schema: "dbo",
                table: "Member");

            migrationBuilder.DropColumn(
                name: "BirthYear",
                schema: "dbo",
                table: "Member");

            migrationBuilder.DropColumn(
                name: "Gender",
                schema: "dbo",
                table: "Member");

            migrationBuilder.DropColumn(
                name: "Pic",
                schema: "dbo",
                table: "Member");

            migrationBuilder.DropColumn(
                name: "SearchStatus",
                schema: "dbo",
                table: "Member");
        }
    }
}
