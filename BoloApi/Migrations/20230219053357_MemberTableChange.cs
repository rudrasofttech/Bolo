using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class MemberTableChange : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CountryCode",
                schema: "dbo",
                table: "Member");

            migrationBuilder.AddColumn<string>(
                name: "PasswordHint",
                schema: "dbo",
                table: "Member",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PasswordHint",
                schema: "dbo",
                table: "Member");

            migrationBuilder.AddColumn<string>(
                name: "CountryCode",
                schema: "dbo",
                table: "Member",
                type: "nvarchar(4)",
                maxLength: 4,
                nullable: true);
        }
    }
}
