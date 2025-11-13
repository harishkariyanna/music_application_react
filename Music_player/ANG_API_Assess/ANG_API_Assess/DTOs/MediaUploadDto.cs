using System.ComponentModel.DataAnnotations;
using StreamingAPI.Models.Enums;

namespace ANG_API_Assess.DTOs
{
    public class MediaUploadDto
    {
        [Required(ErrorMessage = "File is required")]
        public IFormFile File { get; set; }
        
        [Required(ErrorMessage = "Title is required")]
        [StringLength(200, MinimumLength = 1, ErrorMessage = "Title must be between 1 and 200 characters")]
        public string Title { get; set; }
        
        [Required(ErrorMessage = "Media type is required")]
        public MediaType MediaType { get; set; }
        
        public Genre? Genre { get; set; }
        
        [Range(1, 1440, ErrorMessage = "Duration must be between 1 and 1440 minutes")]
        public int DurationInMinutes { get; set; }
        
        [Required(ErrorMessage = "Release date is required")]
        public DateTime ReleaseDate { get; set; }
        
        [StringLength(100, ErrorMessage = "Composer name cannot exceed 100 characters")]
        public string? Composer { get; set; }
        
        [StringLength(100, ErrorMessage = "Album name cannot exceed 100 characters")]
        public string? Album { get; set; }
        
        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string? Description { get; set; }
        
        public IFormFile? Thumbnail { get; set; }

        public IFormFile? ComposerImage { get; set; }

        [StringLength(50, ErrorMessage = "Language cannot exceed 50 characters")]
        public string? Language { get; set; }
    }
}
