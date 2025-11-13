using Microsoft.AspNetCore.Mvc;
using StreamingAPI.Models;
using ANG_API_Assess.Services;
using ANG_API_Assess.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace StreamingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SubscriptionPlansController : ControllerBase
    {
        private readonly SubscriptionPlanService _planService;
        private readonly ILogger<SubscriptionPlansController> _logger;

        public SubscriptionPlansController(SubscriptionPlanService planService, ILogger<SubscriptionPlansController> logger)
        {
            _planService = planService;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Fetching all subscription plans");
            var plans = await _planService.GetAllPlansAsync();
            return Ok(plans);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(int id)
        {
            var plan = await _planService.GetPlanByIdAsync(id);
            if (plan == null) return NotFound();
            return Ok(plan);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Add(SubscriptionPlanDto plan)
        {
            _logger.LogInformation($"Creating subscription plan: {plan.PlanName}");
            var sub = new SubscriptionPlan
            {
                PlanName = plan.PlanName,
                IsDownloadAllowed = plan.IsDownloadAllowed,
                MaxDevices = plan.MaxDevices,
                Price = plan.Price,
                MaxSkipsPerDay = plan.MaxSkipsPerDay,
                CanSeekInSongs = plan.CanSeekInSongs,
                AudioQuality = plan.AudioQuality,
                CanCreatePlaylists = plan.CanCreatePlaylists
            };
            var created = await _planService.AddPlanAsync(sub);
            _logger.LogInformation($"Subscription plan created: {created.SubscriptionPlanId}");
            return CreatedAtAction(nameof(Get), new { id = created.SubscriptionPlanId }, created);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, SubscriptionPlanDto plan)
        {
            _logger.LogInformation($"Updating subscription plan: {id}");
            var sub = new SubscriptionPlan
            {
                PlanName = plan.PlanName,
                IsDownloadAllowed = plan.IsDownloadAllowed,
                MaxDevices = plan.MaxDevices,
                Price = plan.Price,
                MaxSkipsPerDay = plan.MaxSkipsPerDay,
                CanSeekInSongs = plan.CanSeekInSongs,
                AudioQuality = plan.AudioQuality,
                CanCreatePlaylists = plan.CanCreatePlaylists
            };


            if (id != sub.SubscriptionPlanId) return BadRequest();
            var updated = await _planService.UpdatePlanAsync(id, sub);
            _logger.LogInformation($"Subscription plan updated: {id}");
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation($"Deleting subscription plan: {id}");
            var deleted = await _planService.DeletePlanAsync(id);
            if (!deleted)
            {
                _logger.LogWarning($"Subscription plan not found: {id}");
                return NotFound();
            }
            _logger.LogInformation($"Subscription plan deleted: {id}");
            return NoContent();
        }
    }
}
