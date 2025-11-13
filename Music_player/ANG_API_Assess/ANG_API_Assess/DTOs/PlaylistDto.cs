namespace ANG_API_Assess.DTOs
{
    public class PlaylistDto
    {
        public string Name { get; set; }

        public int? UserId { get; set; }

        public List<int> MediaIds { get; set; } = new();

    }



}
