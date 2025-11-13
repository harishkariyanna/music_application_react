using ANG_API_Assess.Interface;

using Microsoft.EntityFrameworkCore;
using StreamingAPI.Data;

namespace ANG_API_Assess.Repositories
{
    public class AdminRepository : IAdmin
    {
        private readonly context _context;

        public AdminRepository(context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<object>> GetAllUsersWithDetailsAsync()
        {
            return await _context.Users
                .Include(u => u.SubscriptionPlan)
                .Select(u => new
                {
                    id = u.UserId,
                    username = u.UserName,
                    email = u.Email,
                    role = u.Role.ToString(),
                    createdAt = DateTime.Now.AddDays(-30),
                    isActive = true,
                    subscriptionPlan = u.SubscriptionPlan != null ? u.SubscriptionPlan.PlanName.ToString() : "Free"
                })
                .ToListAsync();
        }



        public async Task<IEnumerable<object>> GetAllSubscriptionsWithDetailsAsync()
        {
            return await _context.Users
                .Include(u => u.SubscriptionPlan)
                .Where(u => u.SubscriptionPlanId.HasValue)
                .Select(u => new
                {
                    id = u.UserId,
                    userId = u.UserId,
                    username = u.UserName,
                    planType = u.SubscriptionPlan.PlanName.ToString(),
                    startDate = DateTime.Now.AddDays(-30),
                    endDate = DateTime.Now.AddDays(30),
                    status = "Active"
                })
                .ToListAsync();
        }
    }
}