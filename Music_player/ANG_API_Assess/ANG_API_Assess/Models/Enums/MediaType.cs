using System.ComponentModel;

namespace StreamingAPI.Models.Enums
{
    public enum MediaType
    {
        [Description("Audio Music")]
        Music = 1,
        
        [Description("Video Content")]
        Video = 2,
        
        [Description("Podcast Episode")]
        Podcast = 3,
        
        [Description("Audio Book")]
        AudioBook = 4
    }
}