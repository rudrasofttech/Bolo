using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class waartaposts : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Post",
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
                    Qoute = table.Column<string>(maxLength: 350, nullable: true),
                    QouteDecor = table.Column<string>(nullable: true)
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

            migrationBuilder.CreateTable(
                name: "PostPhoto",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Photo = table.Column<string>(nullable: true),
                    PostID = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostPhoto", x => x.ID);
                    table.ForeignKey(
                        name: "FK_PostPhoto_Post_PostID",
                        column: x => x.PostID,
                        principalSchema: "dbo",
                        principalTable: "Post",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

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

            migrationBuilder.CreateIndex(
                name: "IX_PostPhoto_PostID",
                schema: "dbo",
                table: "PostPhoto",
                column: "PostID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PostPhoto",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Post",
                schema: "dbo");
        }
    }
}
