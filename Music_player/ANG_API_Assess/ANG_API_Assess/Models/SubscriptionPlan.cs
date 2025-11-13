using System.ComponentModel.DataAnnotations;
using StreamingAPI.Models.Enums;

namespace StreamingAPI.Models
{
    public class SubscriptionPlan
    {
        [Key]
        public int SubscriptionPlanId { get; set; }

        [Required]
        public SubscriptionPlanType PlanName { get; set; }

        [Required]
        public decimal Price { get; set; }

        [Required]
        public int MaxDevices { get; set; }

        [Required]
        public bool IsDownloadAllowed { get; set; }

        public int MaxSkipsPerDay { get; set; }
        public bool CanSeekInSongs { get; set; }
        public string AudioQuality { get; set; }
        public bool CanCreatePlaylists { get; set; }

        public ICollection<User> Users { get; set; }
    }
}
