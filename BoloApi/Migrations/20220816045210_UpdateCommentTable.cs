using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class UpdateCommentTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Comment",
                schema: "dbo",
                table: "MemberComment",
                type: "nvarchar(max)",
                maxLength: 7999,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Comment",
                schema: "dbo",
                table: "MemberComment");
        }
    }
}
