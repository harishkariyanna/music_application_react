using ANG_API_Assess.Interface;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using StreamingAPI.Data;
using StreamingAPI.Models;
using StreamingAPI.Models.Enums;
using System.Runtime.Serialization;

namespace ANG_API_Assess.Repositories
{
    public class PlaylistRepository : IPLaylistRepository
    {
        private readonly context _context;

        public PlaylistRepository(context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Playlist>> GetAllAsync()
        {
            return await _context.Playlists
                .Include(p => p.User)
                .Include(p => p.PlaylistMedias)
                .ThenInclude(pm => pm.Media)
                .ToListAsync();
        }

        public async Task<Playlist?> GetByIdAsync(int id)
        {
            var playlist = await _context.Playlists.Include(p => p.PlaylistMedias).ThenInclude(pm => pm.Media).FirstOrDefaultAsync(p => p.PlaylistId == id);
            return playlist;
        }

        public async Task<IEnumerable<Playlist>> GetPlaylistsByUserIdAsync(int userId)
        {
            return await _context.Playlists
                .Include(pm => pm.User)
                .Include(e => e.PlaylistMedias)
                .ThenInclude(e => e.Media)
                .Where(p => p.UserId == userId)
                .ToListAsync();
        }




        public async Task<Playlist> AddAsync(Playlist entity)
        {
            // Ensure PlaylistMedias are tracked
            if (entity.PlaylistMedias != null && entity.PlaylistMedias.Any())
            {
                foreach (var pm in entity.PlaylistMedias)
                {
                    _context.Entry(pm).State = EntityState.Added;
                }
            }

            _context.Playlists.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }



        public async Task<Playlist> UpdateAsync(int id, Playlist entity)
        {
            var existing = await _context.Playlists.FindAsync(id);
            if (existing == null) return null;

            existing.Name = entity.Name;
            existing.UserId = entity.UserId;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var playlist = await _context.Playlists.FindAsync(id);
            if (playlist == null) return false;

            _context.Playlists.Remove(playlist);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Playlist?> GetLikedMusicPlaylistAsync(int userId)
        {
            return await _context.Playlists
                .Include(p => p.PlaylistMedias)
                .ThenInclude(pm => pm.Media)
                .FirstOrDefaultAsync(p => p.UserId == userId && p.PlaylistType == PlaylistType.LikedMusic);
        }

        public async Task<bool> CheckMediaExistsInPlaylistAsync(int playlistId, int mediaId)
        {
            return await _context.PlaylistMedias
                .AnyAsync(pm => pm.PlaylistId == playlistId && pm.MediaId == mediaId);
        }

        public async Task RemoveMediaFromPlaylistAsync(int playlistId, int mediaId)
        {
            var playlistMedia = await _context.PlaylistMedias
                .FirstOrDefaultAsync(pm => pm.PlaylistId == playlistId && pm.MediaId == mediaId);

            if (playlistMedia != null)
            {
                _context.PlaylistMedias.Remove(playlistMedia);
                await _context.SaveChangesAsync();
            }
        }

        public async Task AddMediaToPlaylistAsync(int playlistId, int mediaId)
        {
            _context.PlaylistMedias.Add(new PlaylistMedia
            {
                PlaylistId = playlistId,
                MediaId = mediaId
            });
            await _context.SaveChangesAsync();
        }

        public async Task ReorderPlaylistAsync(int playlistId, List<int> mediaIds)
        {
            var existingMedias = await _context.PlaylistMedias
                .Where(pm => pm.PlaylistId == playlistId)
                .ToListAsync();

            _context.PlaylistMedias.RemoveRange(existingMedias);
            await _context.SaveChangesAsync();

            foreach (var mediaId in mediaIds)
            {
                _context.PlaylistMedias.Add(new PlaylistMedia
                {
                    PlaylistId = playlistId,
                    MediaId = mediaId
                });
            }
            await _context.SaveChangesAsync();
        }
    }
}
