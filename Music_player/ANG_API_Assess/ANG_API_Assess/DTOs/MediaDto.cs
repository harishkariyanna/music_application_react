using System.ComponentModel.DataAnnotations;
using StreamingAPI.Models.Enums;

namespace ANG_API_Assess.DTOs
{
    public class MediaDto
    {
        [Required(ErrorMessage = "Title is required")]
        [StringLength(200, MinimumLength = 1, ErrorMessage = "Title must be between 1 and 200 characters")]
        public string? Title { get; set; }

        [Required(ErrorMessage = "Media type is required")]
        public MediaType MediaType { get; set; }

        [StringLength(500, ErrorMessage = "URL cannot exceed 500 characters")]
        public string? Url { get; set; }

        [Range(1, 1440, ErrorMessage = "Duration must be between 1 and 1440 minutes")]
        public int DurationInMinutes { get; set; }

        public Genre? Genre { get; set; }

        [Required(ErrorMessage = "Release date is required")]
        public DateTime ReleaseDate { get; set; }
    }
}
