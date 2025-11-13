using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using StreamingAPI.Models.Enums;

namespace StreamingAPI.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }

        [Required(ErrorMessage = "Username is required")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 50 characters")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [StringLength(255, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters")]
        public string PasswordHash { get; set; }

        [Required]
        public string PasswordSalt { get; set; }

        [Required(ErrorMessage = "Role is required")]
        public UserRole Role { get; set; }

        public int? SubscriptionPlanId { get; set; } = 1;

        [ForeignKey(nameof(SubscriptionPlanId))]
        public SubscriptionPlan SubscriptionPlan { get; set; }

        [JsonIgnore]
        public ICollection<Playlist> Playlists { get; set; }

        public ICollection<Media> UploadedMedia { get; set; }

        public int SkipsToday { get; set; } = 0;
        public DateTime? LastSkipDate { get; set; }

    }
}
