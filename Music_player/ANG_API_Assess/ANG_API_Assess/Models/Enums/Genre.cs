using System.ComponentModel;

namespace StreamingAPI.Models.Enums
{
    public enum Genre
    {
        [Description("Pop Music")]
        Pop = 1,
        
        [Description("Rock Music")]
        Rock = 2,
        
        [Description("Hip Hop")]
        HipHop = 3,
        
        [Description("Electronic Dance Music")]
        Electronic = 4,
        
        [Description("Classical Music")]
        Classical = 5,
        
        [Description("Jazz Music")]
        Jazz = 6,
        
        [Description("Country Music")]
        Country = 7,
        
        [Description("R&B and Soul")]
        RnB = 8,
        
        [Description("Reggae Music")]
        Reggae = 9,
        
        [Description("Folk Music")]
        Folk = 10,
        
        [Description("Alternative Rock")]
        Alternative = 11,
        
        [Description("Indie Music")]
        Indie = 12,
        
        [Description("Other Genre")]
        Other = 99
    }
}