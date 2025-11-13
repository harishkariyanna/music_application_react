using ANG_API_Assess.DTOs;
using ANG_API_Assess.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StreamingAPI.Models;
using System.IO;
using System.Runtime.ConstrainedExecution;
using System.Security.Claims;
using System.Threading.Tasks;


namespace StreamingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MediaController : ControllerBase
    {
        private readonly MediaService _mediaService;
        private readonly ILogger<MediaController> _logger;

        public MediaController(MediaService mediaService, ILogger<MediaController> logger)
        {
            _mediaService = mediaService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Fetching all media");
            var media = await _mediaService.GetAllMediaAsync();
            return Ok(media);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Get(int id)
        {
            var m = await _mediaService.GetMediaByIdAsync(id);
            if (m == null) return NotFound();
            return Ok(m);
        }


        [HttpPost("upload")]
        [Authorize]
        public async Task<IActionResult> UploadMedia([FromForm] MediaUploadDto model)
        {
            _logger.LogInformation($"Media upload attempt: {model.Title}");
            if (model.File == null || model.File.Length == 0)
            {
                _logger.LogWarning("Upload failed: No file provided");
                return BadRequest("No file uploaded");
            }

            var mediaFolder = Path.Combine(Directory.GetCurrentDirectory(), "media");
            if (!Directory.Exists(mediaFolder)) Directory.CreateDirectory(mediaFolder);

            var fileName = Path.GetFileName(model.File.FileName);
            var filePath = Path.Combine(mediaFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await model.File.CopyToAsync(stream);
            }

            // extract creator id from token
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int? creatorId = null;
            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int parsed)) creatorId = parsed;

            byte[]? thumbnailData = null;
            if (model.Thumbnail != null && model.Thumbnail.Length > 0)
            {
                using (var ms = new MemoryStream())
                {
                    await model.Thumbnail.CopyToAsync(ms);
                    thumbnailData = ms.ToArray();
                }
            }

            byte[]? composerImageData = null;
            if (model.ComposerImage != null && model.ComposerImage.Length > 0)
            {
                using (var ms = new MemoryStream())
                {
                    await model.ComposerImage.CopyToAsync(ms);
                    composerImageData = ms.ToArray();
                }
            }

            var media = new Media
            {
                Title = model.Title,
                MediaType = model.MediaType,
                Url = $"/media/{fileName}",
                Genre = model.Genre,
                DurationInMinutes = model.DurationInMinutes,
                ReleaseDate = model.ReleaseDate,
                Composer = model.Composer,
                Album = model.Album,
                Description = model.Description,
                Thumbnail = thumbnailData,
                ComposerImage = composerImageData,
                Language = model.Language,
                CreatorId = creatorId
            };

            await _mediaService.AddMediaAsync(media);
            _logger.LogInformation($"Media uploaded successfully: {model.Title} by creator {creatorId}");
            return Ok(media);
        }


        [HttpGet("myuploads")]
        [Authorize]
        public async Task<IActionResult> GetMyUploads()
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                User.FindFirst("nameid")?.Value ??
                User.FindFirst("sub")?.Value ??
                User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized("Invalid token: userId not found");

            var uploads = await _mediaService.GetMediaByCreatorAsync(userId);
            return Ok(uploads);
        }





        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, MediaDto med)
        {
            var cer = new Media
            {
                MediaType = med.MediaType,
                Title = med.Title,
                Url = med.Url,
                DurationInMinutes = med.DurationInMinutes,
                Genre = med.Genre,
                ReleaseDate = med.ReleaseDate
            };

            if (id != cer.MediaId) return BadRequest();
            var updated = await _mediaService.UpdateMediaAsync(id, cer);
            return Ok(updated);
        }

        [HttpGet("{id}/thumbnail")]
        public async Task<IActionResult> GetThumbnail(int id)
        {
            var media = await _mediaService.GetMediaByIdAsync(id);
            if (media?.Thumbnail == null) return NotFound();
            return File(media.Thumbnail, "image/jpeg");
        }

        [HttpGet("composer-image/{composer}")]
        public async Task<IActionResult> GetComposerImage(string composer)
        {
            var media = await _mediaService.GetAllMediaAsync();
            var mediaWithComposer = media.FirstOrDefault(m => m.Composer == composer && m.ComposerImage != null);
            if (mediaWithComposer?.ComposerImage == null) return NotFound();
            return File(mediaWithComposer.ComposerImage, "image/jpeg");
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Creator,Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation($"Delete request for media ID: {id}");
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var media = await _mediaService.GetMediaByIdAsync(id);
            if (media == null)
            {
                _logger.LogWarning($"Media not found: {id}");
                return NotFound();
            }

            if (!User.IsInRole("Admin") && media.CreatorId != userId)
            {
                _logger.LogWarning($"Unauthorized delete attempt by user {userId} for media {id}");
                return Forbid("You can only delete your own uploads");
            }

            var deleted = await _mediaService.DeleteMediaAsync(id);
            if (!deleted) return NotFound();
            _logger.LogInformation($"Media deleted successfully: {id}");
            return NoContent();
        }
    }
}
