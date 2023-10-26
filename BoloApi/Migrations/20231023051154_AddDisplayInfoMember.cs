using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class AddDisplayInfoMember : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DisplayAddress",
                schema: "dbo",
                table: "Member",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplayEmail1",
                schema: "dbo",
                table: "Member",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplayEmail2",
                schema: "dbo",
                table: "Member",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplayPhone1",
                schema: "dbo",
                table: "Member",
                type: "nvarchar(15)",
                maxLength: 15,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplayPhone2",
                schema: "dbo",
                table: "Member",
                type: "nvarchar(15)",
                maxLength: 15,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Link",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    URL = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    MemberID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Link", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Link_Member_MemberID",
                        column: x => x.MemberID,
                        principalSchema: "dbo",
                        principalTable: "Member",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Link_MemberID",
                schema: "dbo",
                table: "Link",
                column: "MemberID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Link",
                schema: "dbo");

            migrationBuilder.DropColumn(
                name: "DisplayAddress",
                schema: "dbo",
                table: "Member");

            migrationBuilder.DropColumn(
                name: "DisplayEmail1",
                schema: "dbo",
                table: "Member");

            migrationBuilder.DropColumn(
                name: "DisplayEmail2",
                schema: "dbo",
                table: "Member");

            migrationBuilder.DropColumn(
                name: "DisplayPhone1",
                schema: "dbo",
                table: "Member");

            migrationBuilder.DropColumn(
                name: "DisplayPhone2",
                schema: "dbo",
                table: "Member");
        }
    }
}
