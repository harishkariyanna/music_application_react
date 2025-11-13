using System.ComponentModel;

namespace StreamingAPI.Models.Enums
{
    public enum SubscriptionPlanType
    {
        [Description("Free Plan")]
        Free = 1,
        
        [Description("Premium Individual")]
        Premium = 2,
        
        [Description("Family Plan")]
        Family = 3,
        
        [Description("Student Plan")]
        Student = 4
    }
}