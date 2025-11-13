import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, IconButton, CircularProgress } from '@mui/material';
import { PlayArrow, Favorite } from '@mui/icons-material';
import axios from 'axios';
import EnhancedMediaPlayer from './EnhancedMediaPlayer';
import Toast from './Toast';

interface Media {
  mediaId: number;
  title: string;
  composer: string;
  filePath: string;
}

export default function LikedSongs() {
  const [likedSongs, setLikedSongs] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'error' | 'warning'} | null>(null);

  useEffect(() => {
    fetchLikedSongs();
  }, []);

  const fetchLikedSongs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({message: 'Please login to view liked songs', type: 'warning'});
        setLoading(false);
        return;
      }
      const response = await axios.get('https://localhost:7192/api/Playlists/liked-music', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const songs = response.data?.playlistMedias?.map((pm: any) => pm.media) || [];
      setLikedSongs(songs);
    } catch (error: any) {
      console.error('Failed to fetch liked songs:', error);
      if (error.response?.status === 401) {
        setToast({message: 'Session expired. Please login again.', type: 'error'});
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (index: number) => {
    setCurrentIndex(index);
    setShowPlayer(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: '#1db954' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#121212', minHeight: '100vh', pb: showPlayer ? '120px' : '20px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Favorite sx={{ fontSize: 60, color: '#1db954' }} />
        <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
          Liked Songs
        </Typography>
      </Box>

      {likedSongs.length === 0 ? (
        <Typography sx={{ color: '#b3b3b3', textAlign: 'center', mt: 4 }}>
          No liked songs yet. Start liking songs to see them here!
        </Typography>
      ) : (
        <Box sx={{ display: 'grid', gap: 2 }}>
          {likedSongs.map((song, index) => (
            <Card key={song.mediaId} sx={{ bgcolor: '#181818', '&:hover': { bgcolor: '#282828' } }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid #1db954',
                    flexShrink: 0
                  }}
                >
                  <Box
                    component="img"
                    src={`https://localhost:7192/api/Media/${song.mediaId}/thumbnail`}
                    alt={song.title}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e: any) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231db954"%3E%3Cpath d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/%3E%3C/svg%3E';
                    }}
                  />
                </Box>
                <IconButton onClick={() => handlePlay(index)} sx={{ color: '#1db954' }}>
                  <PlayArrow sx={{ fontSize: 40 }} />
                </IconButton>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ color: 'white' }}>{song.title}</Typography>
                  <Typography variant="body2" sx={{ color: '#b3b3b3' }}>{song.composer || 'Unknown Artist'}</Typography>
                </Box>
                <Favorite sx={{ color: '#1db954' }} />
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {showPlayer && likedSongs.length > 0 && (
        <EnhancedMediaPlayer
          media={likedSongs}
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Box>
  );
}
