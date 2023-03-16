using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class PostMetersColumn : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CommentCount",
                schema: "dbo",
                table: "MemberPost",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Rank",
                schema: "dbo",
                table: "MemberPost",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ReactionCount",
                schema: "dbo",
                table: "MemberPost",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ShareCount",
                schema: "dbo",
                table: "MemberPost",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CommentCount",
                schema: "dbo",
                table: "MemberPost");

            migrationBuilder.DropColumn(
                name: "Rank",
                schema: "dbo",
                table: "MemberPost");

            migrationBuilder.DropColumn(
                name: "ReactionCount",
                schema: "dbo",
                table: "MemberPost");

            migrationBuilder.DropColumn(
                name: "ShareCount",
                schema: "dbo",
                table: "MemberPost");
        }
    }
}
