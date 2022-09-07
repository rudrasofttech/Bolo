using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class PushNotificationWebAppTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PushNotificationWebApp",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: true),
                    Endpoint = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    P256dh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Auth = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PushNotificationWebApp", x => x.ID);
                    table.ForeignKey(
                        name: "FK_PushNotificationWebApp_Member_UserID",
                        column: x => x.UserID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PushNotificationWebApp_UserID",
                schema: "dbo",
                table: "PushNotificationWebApp",
                column: "UserID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PushNotificationWebApp",
                schema: "dbo");
        }
    }
}
