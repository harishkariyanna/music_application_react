using ANG_API_Assess.DTOs;
using ANG_API_Assess.Interface;
using ANG_API_Assess.Services;
using Microsoft.AspNetCore.Mvc;

namespace ANG_API_Assess.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PasswordController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly IOtpService _otpService;
        private readonly EmailService _emailService;
        private readonly ILogger<PasswordController> _logger;

        public PasswordController(
            UserService userService, 
            IOtpService otpService, 
            EmailService emailService,
            ILogger<PasswordController> logger)
        {
            _userService = userService;
            _otpService = otpService;
            _emailService = emailService;
            _logger = logger;
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            try
            {
                _logger.LogInformation($"Forgot password request received for email: {dto.Email}");

                var users = await _userService.GetAllUsersAsync();
                var user = users.FirstOrDefault(u => u.Email == dto.Email);

                if (user == null)
                {
                    _logger.LogWarning($"User not found with email: {dto.Email}");
                    return NotFound("User not found");
                }

                var otp = _otpService.GenerateOtp();
                _otpService.StoreOtp(dto.Email, otp);

                await _emailService.SendOtpEmailAsync(dto.Email, otp);

                _logger.LogInformation($"OTP sent successfully to: {dto.Email}");
                return Ok(new { message = "OTP sent to your email" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in forgot password: {ex.Message}");
                return StatusCode(500, "Failed to send OTP");
            }
        }

        [HttpPost("verify-otp")]
        public IActionResult VerifyOtp([FromBody] VerifyOtpDto dto)
        {
            _logger.LogInformation($"OTP verification request for email: {dto.Email}");

            if (_otpService.ValidateOtp(dto.Email, dto.Otp))
            {
                _logger.LogInformation($"OTP verified successfully for: {dto.Email}");
                return Ok(new { message = "OTP verified successfully" });
            }

            _logger.LogWarning($"Invalid OTP attempt for email: {dto.Email}");
            return BadRequest("Invalid or expired OTP");
        }
            
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            try
            {
                _logger.LogInformation($"Password reset request for email: {dto.Email}");

                if (!_otpService.ValidateOtp(dto.Email, dto.Otp))
                {
                    _logger.LogWarning($"Invalid OTP for password reset: {dto.Email}");
                    return BadRequest("Invalid or expired OTP");
                }

                var users = await _userService.GetAllUsersAsync();
                var user = users.FirstOrDefault(u => u.Email == dto.Email);

                if (user == null)
                {
                    _logger.LogWarning($"User not found during password reset: {dto.Email}");
                    return NotFound("User not found");
                }

                var (hash, salt) = PasswordHasher.HashPassword(dto.NewPassword);
                user.PasswordHash = hash;
                user.PasswordSalt = salt;
                _logger.LogInformation($"Generated hash length: {hash.Length}, salt length: {salt.Length}");
                
                var updated = await _userService.UpdateUserAsync(user.UserId, user);
                _logger.LogInformation($"Updated user - Hash: {updated?.PasswordHash?.Length}, Salt: {updated?.PasswordSalt?.Length}");

                _otpService.RemoveOtp(dto.Email);

                _logger.LogInformation($"Password reset successfully for: {dto.Email}");
                return Ok(new { message = "Password reset successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in password reset: {ex.Message}");
                return StatusCode(500, "Failed to reset password");
            }
        }
    }
}
