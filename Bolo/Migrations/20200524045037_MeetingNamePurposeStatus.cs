using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class MeetingNamePurposeStatus : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Meeting",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Purpose",
                table: "Meeting",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Meeting",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                table: "Meeting");

            migrationBuilder.DropColumn(
                name: "Purpose",
                table: "Meeting");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Meeting");
        }
    }
}
