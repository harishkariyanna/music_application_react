using System.ComponentModel;

namespace StreamingAPI.Models.Enums
{
    public enum PlaylistType
    {
        [Description("User Created Playlist")]
        Custom = 1,
        
        [Description("Liked Music")]
        LikedMusic = 2,
        
        [Description("Recently Played")]
        RecentlyPlayed = 3
    }
}