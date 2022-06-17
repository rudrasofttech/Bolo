using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class RemoveMemberComment : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MemberReaction_MemberComment_CommentID",
                schema: "dbo",
                table: "MemberReaction");

            migrationBuilder.DropTable(
                name: "MemberComment",
                schema: "dbo");

            migrationBuilder.DropIndex(
                name: "IX_MemberReaction_CommentID",
                schema: "dbo",
                table: "MemberReaction");

            migrationBuilder.DropColumn(
                name: "CommentID",
                schema: "dbo",
                table: "MemberReaction");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CommentID",
                schema: "dbo",
                table: "MemberReaction",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MemberComment",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CommentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CommentedByID = table.Column<int>(type: "int", nullable: true),
                    PostID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MemberComment", x => x.ID);
                    table.ForeignKey(
                        name: "FK_MemberComment_Member_CommentedByID",
                        column: x => x.CommentedByID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MemberComment_MemberPost_PostID",
                        column: x => x.PostID,
                        principalSchema: "dbo",
                        principalTable: "MemberPost",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MemberReaction_CommentID",
                schema: "dbo",
                table: "MemberReaction",
                column: "CommentID");

            migrationBuilder.CreateIndex(
                name: "IX_MemberComment_CommentedByID",
                schema: "dbo",
                table: "MemberComment",
                column: "CommentedByID");

            migrationBuilder.CreateIndex(
                name: "IX_MemberComment_PostID",
                schema: "dbo",
                table: "MemberComment",
                column: "PostID");

            migrationBuilder.AddForeignKey(
                name: "FK_MemberReaction_MemberComment_CommentID",
                schema: "dbo",
                table: "MemberReaction",
                column: "CommentID",
                principalSchema: "dbo",
                principalTable: "MemberComment",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
