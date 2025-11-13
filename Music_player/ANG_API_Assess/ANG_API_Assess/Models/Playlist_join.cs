using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using StreamingAPI.Models.Enums;

namespace StreamingAPI.Models
{
    public class Playlist
    {
        [Key]
        public int PlaylistId { get; set; }

        [Required, StringLength(50)]
        public string Name { get; set; }

        [Required]
        public PlaylistType PlaylistType { get; set; }

        public bool IsDefault { get; set; }

        public int? UserId { get; set; }
        public User User { get; set; } 


        public ICollection<PlaylistMedia>? PlaylistMedias { get; set; }
    }

    // Join table for Many-to-Many: Playlist <-> Media
    public class PlaylistMedia
    {
        public int PlaylistId { get; set; }
        [JsonIgnore]
        public Playlist Playlist { get; set; }

        public int MediaId { get; set; }
        public Media Media { get; set; }
    }
}
