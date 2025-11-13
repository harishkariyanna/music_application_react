using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ANG_API_Assess.Migrations
{
    /// <inheritdoc />
    public partial class AddMediaThumbnail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "Thumbnail",
                table: "Media",
                type: "varbinary(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Composers",
                columns: table => new
                {
                    ComposerId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Image = table.Column<byte[]>(type: "varbinary(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Composers", x => x.ComposerId);
                });

            migrationBuilder.UpdateData(
                table: "Media",
                keyColumn: "MediaId",
                keyValue: 1,
                column: "Thumbnail",
                value: null);

            migrationBuilder.UpdateData(
                table: "Media",
                keyColumn: "MediaId",
                keyValue: 2,
                column: "Thumbnail",
                value: null);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Composers");

            migrationBuilder.DropColumn(
                name: "Thumbnail",
                table: "Media");
        }
    }
}
