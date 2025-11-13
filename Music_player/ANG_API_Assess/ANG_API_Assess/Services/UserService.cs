using ANG_API_Assess.Interface;
using StreamingAPI.Models;

namespace ANG_API_Assess.Services
{
    public class UserService
    {
        private readonly IStreaming<User> _userRepository;

        public UserService(IStreaming<User> userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _userRepository.GetAllAsync();
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _userRepository.GetByIdAsync(id);
        }

        public async Task<User> AddUserAsync(User user)
        {
            if (user.SubscriptionPlanId == null)
            {
                user.SubscriptionPlanId = 1;
            }
            return await _userRepository.AddAsync(user);
        }

        public async Task<User> UpdateUserAsync(int id, User user)
        {
            return await _userRepository.UpdateAsync(id, user);
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            return await _userRepository.DeleteAsync(id);
        }

        public async Task<object> GetSkipCountAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return new { skipsToday = 0 };

            var today = DateTime.Today;
            if (user.LastSkipDate?.Date != today)
            {
                user.SkipsToday = 0;
                user.LastSkipDate = today;
                await _userRepository.UpdateAsync(userId, user);
            }

            return new { skipsToday = user.SkipsToday };
        }

        public async Task IncrementSkipAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return;

            var today = DateTime.Today;
            if (user.LastSkipDate?.Date != today)
            {
                user.SkipsToday = 1;
                user.LastSkipDate = today;
            }
            else
            {
                user.SkipsToday++;
            }

            await _userRepository.UpdateAsync(userId, user);
        }
    }
}
