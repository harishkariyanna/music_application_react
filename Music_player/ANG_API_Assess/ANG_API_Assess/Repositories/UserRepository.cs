using Microsoft.EntityFrameworkCore;
using ANG_API_Assess.Interface;
using StreamingAPI.Data;
using StreamingAPI.Models;

namespace ANG_API_Assess.Repositories
{
    public class UserRepository : IStreaming<User>
    {
        private readonly context _context;

        public UserRepository(context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users
                .Include(u => u.SubscriptionPlan)  // business logic: fetch plan details
                .Include(u => u.Playlists)
                .ToListAsync();
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.SubscriptionPlan)
                .Include(u => u.Playlists)
                .FirstOrDefaultAsync(u => u.UserId == id);
        }

        public async Task<User> AddAsync(User entity)
        {
            _context.Users.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<User> UpdateAsync(int id, User entity)
        {
            var existing = await _context.Users.FindAsync(id);
            if (existing == null) return null;

            existing.UserName = entity.UserName;
            existing.Email = entity.Email;
            existing.PasswordHash = entity.PasswordHash;
            existing.PasswordSalt = entity.PasswordSalt;
            existing.Role = entity.Role;
            existing.SubscriptionPlanId = entity.SubscriptionPlanId;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
