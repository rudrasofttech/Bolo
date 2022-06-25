using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class removepasswordrecovery : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "RecoveryAnswer",
                schema: "dbo",
                table: "Member",
                type: "varbinary(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RecoveryQuestion",
                schema: "dbo",
                table: "Member",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);
        }
    }
}
