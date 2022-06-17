using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class MemberPostTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MemberPost",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OwnerID = table.Column<int>(nullable: true),
                    PostDate = table.Column<DateTime>(nullable: false),
                    ModifierID = table.Column<int>(nullable: true),
                    ModifyDate = table.Column<DateTime>(nullable: false),
                    PostType = table.Column<int>(nullable: false),
                    Describe = table.Column<string>(maxLength: 2000, nullable: true),
                    Status = table.Column<int>(nullable: false),
                    VideoURL = table.Column<string>(maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MemberPost", x => x.ID);
                    table.ForeignKey(
                        name: "FK_MemberPost_Member_ModifierID",
                        column: x => x.ModifierID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MemberPost_Member_OwnerID",
                        column: x => x.OwnerID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

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
                        name: "FK_MemberComment_MemberPost_PostID",
                        column: x => x.PostID,
                        principalSchema: "dbo",
                        principalTable: "MemberPost",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PostPhoto",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Photo = table.Column<string>(nullable: true),
                    MemberPostID = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostPhoto", x => x.ID);
                    table.ForeignKey(
                        name: "FK_PostPhoto_MemberPost_MemberPostID",
                        column: x => x.MemberPostID,
                        principalSchema: "dbo",
                        principalTable: "MemberPost",
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
                        name: "FK_MemberReaction_MemberPost_PostID",
                        column: x => x.PostID,
                        principalSchema: "dbo",
                        principalTable: "MemberPost",
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
                name: "IX_MemberPost_ModifierID",
                schema: "dbo",
                table: "MemberPost",
                column: "ModifierID");

            migrationBuilder.CreateIndex(
                name: "IX_MemberPost_OwnerID",
                schema: "dbo",
                table: "MemberPost",
                column: "OwnerID");

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

            migrationBuilder.CreateIndex(
                name: "IX_PostPhoto_MemberPostID",
                schema: "dbo",
                table: "PostPhoto",
                column: "MemberPostID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MemberReaction",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "PostPhoto",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "MemberComment",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "MemberPost",
                schema: "dbo");
        }
    }
}
