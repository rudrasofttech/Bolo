using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class changeposttablename : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PostPhoto_Post_PostID",
                schema: "dbo",
                table: "PostPhoto");

            migrationBuilder.DropTable(
                name: "Post",
                schema: "dbo");

            migrationBuilder.DropIndex(
                name: "IX_PostPhoto_PostID",
                schema: "dbo",
                table: "PostPhoto");

            migrationBuilder.DropColumn(
                name: "PostID",
                schema: "dbo",
                table: "PostPhoto");

            migrationBuilder.AddColumn<int>(
                name: "WaartaPostID",
                schema: "dbo",
                table: "PostPhoto",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "WaartaPost",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PublicID = table.Column<Guid>(nullable: false),
                    OwnerID = table.Column<int>(nullable: true),
                    PostDate = table.Column<DateTime>(nullable: false),
                    ModifierID = table.Column<int>(nullable: true),
                    ModifyDate = table.Column<DateTime>(nullable: false),
                    PostType = table.Column<int>(nullable: false),
                    Describe = table.Column<string>(nullable: true),
                    Status = table.Column<int>(nullable: false),
                    VideoURL = table.Column<string>(maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WaartaPost", x => x.ID);
                    table.ForeignKey(
                        name: "FK_WaartaPost_Member_ModifierID",
                        column: x => x.ModifierID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WaartaPost_Member_OwnerID",
                        column: x => x.OwnerID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PostPhoto_WaartaPostID",
                schema: "dbo",
                table: "PostPhoto",
                column: "WaartaPostID");

            migrationBuilder.CreateIndex(
                name: "IX_WaartaPost_ModifierID",
                schema: "dbo",
                table: "WaartaPost",
                column: "ModifierID");

            migrationBuilder.CreateIndex(
                name: "IX_WaartaPost_OwnerID",
                schema: "dbo",
                table: "WaartaPost",
                column: "OwnerID");

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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PostPhoto_WaartaPost_WaartaPostID",
                schema: "dbo",
                table: "PostPhoto");

            migrationBuilder.DropTable(
                name: "WaartaPost",
                schema: "dbo");

            migrationBuilder.DropIndex(
                name: "IX_PostPhoto_WaartaPostID",
                schema: "dbo",
                table: "PostPhoto");

            migrationBuilder.DropColumn(
                name: "WaartaPostID",
                schema: "dbo",
                table: "PostPhoto");

            migrationBuilder.AddColumn<int>(
                name: "PostID",
                schema: "dbo",
                table: "PostPhoto",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Post",
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
                    table.PrimaryKey("PK_Post", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Post_Member_ModifierID",
                        column: x => x.ModifierID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Post_Member_OwnerID",
                        column: x => x.OwnerID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PostPhoto_PostID",
                schema: "dbo",
                table: "PostPhoto",
                column: "PostID");

            migrationBuilder.CreateIndex(
                name: "IX_Post_ModifierID",
                schema: "dbo",
                table: "Post",
                column: "ModifierID");

            migrationBuilder.CreateIndex(
                name: "IX_Post_OwnerID",
                schema: "dbo",
                table: "Post",
                column: "OwnerID");

            migrationBuilder.AddForeignKey(
                name: "FK_PostPhoto_Post_PostID",
                schema: "dbo",
                table: "PostPhoto",
                column: "PostID",
                principalSchema: "dbo",
                principalTable: "Post",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
