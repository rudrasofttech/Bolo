using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class namechange : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MemberComment_WaartaPost_PostID",
                schema: "dbo",
                table: "MemberComment");

            migrationBuilder.DropForeignKey(
                name: "FK_MemberReaction_WaartaPost_PostID",
                schema: "dbo",
                table: "MemberReaction");

            migrationBuilder.DropForeignKey(
                name: "FK_PostPhoto_WaartaPost_MemberPostID",
                schema: "dbo",
                table: "PostPhoto");

            migrationBuilder.DropForeignKey(
                name: "FK_WaartaPost_Member_ModifierID",
                schema: "dbo",
                table: "WaartaPost");

            migrationBuilder.DropForeignKey(
                name: "FK_WaartaPost_Member_OwnerID",
                schema: "dbo",
                table: "WaartaPost");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WaartaPost",
                schema: "dbo",
                table: "WaartaPost");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PostPhoto",
                schema: "dbo",
                table: "PostPhoto");

            migrationBuilder.RenameTable(
                name: "WaartaPost",
                schema: "dbo",
                newName: "Posts",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "PostPhoto",
                schema: "dbo",
                newName: "PostPhotos",
                newSchema: "dbo");

            migrationBuilder.RenameIndex(
                name: "IX_WaartaPost_OwnerID",
                schema: "dbo",
                table: "Posts",
                newName: "IX_Posts_OwnerID");

            migrationBuilder.RenameIndex(
                name: "IX_WaartaPost_ModifierID",
                schema: "dbo",
                table: "Posts",
                newName: "IX_Posts_ModifierID");

            migrationBuilder.RenameIndex(
                name: "IX_PostPhoto_MemberPostID",
                schema: "dbo",
                table: "PostPhotos",
                newName: "IX_PostPhotos_MemberPostID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Posts",
                schema: "dbo",
                table: "Posts",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PostPhotos",
                schema: "dbo",
                table: "PostPhotos",
                column: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_MemberComment_Posts_PostID",
                schema: "dbo",
                table: "MemberComment",
                column: "PostID",
                principalSchema: "dbo",
                principalTable: "Posts",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MemberReaction_Posts_PostID",
                schema: "dbo",
                table: "MemberReaction",
                column: "PostID",
                principalSchema: "dbo",
                principalTable: "Posts",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PostPhotos_Posts_MemberPostID",
                schema: "dbo",
                table: "PostPhotos",
                column: "MemberPostID",
                principalSchema: "dbo",
                principalTable: "Posts",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Posts_Member_ModifierID",
                schema: "dbo",
                table: "Posts",
                column: "ModifierID",
                principalSchema: "dbo",
                principalTable: "Member",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Posts_Member_OwnerID",
                schema: "dbo",
                table: "Posts",
                column: "OwnerID",
                principalSchema: "dbo",
                principalTable: "Member",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MemberComment_Posts_PostID",
                schema: "dbo",
                table: "MemberComment");

            migrationBuilder.DropForeignKey(
                name: "FK_MemberReaction_Posts_PostID",
                schema: "dbo",
                table: "MemberReaction");

            migrationBuilder.DropForeignKey(
                name: "FK_PostPhotos_Posts_MemberPostID",
                schema: "dbo",
                table: "PostPhotos");

            migrationBuilder.DropForeignKey(
                name: "FK_Posts_Member_ModifierID",
                schema: "dbo",
                table: "Posts");

            migrationBuilder.DropForeignKey(
                name: "FK_Posts_Member_OwnerID",
                schema: "dbo",
                table: "Posts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Posts",
                schema: "dbo",
                table: "Posts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PostPhotos",
                schema: "dbo",
                table: "PostPhotos");

            migrationBuilder.RenameTable(
                name: "Posts",
                schema: "dbo",
                newName: "WaartaPost",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "PostPhotos",
                schema: "dbo",
                newName: "PostPhoto",
                newSchema: "dbo");

            migrationBuilder.RenameIndex(
                name: "IX_Posts_OwnerID",
                schema: "dbo",
                table: "WaartaPost",
                newName: "IX_WaartaPost_OwnerID");

            migrationBuilder.RenameIndex(
                name: "IX_Posts_ModifierID",
                schema: "dbo",
                table: "WaartaPost",
                newName: "IX_WaartaPost_ModifierID");

            migrationBuilder.RenameIndex(
                name: "IX_PostPhotos_MemberPostID",
                schema: "dbo",
                table: "PostPhoto",
                newName: "IX_PostPhoto_MemberPostID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WaartaPost",
                schema: "dbo",
                table: "WaartaPost",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PostPhoto",
                schema: "dbo",
                table: "PostPhoto",
                column: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_MemberComment_WaartaPost_PostID",
                schema: "dbo",
                table: "MemberComment",
                column: "PostID",
                principalSchema: "dbo",
                principalTable: "WaartaPost",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MemberReaction_WaartaPost_PostID",
                schema: "dbo",
                table: "MemberReaction",
                column: "PostID",
                principalSchema: "dbo",
                principalTable: "WaartaPost",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PostPhoto_WaartaPost_MemberPostID",
                schema: "dbo",
                table: "PostPhoto",
                column: "MemberPostID",
                principalSchema: "dbo",
                principalTable: "WaartaPost",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WaartaPost_Member_ModifierID",
                schema: "dbo",
                table: "WaartaPost",
                column: "ModifierID",
                principalSchema: "dbo",
                principalTable: "Member",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WaartaPost_Member_OwnerID",
                schema: "dbo",
                table: "WaartaPost",
                column: "OwnerID",
                principalSchema: "dbo",
                principalTable: "Member",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
