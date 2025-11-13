using Microsoft.EntityFrameworkCore;
using StreamingAPI.Models;
using StreamingAPI.Models.Enums;

namespace StreamingAPI.Data
{
    public class context : DbContext
    {
        public context(DbContextOptions<context> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
        public DbSet<Media> Media { get; set; }
        public DbSet<Playlist> Playlists { get; set; }
        public DbSet<PlaylistMedia> PlaylistMedias { get; set; }
        public DbSet<Payment> Payments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Table names
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<SubscriptionPlan>().ToTable("SubscriptionPlans");
            modelBuilder.Entity<Media>().ToTable("Media");
            modelBuilder.Entity<Playlist>().ToTable("Playlists");
            modelBuilder.Entity<PlaylistMedia>().ToTable("PlaylistMedias");
            modelBuilder.Entity<Payment>().ToTable("Payments");

            // Relationships
            modelBuilder.Entity<User>() 
                .HasOne(u => u.SubscriptionPlan)
                .WithMany(sp => sp.Users)
                .HasForeignKey(u => u.SubscriptionPlanId);

            modelBuilder.Entity<Playlist>()
                .HasOne(p => p.User)
                .WithMany(u => u.Playlists)
                .HasForeignKey(p => p.UserId);

            modelBuilder.Entity<Playlist>()
                .HasIndex(p => new { p.UserId, p.PlaylistType })
                .IsUnique()
                .HasFilter("[PlaylistType] = 2");

            modelBuilder.Entity<PlaylistMedia>()
                .HasKey(pm => new { pm.PlaylistId, pm.MediaId });

            modelBuilder.Entity<PlaylistMedia>()
                .HasOne(pm => pm.Playlist)
                .WithMany(p => p.PlaylistMedias)
                .HasForeignKey(pm => pm.PlaylistId);

            modelBuilder.Entity<PlaylistMedia>()
                .HasOne(pm => pm.Media)
                .WithMany(m => m.PlaylistMedias)
                .HasForeignKey(pm => pm.MediaId);

            modelBuilder.Entity<Media>()
                .HasOne(m => m.Creator)
                .WithMany(u => u.UploadedMedia)
                .HasForeignKey(m => m.CreatorId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Payment>()
                .HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserId);

            modelBuilder.Entity<Payment>()
                .HasOne(p => p.SubscriptionPlan)
                .WithMany()
                .HasForeignKey(p => p.SubscriptionPlanId);




            modelBuilder.Entity<SubscriptionPlan>().HasData(
                new SubscriptionPlan { SubscriptionPlanId = 1, PlanName = SubscriptionPlanType.Free, Price = 0, MaxDevices = 1, IsDownloadAllowed = false, MaxSkipsPerDay = 3, CanSeekInSongs = false, AudioQuality = "128kbps", CanCreatePlaylists = false },
                new SubscriptionPlan { SubscriptionPlanId = 2, PlanName = SubscriptionPlanType.Premium, Price = 9.99m, MaxDevices = 3, IsDownloadAllowed = true, MaxSkipsPerDay = 999999, CanSeekInSongs = true, AudioQuality = "320kbps", CanCreatePlaylists = true },
                new SubscriptionPlan { SubscriptionPlanId = 3, PlanName = SubscriptionPlanType.Family, Price = 14.99m, MaxDevices = 5, IsDownloadAllowed = true, MaxSkipsPerDay = 999999, CanSeekInSongs = true, AudioQuality = "FLAC", CanCreatePlaylists = true }
            );

            modelBuilder.Entity<User>().HasData(
                new User { UserId = 1, UserName = "AdminUser", Email = "thankyouforcontactingharish@gmail.com", PasswordHash = "KqZ8vX2Np5Yt7Wm3Lq6Ks9Rn1Jq4Hp0Vm8Ls2Xt5Yz7Wm=", PasswordSalt = "Np7Yt2Wz5Vm8Ks1Hp6Jq9Rn3Kp0Xt5Yz8Wm2Lq7Np4Ks6=", Role = UserRole.Admin, SubscriptionPlanId = 2 },
                new User { UserId = 2, UserName = "JohnDoe", Email = "john@example.com", PasswordHash = "Xp2Yz7Wm3Lq6Ks5Np8Rn1Jq4Yt0Vm9Ls2Hp7Kp3Xt6Wz5=", PasswordSalt = "Lq4Np7Yt2Wz5Vm8Ks1Hp6Jq9Rn3Kp0Xt5Yz8Wm2Lq7Np4=", Role = UserRole.User, SubscriptionPlanId = 1 }
            );

            modelBuilder.Entity<Media>().HasData(
                new Media { MediaId = 1, Title = "Shape of You", MediaType = MediaType.Music, Url = "/media/shapeofyou.mp3", DurationInMinutes = 4, Genre = Genre.Pop, ReleaseDate = new DateTime(2017, 1, 6) },
                new Media { MediaId = 2, Title = "Inception", MediaType = MediaType.Video, Url = "/media/inception.mp4", DurationInMinutes = 148, Genre = Genre.Other, ReleaseDate = new DateTime(2010, 7, 16) }
            );

            modelBuilder.Entity<Playlist>().HasData(
                new Playlist { PlaylistId = 1, Name = "Liked Music", UserId = 2, PlaylistType = PlaylistType.LikedMusic, IsDefault = true }
            );

            modelBuilder.Entity<PlaylistMedia>().HasData(
                new PlaylistMedia { PlaylistId = 1, MediaId = 1 },
                new PlaylistMedia { PlaylistId = 1, MediaId = 2 }
            );
        }
    }
}
