using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bolo.Migrations
{
    /// <inheritdoc />
    public partial class PhotoWidthHeight : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notification_Member_TargetID",
                schema: "dbo",
                table: "Notification");

            migrationBuilder.AddColumn<int>(
                name: "Height",
                schema: "dbo",
                table: "PostPhoto",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Width",
                schema: "dbo",
                table: "PostPhoto",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "TargetID",
                schema: "dbo",
                table: "Notification",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_Member_TargetID",
                schema: "dbo",
                table: "Notification",
                column: "TargetID",
                principalSchema: "dbo",
                principalTable: "Member",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notification_Member_TargetID",
                schema: "dbo",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "Height",
                schema: "dbo",
                table: "PostPhoto");

            migrationBuilder.DropColumn(
                name: "Width",
                schema: "dbo",
                table: "PostPhoto");

            migrationBuilder.AlterColumn<int>(
                name: "TargetID",
                schema: "dbo",
                table: "Notification",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_Member_TargetID",
                schema: "dbo",
                table: "Notification",
                column: "TargetID",
                principalSchema: "dbo",
                principalTable: "Member",
                principalColumn: "ID");
        }
    }
}
