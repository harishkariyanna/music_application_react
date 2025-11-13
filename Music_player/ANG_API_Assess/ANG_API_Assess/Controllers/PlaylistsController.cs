using ANG_API_Assess.DTOs;
using ANG_API_Assess.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StreamingAPI.Models;
using StreamingAPI.Models.Enums;
using System.Security.Claims;

namespace StreamingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PlaylistsController : ControllerBase
    {
        private readonly PlaylistService _playlistService;
        private readonly ILogger<PlaylistsController> _logger;

        public PlaylistsController(PlaylistService playlistService, ILogger<PlaylistsController> logger)
        {
            _playlistService = playlistService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Fetching all playlists");
            var playlists = await _playlistService.GetAllPlaylistsAsync();
            return Ok(playlists);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var playlist = await _playlistService.GetPlaylistByIdAsync(id);
            if (playlist == null) return NotFound();
            return Ok(playlist);
        }

        [HttpPost]
        //[Authorize(Roles = "Creator")]
        public async Task<IActionResult> Add(PlaylistDto play)
        {
            _logger.LogInformation($"Creating playlist: {play.Name} for user: {play.UserId}");
            var obj = new Playlist
            {
                Name = play.Name,
                UserId = play.UserId,
                PlaylistMedias = play.MediaIds.Select(mid => new PlaylistMedia
                {
                    MediaId = mid
                }).ToList()
            };
                
            var created = await _playlistService.AddPlaylistAsync(obj);

            // Return full playlist with medias
            var fullPlaylist = await _playlistService.GetPlaylistByIdAsync(created.PlaylistId);
            _logger.LogInformation($"Playlist created successfully: {created.PlaylistId}");

            return CreatedAtAction(nameof(Get), new { id = created.PlaylistId }, fullPlaylist);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreatePlaylist([FromBody] PlaylistDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var playlist = new Playlist
            {
                Name = dto.Name,
                UserId = userId,
                PlaylistType = PlaylistType.Custom,
                IsDefault = false,
                PlaylistMedias = dto.MediaIds.Select(mid => new PlaylistMedia { MediaId = mid }).ToList()
            };

            await _playlistService.AddPlaylistAsync(playlist);
            return Ok(playlist);
        }

        [HttpPost("like/{mediaId}")]
        public async Task<IActionResult> LikeMedia(int mediaId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            _logger.LogInformation($"User {userId} liking media: {mediaId}");
            await _playlistService.AddToLikedMusicAsync(userId, mediaId);
            return Ok();
        }

        [HttpDelete("unlike/{mediaId}")]
        public async Task<IActionResult> UnlikeMedia(int mediaId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            _logger.LogInformation($"User {userId} unliking media: {mediaId}");
            await _playlistService.RemoveFromLikedMusicAsync(userId, mediaId);
            return Ok();
        }



        [HttpGet("my-playlists")]
        public async Task<IActionResult> GetMyPlaylists()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var playlists = await _playlistService.Getuploads(userId);
            return Ok(playlists);
        }

        [HttpGet("liked-music")]
        public async Task<IActionResult> GetLikedMusic()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var likedMusic = await _playlistService.GetLikedMusicAsync(userId);
            return Ok(likedMusic);
        }

        [HttpPost("{playlistId}/add-media/{mediaId}")]
        public async Task<IActionResult> AddMediaToPlaylist(int playlistId, int mediaId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            await _playlistService.AddMediaToPlaylistAsync(playlistId, mediaId);
            return Ok();
        }

        [HttpPut("{playlistId}/reorder")]
        public async Task<IActionResult> ReorderPlaylist(int playlistId, [FromBody] List<int> mediaIds)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            await _playlistService.ReorderPlaylistAsync(playlistId, mediaIds);
            return Ok();
        }



        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, PlaylistDto play)
        {
            var obj = new Playlist
            {
                Name = play.Name,
                UserId = play.UserId
            };

            if (id != obj.PlaylistId) return BadRequest();
            var updated = await _playlistService.UpdatePlaylistAsync(id, obj);
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation($"Deleting playlist: {id}");
            var deleted = await _playlistService.DeletePlaylistAsync(id);
            if (!deleted)
            {
                _logger.LogWarning($"Playlist not found: {id}");
                return NotFound();
            }
            _logger.LogInformation($"Playlist deleted successfully: {id}");
            return NoContent();
        }
    }
}
