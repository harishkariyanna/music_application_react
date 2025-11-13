using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StreamingAPI.Models
{
    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }

        [Required]
        public int UserId { get; set; }
        
        [ForeignKey(nameof(UserId))]
        public User User { get; set; }

        [Required]
        public int SubscriptionPlanId { get; set; }
        
        [ForeignKey(nameof(SubscriptionPlanId))]
        public SubscriptionPlan SubscriptionPlan { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public DateTime PaymentDate { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } // Success, Failed, Pending

        [StringLength(100)]
        public string? TransactionId { get; set; }
    }
}