using ANG_API_Assess.Interface;
using Microsoft.EntityFrameworkCore;
using StreamingAPI.Data;
using StreamingAPI.Models;
using System.Runtime.Serialization;

namespace ANG_API_Assess.Repositories
{
    public class MediaRepository : IMediaRepository
    {
        private readonly context _context;

        public MediaRepository(context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Media>> GetAllAsync()
        {
            return await _context.Media
                .Include(m => m.Creator) // bring creator info
                .Include(m => m.PlaylistMedias)
                    .ThenInclude(pm => pm.Playlist) // optional
                .ToListAsync();
        }


        public async Task<IEnumerable<Media>> GetByCreatorAsync(int creatorId)
        {
            return await _context.Media
                .Where(m => m.CreatorId == creatorId)
                .Include(m => m.PlaylistMedias)
                .Include(m => m.Creator)
                .ToListAsync();
        }

        public async Task<Media?> GetByIdAsync(int id)
        {
            return await _context.Media
                .Include(m => m.PlaylistMedias)
                .ThenInclude(pm => pm.Playlist)
                .FirstOrDefaultAsync(m => m.MediaId == id);
        }

        public async Task<Media> AddAsync(Media entity)
        {
            _context.Media.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<Media> UpdateAsync(int id, Media entity)
        {
            var existing = await _context.Media.FindAsync(id);
            if (existing == null) return null;

            existing.Title = entity.Title;
            existing.MediaType = entity.MediaType;
            existing.Url = entity.Url;
            existing.DurationInMinutes = entity.DurationInMinutes;
            existing.Genre = entity.Genre;
            existing.ReleaseDate = entity.ReleaseDate;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var media = await _context.Media.FindAsync(id);
            if (media == null) return false;

            _context.Media.Remove(media);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
