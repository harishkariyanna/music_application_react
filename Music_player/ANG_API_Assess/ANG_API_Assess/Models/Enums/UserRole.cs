using System.ComponentModel;

namespace StreamingAPI.Models.Enums
{
    public enum UserRole
    {
        [Description("Regular User")]
        User = 1,
        
        [Description("Content Creator")]
        Creator = 2,
        
        [Description("System Administrator")]
        Admin = 3
    }
}