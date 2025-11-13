using Microsoft.AspNetCore.Mvc;
using StreamingAPI.DTOs;
using StreamingAPI.Interface;
using StreamingAPI.Models;
using ANG_API_Assess.Services;

namespace StreamingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly IToken _tokenService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(UserService userService, IToken tokenService, ILogger<AuthController> logger)
        {
            _userService = userService;
            _tokenService = tokenService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserDto dto)
        {
            _logger.LogInformation($"Registration attempt for username: {dto.Username}");
            
            var users = await _userService.GetAllUsersAsync();
            if (users.Any(u => u.Email == dto.Email))
            {
                _logger.LogWarning($"Registration failed: Email already exists - {dto.Email}");
                return BadRequest("Email already registered. Please login.");
            }
            
            if (users.Any(u => u.UserName == dto.Username))
            {
                _logger.LogWarning($"Registration failed: Username already exists - {dto.Username}");
                return BadRequest("Username already taken.");
            }
            
            var (hash, salt) = PasswordHasher.HashPassword(dto.PasswordHash);
            
            var user = new User
            {
                UserName = dto.Username,
                Email = dto.Email,
                PasswordHash = hash,
                PasswordSalt = salt,
                Role = dto.Role,
                SubscriptionPlanId = 1
            };

            var created = await _userService.AddUserAsync(user);
            _logger.LogInformation($"User registered successfully: {dto.Username}");
            return Ok(created);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            _logger.LogInformation($"Login attempt for: {dto.Username}");
            var users = await _userService.GetAllUsersAsync();
            var user = users.FirstOrDefault(u => u.UserName == dto.Username || u.Email == dto.Username);
            
            if (user == null)
            {
                _logger.LogWarning($"User not found: {dto.Username}");
                return Unauthorized("Invalid credentials");
            }
            
            _logger.LogInformation($"User found. Hash length: {user.PasswordHash?.Length}, Salt length: {user.PasswordSalt?.Length}");
            
            if (!PasswordHasher.VerifyPassword(dto.Password, user.PasswordHash, user.PasswordSalt))
            {
                _logger.LogWarning($"Password verification failed for username: {dto.Username}");
                return Unauthorized("Invalid credentials");
            }

            var token = _tokenService.GenerateToken(user);
            _logger.LogInformation($"User logged in successfully: {dto.Username}");
            return Ok(new { token });
        }
    }
}
