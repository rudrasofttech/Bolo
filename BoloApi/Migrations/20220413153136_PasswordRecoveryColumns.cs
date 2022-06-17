using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class PasswordRecoveryColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "RecoveryAnswer",
                schema: "dbo",
                table: "Member",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RecoveryQuestion",
                schema: "dbo",
                table: "Member",
                maxLength: 2000,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RecoveryAnswer",
                schema: "dbo",
                table: "Member");

            migrationBuilder.DropColumn(
                name: "RecoveryQuestion",
                schema: "dbo",
                table: "Member");
        }
    }
}
