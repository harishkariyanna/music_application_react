using StreamingAPI.Models;

namespace StreamingAPI.Interface
{
    public interface IToken
    {
        string GenerateToken(User user);
    }

}
