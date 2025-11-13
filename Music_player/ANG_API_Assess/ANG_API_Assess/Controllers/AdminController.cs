using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ANG_API_Assess.Services;
using StreamingAPI.Models;

namespace ANG_API_Assess.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AdminService _adminService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(AdminService adminService, ILogger<AdminController> logger)
        {
            _adminService = adminService;
            _logger = logger;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            _logger.LogInformation("Admin fetching all users");
            var users = await _adminService.GetAllUsersWithDetailsAsync();
            return Ok(users);
        }



        [HttpGet("subscriptions")]
        public async Task<IActionResult> GetAllSubscriptions()
        {
            _logger.LogInformation("Admin fetching all subscriptions");
            var subscriptions = await _adminService.GetAllSubscriptionsWithDetailsAsync();
            return Ok(subscriptions);
        }
    }
}