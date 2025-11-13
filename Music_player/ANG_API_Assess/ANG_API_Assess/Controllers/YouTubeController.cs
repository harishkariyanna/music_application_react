using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using StreamingAPI.Data;
using Microsoft.EntityFrameworkCore;
using StreamingAPI.Models.Enums;

namespace ANG_API_Assess.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class YouTubeController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string _youtubeApiKey;
        private readonly ILogger<YouTubeController> _logger;
        private readonly context _context;

        public YouTubeController(HttpClient httpClient, IConfiguration configuration, ILogger<YouTubeController> logger, context context)
        {
            _httpClient = httpClient;
            _youtubeApiKey = configuration["YouTube:ApiKey"]
                ?? throw new Exception("YouTube API Key is missing in appsettings.json");
            _logger = logger;
            _context = context;
        }

        [HttpGet("search")]
        [Authorize]
        public async Task<IActionResult> SearchMusic([FromQuery] string query)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized("Invalid user token.");
                }

                var user = await _context.Users
                    .Include(u => u.SubscriptionPlan)
                    .FirstOrDefaultAsync(u => u.UserId == userId);

                if (user == null)
                {
                    return NotFound("User not found.");
                }

                if (user.SubscriptionPlan?.PlanName == SubscriptionPlanType.Free)
                {
                    return StatusCode(403, new { message = "YouTube search is only available for premium users. Please upgrade your subscription." });
                }

                if (string.IsNullOrWhiteSpace(query))
                {
                    _logger.LogWarning("YouTube search attempted with empty query");
                    return BadRequest("Query parameter is required.");
                }

                _logger.LogInformation($"YouTube search request: {query}");
                var url = $"https://www.googleapis.com/youtube/v3/search?" +
                          $"part=snippet&type=video&videoCategoryId=10&" +
                          $"q={Uri.EscapeDataString(query)}&" +
                          $"maxResults=20&key={_youtubeApiKey}";

                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"YouTube API request failed with status: {response.StatusCode}");
                    return StatusCode((int)response.StatusCode, "YouTube API request failed.");
                }

                var content = await response.Content.ReadAsStringAsync();
                var json = JsonDocument.Parse(content);
                _logger.LogInformation($"YouTube search completed successfully for: {query}");
                _logger.LogInformation($"YouTube API Response: {content.Substring(0, Math.Min(500, content.Length))}");

                return Ok(json.RootElement);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error searching YouTube: {ex.Message}");
                return StatusCode(500, $"Error searching YouTube: {ex.Message}");
            }
        }

        [HttpGet("test")]
        public IActionResult TestApi()
        {
            var sampleResponse = new
            {
                message = "YouTube API is working",
                sampleVideo = new
                {
                    videoId = "dQw4w9WgXcQ",
                    title = "Sample Video",
                    channel = "Sample Channel",
                    thumbnailUrl = "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
                    embedUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ"
                },
                note = "If you can see this, the backend API is working. Network may be blocking YouTube domains."
            };
            return Ok(sampleResponse);
        }

        [HttpGet("thumbnail/{videoId}")]
        public async Task<IActionResult> GetThumbnail(string videoId)
        {
            try
            {
                _logger.LogInformation($"Fetching thumbnail for video: {videoId}");
                var thumbnailUrl = $"https://i.ytimg.com/vi/{videoId}/mqdefault.jpg";
                var imageBytes = await _httpClient.GetByteArrayAsync(thumbnailUrl);
                _logger.LogInformation($"Thumbnail fetched successfully for: {videoId}");
                return File(imageBytes, "image/jpeg");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to fetch thumbnail for {videoId}: {ex.Message}");
                // Return a 1x1 transparent pixel as fallback
                var transparentPixel = Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
                return File(transparentPixel, "image/png");
            }
        }
    }
}
