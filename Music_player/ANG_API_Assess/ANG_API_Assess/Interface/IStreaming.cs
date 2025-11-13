using StreamingAPI.Models;

namespace ANG_API_Assess.Interface
{
    public interface IStreaming<T> where T : class
    {
        Task<IEnumerable<T>> GetAllAsync();
        Task<T?> GetByIdAsync(int id);
        Task<T> AddAsync(T entity);
        Task<T> UpdateAsync(int id, T entity);   
        Task<bool> DeleteAsync(int id);
    }

    public interface IMediaRepository : IStreaming<Media>
    {
        Task<IEnumerable<Media>> GetByCreatorAsync(int creatorId);
    }
    
    public interface IPLaylistRepository : IStreaming<Playlist>
    {
        Task<IEnumerable<Playlist>> GetPlaylistsByUserIdAsync(int userId);
        Task<Playlist?> GetLikedMusicPlaylistAsync(int userId);
        Task<bool> CheckMediaExistsInPlaylistAsync(int playlistId, int mediaId);
        Task AddMediaToPlaylistAsync(int playlistId, int mediaId);
        Task RemoveMediaFromPlaylistAsync(int playlistId, int mediaId);
        Task ReorderPlaylistAsync(int playlistId, List<int> mediaIds);
    }
}
