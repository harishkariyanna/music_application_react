using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ANG_API_Assess.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAdminCredentials : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 1,
                columns: new[] { "Email", "PasswordHash", "PasswordSalt" },
                values: new object[] { "thankyouforcontactingharish@gmail.com", "KqZ8vX2Np5Yt7Wm3Lq6Ks9Rn1Jq4Hp0Vm8Ls2Xt5Yz7Wm=", "Np7Yt2Wz5Vm8Ks1Hp6Jq9Rn3Kp0Xt5Yz8Wm2Lq7Np4Ks6=" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 2,
                columns: new[] { "PasswordHash", "PasswordSalt" },
                values: new object[] { "Xp2Yz7Wm3Lq6Ks5Np8Rn1Jq4Yt0Vm9Ls2Hp7Kp3Xt6Wz5=", "Lq4Np7Yt2Wz5Vm8Ks1Hp6Jq9Rn3Kp0Xt5Yz8Wm2Lq7Np4=" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 1,
                columns: new[] { "Email", "PasswordHash", "PasswordSalt" },
                values: new object[] { "admin@stream.com", "hashedpass1", "salt1" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 2,
                columns: new[] { "PasswordHash", "PasswordSalt" },
                values: new object[] { "hashedpass2", "salt2" });
        }
    }
}
