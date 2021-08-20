using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class removewebpagetable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WebPage",
                schema: "dbo");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WebPage",
                schema: "dbo",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Domain = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    EntryDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExtLinks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HTML = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IntLinks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastCrawled = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastPageRankCalc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MetaDescription = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    PageData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PageRank = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    StatusCode = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    URL = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WebPage", x => x.ID);
                });
        }
    }
}
