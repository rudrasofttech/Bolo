using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class RemoveEmailsPhoneAddressColumn : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DisplayAddress",
                schema: "dbo",
                table: "Member");

            migrationBuilder.DropColumn(
                name: "DisplayEmail1",
                schema: "dbo",
                table: "Member");

            migrationBuilder.DropColumn(
                name: "DisplayEmail2",
                schema: "dbo",
                table: "Member");

            migrationBuilder.DropColumn(
                name: "DisplayPhone1",
                schema: "dbo",
                table: "Member");

            migrationBuilder.DropColumn(
                name: "DisplayPhone2",
                schema: "dbo",
                table: "Member");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DisplayAddress",
                schema: "dbo",
                table: "Member",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplayEmail1",
                schema: "dbo",
                table: "Member",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplayEmail2",
                schema: "dbo",
                table: "Member",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplayPhone1",
                schema: "dbo",
                table: "Member",
                type: "nvarchar(15)",
                maxLength: 15,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplayPhone2",
                schema: "dbo",
                table: "Member",
                type: "nvarchar(15)",
                maxLength: 15,
                nullable: true);
        }
    }
}
