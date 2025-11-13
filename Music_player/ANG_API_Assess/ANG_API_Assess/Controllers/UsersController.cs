using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using StreamingAPI.Models;
using ANG_API_Assess.Services;
using StreamingAPI.DTOs;
using System.Security.Claims;

namespace StreamingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(UserService userService, ILogger<UsersController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Fetching all users");
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }



        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Get(int id)
        {
            _logger.LogInformation($"Fetching user: {id}");
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                _logger.LogWarning($"User not found: {id}");
                return NotFound();
            }
            return Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> Add(UserDto user)
        {
            _logger.LogInformation($"Creating user: {user.Username}");
            var reg = new User
            {
                UserName = user.Username,
                Email = user.Email,
                PasswordHash = user.PasswordHash,
                Role = user.Role,
                SubscriptionPlanId = 1
            };
            var created = await _userService.AddUserAsync(reg);
            _logger.LogInformation($"User created: {created.UserId}");
            return CreatedAtAction(nameof(Get), new { id = created.UserId }, created);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, UserDto user)
        {
            _logger.LogInformation($"Updating user: {id}");
            var reg = new User
            {
                UserName = user.Username,
                Email = user.Email,
                PasswordHash = user.PasswordHash,
                Role = user.Role,
            };

            if (id != reg.UserId) return BadRequest();
            var updated = await _userService.UpdateUserAsync(id, reg);
            _logger.LogInformation($"User updated: {id}");
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation($"Deleting user: {id}");
            var deleted = await _userService.DeleteUserAsync(id);
            if (!deleted)
            {
                _logger.LogWarning($"User not found: {id}");
                return NotFound();
            }
            _logger.LogInformation($"User deleted: {id}");
            return NoContent();
        }

        [HttpPut("subscription/{planId}")]
        [Authorize]
        public async Task<IActionResult> UpdateSubscription(int planId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid user");
            }

            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            user.SubscriptionPlanId = planId;
            await _userService.UpdateUserAsync(userId, user);

            _logger.LogInformation($"User {userId} subscription updated to plan {planId}");
            return Ok(new { message = "Subscription updated successfully", planId });
        }

        [Authorize]
        [HttpGet("skip-count")]
        public async Task<IActionResult> GetSkipCount()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var skipData = await _userService.GetSkipCountAsync(userId);
            return Ok(skipData);
        }

        [Authorize]
        [HttpPost("increment-skip")]
        public async Task<IActionResult> IncrementSkip()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _userService.IncrementSkipAsync(userId);
            return Ok();
        }
    }
}
