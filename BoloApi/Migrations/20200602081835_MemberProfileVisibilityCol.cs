using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class MemberProfileVisibilityCol : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SearchStatus",
                schema: "dbo",
                table: "Member");

            migrationBuilder.AddColumn<int>(
                name: "Visibility",
                schema: "dbo",
                table: "Member",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Visibility",
                schema: "dbo",
                table: "Member");

            migrationBuilder.AddColumn<int>(
                name: "SearchStatus",
                schema: "dbo",
                table: "Member",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
