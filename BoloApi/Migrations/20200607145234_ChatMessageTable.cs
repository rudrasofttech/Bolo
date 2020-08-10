using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class ChatMessageTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ChatMessage",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SentByID = table.Column<int>(nullable: true),
                    SentToID = table.Column<int>(nullable: true),
                    SentDate = table.Column<DateTime>(nullable: false),
                    Message = table.Column<string>(nullable: true),
                    MessageType = table.Column<int>(nullable: false),
                    SentStatus = table.Column<int>(nullable: false),
                    PublicID = table.Column<Guid>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatMessage", x => x.ID);
                    table.ForeignKey(
                        name: "FK_ChatMessage_Member_SentByID",
                        column: x => x.SentByID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ChatMessage_Member_SentToID",
                        column: x => x.SentToID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessage_SentByID",
                schema: "dbo",
                table: "ChatMessage",
                column: "SentByID");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessage_SentToID",
                schema: "dbo",
                table: "ChatMessage",
                column: "SentToID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChatMessage",
                schema: "dbo");
        }
    }
}
