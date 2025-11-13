using ANG_API_Assess.Interface;
using StreamingAPI.Models;

namespace ANG_API_Assess.Services
{
    public class SubscriptionPlanService
    {
        private readonly IStreaming<SubscriptionPlan> _planRepository;

        public SubscriptionPlanService(IStreaming<SubscriptionPlan> planRepository)
        {
            _planRepository = planRepository;
        }

        public async Task<IEnumerable<SubscriptionPlan>> GetAllPlansAsync()
        {
            return await _planRepository.GetAllAsync();
        }

        public async Task<SubscriptionPlan?> GetPlanByIdAsync(int id)
        {
            return await _planRepository.GetByIdAsync(id);
        }

        public async Task<SubscriptionPlan> AddPlanAsync(SubscriptionPlan plan)
        {
            return await _planRepository.AddAsync(plan);
        }

        public async Task<SubscriptionPlan> UpdatePlanAsync(int id, SubscriptionPlan plan)
        {
            return await _planRepository.UpdateAsync(id, plan);
        }

        public async Task<bool> DeletePlanAsync(int id)
        {
            return await _planRepository.DeleteAsync(id);
        }
    }
}
