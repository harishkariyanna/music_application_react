using System.ComponentModel.DataAnnotations;

namespace ANG_API_Assess.DTOs
{
    public class PaymentDto
    {
        public int UserId { get; set; }
        public int SubscriptionPlanId { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public string Status { get; set; }
        public string? TransactionId { get; set; }
    }
}