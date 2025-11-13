using ANG_API_Assess.Interface;

namespace ANG_API_Assess.Services
{
    public class AdminService
    {
        private readonly IAdmin _adminRepository;

        public AdminService(IAdmin adminRepository)
        {
            _adminRepository = adminRepository;
        }

        public async Task<IEnumerable<object>> GetAllUsersWithDetailsAsync()
        {
            // Business Logic: Get all users and apply any filtering/sorting
            var users = await _adminRepository.GetAllUsersWithDetailsAsync();
            
            // Business Logic: Could add filtering, sorting, pagination here
            return users;
        }

        public async Task<IEnumerable<object>> GetAllSubscriptionsWithDetailsAsync()
        {
            // Business Logic: Get subscriptions and apply business rules
            var subscriptions = await _adminRepository.GetAllSubscriptionsWithDetailsAsync();
            
            // Business Logic: Could filter by active/inactive, sort by date, etc.
            return subscriptions;
        }
    }
}