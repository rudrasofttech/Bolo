using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class MemberChangeSecurityAnswerType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SecurityAnswer",
                schema: "dbo",
                table: "Member");

            migrationBuilder.AddColumn<bool>(
                name: "IsEmailVerified",
                schema: "dbo",
                table: "Member",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<byte[]>(
                name: "PasswordAnswer",
                schema: "dbo",
                table: "Member",
                type: "varbinary(max)",
                nullable: false,
                defaultValue: new byte[0]);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsEmailVerified",
                schema: "dbo",
                table: "Member");

            migrationBuilder.DropColumn(
                name: "PasswordAnswer",
                schema: "dbo",
                table: "Member");

            migrationBuilder.AddColumn<string>(
                name: "SecurityAnswer",
                schema: "dbo",
                table: "Member",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }
    }
}
