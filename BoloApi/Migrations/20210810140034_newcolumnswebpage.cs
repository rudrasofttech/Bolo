using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class newcolumnswebpage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExtLinks",
                schema: "dbo",
                table: "WebPage",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IntLinks",
                schema: "dbo",
                table: "WebPage",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExtLinks",
                schema: "dbo",
                table: "WebPage");

            migrationBuilder.DropColumn(
                name: "IntLinks",
                schema: "dbo",
                table: "WebPage");
        }
    }
}
