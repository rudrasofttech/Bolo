using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class MemberChangeSecurityAnswerRenamed : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PasswordAnswer",
                schema: "dbo",
                table: "Member",
                newName: "SecurityAnswer");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SecurityAnswer",
                schema: "dbo",
                table: "Member",
                newName: "PasswordAnswer");
        }
    }
}
