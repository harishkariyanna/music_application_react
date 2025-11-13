using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using StreamingAPI.Models.Enums;

namespace StreamingAPI.Models
{
    public class Media
    {
        [Key]
        public int MediaId { get; set; }

        [Required, StringLength(255)]
        public string Title { get; set; }

        [Required]
        public MediaType MediaType { get; set; }  

        [Required]
        [StringLength(450)]
        public string Url { get; set; } // Path/stream URL

        [Range(1, 1000)]
        public int DurationInMinutes { get; set; }

        public Genre? Genre { get; set; }

        public DateTime ReleaseDate { get; set; }

        [StringLength(100)]
        public string? Composer { get; set; }

        [StringLength(100)]
        public string? Album { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public byte[]? Thumbnail { get; set; }

        public byte[]? ComposerImage { get; set; }

        [StringLength(50)]
        public string? Language { get; set; }

        // NEW: Creator reference
        public int? CreatorId { get; set; }
        [ForeignKey(nameof(CreatorId))]
        [JsonIgnore]
        public User Creator { get; set; }

        [JsonIgnore]
        public ICollection<PlaylistMedia> PlaylistMedias { get; set; }
    }
}
