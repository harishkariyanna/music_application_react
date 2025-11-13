using ANG_API_Assess.Interface;
using Microsoft.EntityFrameworkCore;
using StreamingAPI.Data;
using StreamingAPI.Models;
using System.Runtime.Serialization;

namespace ANG_API_Assess.Repositories
{
    public class SubscriptionPlanRepository : IStreaming<SubscriptionPlan>
    {
        private readonly context _context;

        public SubscriptionPlanRepository(context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SubscriptionPlan>> GetAllAsync()
        {
            return await _context.SubscriptionPlans.ToListAsync();
        }

        public async Task<SubscriptionPlan?> GetByIdAsync(int id)
        {
            return await _context.SubscriptionPlans.FirstOrDefaultAsync(p => p.SubscriptionPlanId == id);
        }

        public async Task<SubscriptionPlan> AddAsync(SubscriptionPlan entity)
        {
            _context.SubscriptionPlans.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<SubscriptionPlan> UpdateAsync(int id, SubscriptionPlan entity)
        {
            var existing = await _context.SubscriptionPlans.FindAsync(id);
            if (existing == null) return null;

            existing.PlanName = entity.PlanName;
            existing.Price = entity.Price;
            existing.MaxDevices = entity.MaxDevices;
            existing.IsDownloadAllowed = entity.IsDownloadAllowed;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var plan = await _context.SubscriptionPlans.FindAsync(id);
            if (plan == null) return false;

            _context.SubscriptionPlans.Remove(plan);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
