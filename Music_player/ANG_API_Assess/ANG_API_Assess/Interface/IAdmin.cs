using StreamingAPI.Models;

namespace ANG_API_Assess.Interface
{
    public interface IAdmin
    {
        Task<IEnumerable<object>> GetAllUsersWithDetailsAsync();

        Task<IEnumerable<object>> GetAllSubscriptionsWithDetailsAsync();
    }
}