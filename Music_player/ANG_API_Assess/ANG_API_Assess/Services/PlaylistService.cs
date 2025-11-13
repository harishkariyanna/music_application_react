using ANG_API_Assess.Interface;
using StreamingAPI.Models;
using StreamingAPI.Models.Enums;

namespace ANG_API_Assess.Services
{
    public class PlaylistService
    {
        private readonly IPLaylistRepository _playlistRepository;

        public PlaylistService(IPLaylistRepository playlistRepository)
        {
            _playlistRepository = playlistRepository;
        }

        public async Task<IEnumerable<Playlist>> GetAllPlaylistsAsync()
        {
            return await _playlistRepository.GetAllAsync();
        }

        public async Task<Playlist?> GetPlaylistByIdAsync(int id)
        {
            return await _playlistRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Playlist?>> Getuploads(int userId)
        {
            return await _playlistRepository.GetPlaylistsByUserIdAsync(userId);
        }


        public async Task<Playlist> AddPlaylistAsync(Playlist playlist)
        {
            return await _playlistRepository.AddAsync(playlist);
        }

        public async Task<Playlist> UpdatePlaylistAsync(int id, Playlist playlist)
        {
            return await _playlistRepository.UpdateAsync(id, playlist);
        }

        public async Task<bool> DeletePlaylistAsync(int id)
        {
            return await _playlistRepository.DeleteAsync(id);
        }

        public async Task<Playlist?> GetLikedMusicAsync(int userId)
        {
            var likedPlaylist = await _playlistRepository.GetLikedMusicPlaylistAsync(userId);
            
            if (likedPlaylist == null)
            {
                try
                {
                    likedPlaylist = new Playlist
                    {
                        Name = "Liked Music",
                        UserId = userId,
                        PlaylistType = PlaylistType.LikedMusic,
                        IsDefault = true
                    };
                    likedPlaylist = await _playlistRepository.AddAsync(likedPlaylist);
                }
                catch
                {
                    likedPlaylist = await _playlistRepository.GetLikedMusicPlaylistAsync(userId);
                }
            }
            
            return likedPlaylist;
        }

        public async Task AddToLikedMusicAsync(int userId, int mediaId)
        {
            var likedPlaylist = await GetLikedMusicAsync(userId);
            var exists = await _playlistRepository.CheckMediaExistsInPlaylistAsync(likedPlaylist.PlaylistId, mediaId);
            
            if (!exists)
            {
                await _playlistRepository.AddMediaToPlaylistAsync(likedPlaylist.PlaylistId, mediaId);
            }
        }

        public async Task RemoveFromLikedMusicAsync(int userId, int mediaId)
        {
            var likedPlaylist = await GetLikedMusicAsync(userId);
            await _playlistRepository.RemoveMediaFromPlaylistAsync(likedPlaylist.PlaylistId, mediaId);
        }

        public async Task AddMediaToPlaylistAsync(int playlistId, int mediaId)
        {
            var exists = await _playlistRepository.CheckMediaExistsInPlaylistAsync(playlistId, mediaId);
            
            if (!exists)
            {
                await _playlistRepository.AddMediaToPlaylistAsync(playlistId, mediaId);
            }
        }

        public async Task ReorderPlaylistAsync(int playlistId, List<int> mediaIds)
        {
            await _playlistRepository.ReorderPlaylistAsync(playlistId, mediaIds);
        }
    }
}
