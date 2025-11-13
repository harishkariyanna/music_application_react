using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ANG_API_Assess.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AudioQuality",
                table: "SubscriptionPlans",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "CanCreatePlaylists",
                table: "SubscriptionPlans",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CanSeekInSongs",
                table: "SubscriptionPlans",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaxSkipsPerDay",
                table: "SubscriptionPlans",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "SubscriptionPlans",
                keyColumn: "SubscriptionPlanId",
                keyValue: 1,
                columns: new[] { "AudioQuality", "CanCreatePlaylists", "CanSeekInSongs", "MaxSkipsPerDay" },
                values: new object[] { "128kbps", false, false, 3 });

            migrationBuilder.UpdateData(
                table: "SubscriptionPlans",
                keyColumn: "SubscriptionPlanId",
                keyValue: 2,
                columns: new[] { "AudioQuality", "CanCreatePlaylists", "CanSeekInSongs", "MaxSkipsPerDay" },
                values: new object[] { "320kbps", true, true, 999999 });

            migrationBuilder.UpdateData(
                table: "SubscriptionPlans",
                keyColumn: "SubscriptionPlanId",
                keyValue: 3,
                columns: new[] { "AudioQuality", "CanCreatePlaylists", "CanSeekInSongs", "MaxSkipsPerDay" },
                values: new object[] { "FLAC", true, true, 999999 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AudioQuality",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "CanCreatePlaylists",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "CanSeekInSongs",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "MaxSkipsPerDay",
                table: "SubscriptionPlans");
        }
    }
}
