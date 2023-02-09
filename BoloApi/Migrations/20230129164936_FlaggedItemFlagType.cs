using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class FlaggedItemFlagType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FlagType",
                schema: "dbo",
                table: "FlaggedItem",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FlagType",
                schema: "dbo",
                table: "FlaggedItem");
        }
    }
}
