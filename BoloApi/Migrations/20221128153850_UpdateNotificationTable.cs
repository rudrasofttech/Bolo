using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class UpdateNotificationTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                schema: "dbo",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "Pic",
                schema: "dbo",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "Title",
                schema: "dbo",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "URL",
                schema: "dbo",
                table: "Notification");

            migrationBuilder.RenameColumn(
                name: "PostId",
                schema: "dbo",
                table: "Notification",
                newName: "PostID");

            migrationBuilder.AlterColumn<int>(
                name: "PostID",
                schema: "dbo",
                table: "Notification",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "CommentID",
                schema: "dbo",
                table: "Notification",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SourceID",
                schema: "dbo",
                table: "Notification",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Text",
                schema: "dbo",
                table: "Notification",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notification_CommentID",
                schema: "dbo",
                table: "Notification",
                column: "CommentID");

            migrationBuilder.CreateIndex(
                name: "IX_Notification_PostID",
                schema: "dbo",
                table: "Notification",
                column: "PostID");

            migrationBuilder.CreateIndex(
                name: "IX_Notification_SourceID",
                schema: "dbo",
                table: "Notification",
                column: "SourceID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_Member_SourceID",
                schema: "dbo",
                table: "Notification",
                column: "SourceID",
                principalSchema: "dbo",
                principalTable: "Member",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_MemberComment_CommentID",
                schema: "dbo",
                table: "Notification",
                column: "CommentID",
                principalSchema: "dbo",
                principalTable: "MemberComment",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_MemberPost_PostID",
                schema: "dbo",
                table: "Notification",
                column: "PostID",
                principalSchema: "dbo",
                principalTable: "MemberPost",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notification_Member_SourceID",
                schema: "dbo",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Notification_MemberComment_CommentID",
                schema: "dbo",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Notification_MemberPost_PostID",
                schema: "dbo",
                table: "Notification");

            migrationBuilder.DropIndex(
                name: "IX_Notification_CommentID",
                schema: "dbo",
                table: "Notification");

            migrationBuilder.DropIndex(
                name: "IX_Notification_PostID",
                schema: "dbo",
                table: "Notification");

            migrationBuilder.DropIndex(
                name: "IX_Notification_SourceID",
                schema: "dbo",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "CommentID",
                schema: "dbo",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "SourceID",
                schema: "dbo",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "Text",
                schema: "dbo",
                table: "Notification");

            migrationBuilder.RenameColumn(
                name: "PostID",
                schema: "dbo",
                table: "Notification",
                newName: "PostId");

            migrationBuilder.AlterColumn<int>(
                name: "PostId",
                schema: "dbo",
                table: "Notification",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                schema: "dbo",
                table: "Notification",
                type: "nvarchar(400)",
                maxLength: 400,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Pic",
                schema: "dbo",
                table: "Notification",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                schema: "dbo",
                table: "Notification",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "URL",
                schema: "dbo",
                table: "Notification",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);
        }
    }
}
