using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class modifyposttable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Qoute",
                schema: "dbo",
                table: "Post");

            migrationBuilder.DropColumn(
                name: "QouteDecor",
                schema: "dbo",
                table: "Post");

            migrationBuilder.AddColumn<string>(
                name: "Describe",
                schema: "dbo",
                table: "Post",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoURL",
                schema: "dbo",
                table: "Post",
                maxLength: 1000,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Describe",
                schema: "dbo",
                table: "Post");

            migrationBuilder.DropColumn(
                name: "VideoURL",
                schema: "dbo",
                table: "Post");

            migrationBuilder.AddColumn<string>(
                name: "Qoute",
                schema: "dbo",
                table: "Post",
                type: "nvarchar(350)",
                maxLength: 350,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "QouteDecor",
                schema: "dbo",
                table: "Post",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
