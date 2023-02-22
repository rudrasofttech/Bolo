using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class MemberTableChangeSecurityQuestion : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PasswordHint",
                schema: "dbo",
                table: "Member",
                newName: "SecurityQuestion");

            migrationBuilder.AddColumn<string>(
                name: "SecurityAnswer",
                schema: "dbo",
                table: "Member",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SecurityAnswer",
                schema: "dbo",
                table: "Member");

            migrationBuilder.RenameColumn(
                name: "SecurityQuestion",
                schema: "dbo",
                table: "Member",
                newName: "PasswordHint");
        }
    }
}
