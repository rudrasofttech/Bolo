using Microsoft.EntityFrameworkCore.Migrations;

namespace Bolo.Migrations
{
    public partial class renametablepost : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
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
                newName: "MemberPost",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "PostPhotos",
                schema: "dbo",
                newName: "PostPhoto",
                newSchema: "dbo");

            migrationBuilder.RenameIndex(
                name: "IX_Posts_OwnerID",
                schema: "dbo",
                table: "MemberPost",
                newName: "IX_MemberPost_OwnerID");

            migrationBuilder.RenameIndex(
                name: "IX_Posts_ModifierID",
                schema: "dbo",
                table: "MemberPost",
                newName: "IX_MemberPost_ModifierID");

            migrationBuilder.RenameIndex(
                name: "IX_PostPhotos_MemberPostID",
                schema: "dbo",
                table: "PostPhoto",
                newName: "IX_PostPhoto_MemberPostID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MemberPost",
                schema: "dbo",
                table: "MemberPost",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PostPhoto",
                schema: "dbo",
                table: "PostPhoto",
                column: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_MemberComment_MemberPost_PostID",
                schema: "dbo",
                table: "MemberComment",
                column: "PostID",
                principalSchema: "dbo",
                principalTable: "MemberPost",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MemberPost_Member_ModifierID",
                schema: "dbo",
                table: "MemberPost",
                column: "ModifierID",
                principalSchema: "dbo",
                principalTable: "Member",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MemberPost_Member_OwnerID",
                schema: "dbo",
                table: "MemberPost",
                column: "OwnerID",
                principalSchema: "dbo",
                principalTable: "Member",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MemberReaction_MemberPost_PostID",
                schema: "dbo",
                table: "MemberReaction",
                column: "PostID",
                principalSchema: "dbo",
                principalTable: "MemberPost",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PostPhoto_MemberPost_MemberPostID",
                schema: "dbo",
                table: "PostPhoto",
                column: "MemberPostID",
                principalSchema: "dbo",
                principalTable: "MemberPost",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MemberComment_MemberPost_PostID",
                schema: "dbo",
                table: "MemberComment");

            migrationBuilder.DropForeignKey(
                name: "FK_MemberPost_Member_ModifierID",
                schema: "dbo",
                table: "MemberPost");

            migrationBuilder.DropForeignKey(
                name: "FK_MemberPost_Member_OwnerID",
                schema: "dbo",
                table: "MemberPost");

            migrationBuilder.DropForeignKey(
                name: "FK_MemberReaction_MemberPost_PostID",
                schema: "dbo",
                table: "MemberReaction");

            migrationBuilder.DropForeignKey(
                name: "FK_PostPhoto_MemberPost_MemberPostID",
                schema: "dbo",
                table: "PostPhoto");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PostPhoto",
                schema: "dbo",
                table: "PostPhoto");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MemberPost",
                schema: "dbo",
                table: "MemberPost");

            migrationBuilder.RenameTable(
                name: "PostPhoto",
                schema: "dbo",
                newName: "PostPhotos",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "MemberPost",
                schema: "dbo",
                newName: "Posts",
                newSchema: "dbo");

            migrationBuilder.RenameIndex(
                name: "IX_PostPhoto_MemberPostID",
                schema: "dbo",
                table: "PostPhotos",
                newName: "IX_PostPhotos_MemberPostID");

            migrationBuilder.RenameIndex(
                name: "IX_MemberPost_OwnerID",
                schema: "dbo",
                table: "Posts",
                newName: "IX_Posts_OwnerID");

            migrationBuilder.RenameIndex(
                name: "IX_MemberPost_ModifierID",
                schema: "dbo",
                table: "Posts",
                newName: "IX_Posts_ModifierID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PostPhotos",
                schema: "dbo",
                table: "PostPhotos",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Posts",
                schema: "dbo",
                table: "Posts",
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
    }
}
