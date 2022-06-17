using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class RemoveMemberPost : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MemberReaction",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "PostPhoto",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "MemberPost",
                schema: "dbo");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MemberPost",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Describe = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ModifierID = table.Column<int>(type: "int", nullable: true),
                    ModifyDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OwnerID = table.Column<int>(type: "int", nullable: true),
                    PostDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PostType = table.Column<int>(type: "int", nullable: false),
                    PublicID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    VideoURL = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
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
                name: "MemberReaction",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PostID = table.Column<int>(type: "int", nullable: true),
                    ReactedByID = table.Column<int>(type: "int", nullable: true),
                    Reaction = table.Column<int>(type: "int", nullable: false),
                    ReactionDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MemberReaction", x => x.ID);
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

            migrationBuilder.CreateTable(
                name: "PostPhoto",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MemberPostID = table.Column<int>(type: "int", nullable: true),
                    Photo = table.Column<string>(type: "nvarchar(max)", nullable: true)
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
    }
}
