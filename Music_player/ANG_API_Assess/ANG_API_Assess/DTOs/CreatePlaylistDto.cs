using StreamingAPI.Models;
using System.ComponentModel.DataAnnotations;

namespace ANG_API_Assess.DTOs
{
    public class CreatePlaylistDto
    {
        public int PlaylistId { get; set; }
        public string Name { get; set; }
        public int? UserId { get; set; }
        public int MediaId { get; set; }
    }
}
