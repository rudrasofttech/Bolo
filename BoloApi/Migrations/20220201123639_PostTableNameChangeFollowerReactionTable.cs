using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class PostTableNameChangeFollowerReactionTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PostPhoto_WaartaPost_WaartaPostID",
                schema: "dbo",
                table: "PostPhoto");

            migrationBuilder.DropIndex(
                name: "IX_PostPhoto_WaartaPostID",
                schema: "dbo",
                table: "PostPhoto");

            migrationBuilder.DropColumn(
                name: "WaartaPostID",
                schema: "dbo",
                table: "PostPhoto");

            migrationBuilder.AddColumn<int>(
                name: "MemberPostID",
                schema: "dbo",
                table: "PostPhoto",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MemberComment",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CommentDate = table.Column<DateTime>(nullable: false),
                    CommentedByID = table.Column<int>(nullable: true),
                    PostID = table.Column<int>(nullable: true)
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
                        name: "FK_MemberComment_WaartaPost_PostID",
                        column: x => x.PostID,
                        principalSchema: "dbo",
                        principalTable: "WaartaPost",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MemberFollower",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FollowedDate = table.Column<DateTime>(nullable: false),
                    FollowerID = table.Column<int>(nullable: true),
                    FollowingID = table.Column<int>(nullable: true),
                    Status = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MemberFollower", x => x.ID);
                    table.ForeignKey(
                        name: "FK_MemberFollower_Member_FollowerID",
                        column: x => x.FollowerID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MemberFollower_Member_FollowingID",
                        column: x => x.FollowingID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MemberReaction",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReactionDate = table.Column<DateTime>(nullable: false),
                    ReactedByID = table.Column<int>(nullable: true),
                    Reaction = table.Column<int>(nullable: false),
                    PostID = table.Column<int>(nullable: true),
                    CommentID = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MemberReaction", x => x.ID);
                    table.ForeignKey(
                        name: "FK_MemberReaction_MemberComment_CommentID",
                        column: x => x.CommentID,
                        principalSchema: "dbo",
                        principalTable: "MemberComment",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MemberReaction_WaartaPost_PostID",
                        column: x => x.PostID,
                        principalSchema: "dbo",
                        principalTable: "WaartaPost",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MemberReaction_Member_ReactedByID",
                        column: x => x.ReactedByID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PostPhoto_MemberPostID",
                schema: "dbo",
                table: "PostPhoto",
                column: "MemberPostID");

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

            migrationBuilder.CreateIndex(
                name: "IX_MemberFollower_FollowerID",
                schema: "dbo",
                table: "MemberFollower",
                column: "FollowerID");

            migrationBuilder.CreateIndex(
                name: "IX_MemberFollower_FollowingID",
                schema: "dbo",
                table: "MemberFollower",
                column: "FollowingID");

            migrationBuilder.CreateIndex(
                name: "IX_MemberReaction_CommentID",
                schema: "dbo",
                table: "MemberReaction",
                column: "CommentID");

            migrationBuilder.CreateIndex(
                name: "IX_MemberReaction_PostID",
                schema: "dbo",
                table: "MemberReaction",
                column: "PostID");

            migrationBuilder.CreateIndex(
                name: "IX_MemberReaction_ReactedByID",
                schema: "dbo",
                table: "MemberReaction",
                column: "ReactedByID");

            migrationBuilder.AddForeignKey(
                name: "FK_PostPhoto_WaartaPost_MemberPostID",
                schema: "dbo",
                table: "PostPhoto",
                column: "MemberPostID",
                principalSchema: "dbo",
                principalTable: "WaartaPost",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PostPhoto_WaartaPost_MemberPostID",
                schema: "dbo",
                table: "PostPhoto");

            migrationBuilder.DropTable(
                name: "MemberFollower",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "MemberReaction",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "MemberComment",
                schema: "dbo");

            migrationBuilder.DropIndex(
                name: "IX_PostPhoto_MemberPostID",
                schema: "dbo",
                table: "PostPhoto");

            migrationBuilder.DropColumn(
                name: "MemberPostID",
                schema: "dbo",
                table: "PostPhoto");

            migrationBuilder.AddColumn<int>(
                name: "WaartaPostID",
                schema: "dbo",
                table: "PostPhoto",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PostPhoto_WaartaPostID",
                schema: "dbo",
                table: "PostPhoto",
                column: "WaartaPostID");

            migrationBuilder.AddForeignKey(
                name: "FK_PostPhoto_WaartaPost_WaartaPostID",
                schema: "dbo",
                table: "PostPhoto",
                column: "WaartaPostID",
                principalSchema: "dbo",
                principalTable: "WaartaPost",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
