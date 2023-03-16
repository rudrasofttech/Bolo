using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class RemoveSharetable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SharedPost",
                schema: "dbo");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SharedPost",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PostID = table.Column<int>(type: "int", nullable: true),
                    SharedByID = table.Column<int>(type: "int", nullable: true),
                    SharedWithID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SharedPost", x => x.ID);
                    table.ForeignKey(
                        name: "FK_SharedPost_Member_SharedByID",
                        column: x => x.SharedByID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SharedPost_Member_SharedWithID",
                        column: x => x.SharedWithID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SharedPost_MemberPost_PostID",
                        column: x => x.PostID,
                        principalSchema: "dbo",
                        principalTable: "MemberPost",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SharedPost_PostID",
                schema: "dbo",
                table: "SharedPost",
                column: "PostID");

            migrationBuilder.CreateIndex(
                name: "IX_SharedPost_SharedByID",
                schema: "dbo",
                table: "SharedPost",
                column: "SharedByID");

            migrationBuilder.CreateIndex(
                name: "IX_SharedPost_SharedWithID",
                schema: "dbo",
                table: "SharedPost",
                column: "SharedWithID");
        }
    }
}
