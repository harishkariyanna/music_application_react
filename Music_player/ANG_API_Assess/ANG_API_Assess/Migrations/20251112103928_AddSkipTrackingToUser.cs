using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ANG_API_Assess.Migrations
{
    /// <inheritdoc />
    public partial class AddSkipTrackingToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastSkipDate",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SkipsToday",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 1,
                columns: new[] { "LastSkipDate", "SkipsToday" },
                values: new object[] { null, 0 });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 2,
                columns: new[] { "LastSkipDate", "SkipsToday" },
                values: new object[] { null, 0 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastSkipDate",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SkipsToday",
                table: "Users");
        }
    }
}
