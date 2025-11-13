using System.ComponentModel.DataAnnotations;
using StreamingAPI.Models.Enums;

namespace ANG_API_Assess.DTOs
{
    public class SubscriptionPlanDto
    {
        public SubscriptionPlanType PlanName { get; set; } 

        public decimal Price { get; set; }

        public int MaxDevices { get; set; }

        public bool IsDownloadAllowed { get; set; }

        public int MaxSkipsPerDay { get; set; }
        public bool CanSeekInSongs { get; set; }
        public string AudioQuality { get; set; }
        public bool CanCreatePlaylists { get; set; }
    }
}
