import { useState } from 'react';
import { Box, TextField, Card, CardContent, Typography, IconButton, Grid, InputAdornment } from '@mui/material';
import { Search, PlayArrow, Pause, SkipNext, SkipPrevious, Close } from '@mui/icons-material';
import axios from 'axios';

interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  videoId: string;
}

interface YouTubeMusicProps {
  onPlayVideo: (data: {video: YouTubeVideo, videos: YouTubeVideo[], index: number}) => void;
}

export default function YouTubeMusic({ onPlayVideo }: YouTubeMusicProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const YOUTUBE_API_KEY = 'AIzaSyAlnD60465YtNEyT1mjMj495d1BEtzDVAI';
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          part: 'snippet',
          type: 'video',
          videoCategoryId: '10',
          q: searchQuery,
          maxResults: 20,
          key: YOUTUBE_API_KEY
        }
      });
      
      console.log('YouTube API Response:', response.data);
      const items = response.data.items || [];
      const formattedVideos = items
        .filter((item: any) => item.id?.videoId)
        .map((item: any) => {
          const thumbnails = item.snippet?.thumbnails;
          return {
            id: item.id.videoId,
            videoId: item.id.videoId,
            title: item.snippet?.title || 'Unknown Title',
            channel: item.snippet?.channelTitle || 'Unknown Channel',
            thumbnail: thumbnails?.medium?.url || thumbnails?.high?.url || thumbnails?.default?.url || ''
          };
        });
      
      setVideos(formattedVideos);
    } catch (error: any) {
      console.error('YouTube search failed:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to search YouTube: ${error.response?.data?.error?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (video: YouTubeVideo) => {
    const index = videos.findIndex(v => v.videoId === video.videoId);
    onPlayVideo({ video, videos, index });
  };

  return (
    <Box sx={{ bgcolor: '#121212', minHeight: '100vh', color: 'white', p: { xs: 2, sm: 3, md: 4 }, pb: 12 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', color: 'white', fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}>
        🎵 YouTube Music
      </Typography>
      
      <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search for songs, artists, or albums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} sx={{ color: '#1db954' }}>
                  <Search />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              bgcolor: '#282828',
              '& fieldset': { borderColor: '#404040' },
              '&:hover fieldset': { borderColor: '#1db954' },
              '&.Mui-focused fieldset': { borderColor: '#1db954' }
            }
          }}
        />
      </Box>

      {loading && (
        <Typography variant="h6" sx={{ textAlign: 'center', color: '#b3b3b3' }}>
          Searching...
        </Typography>
      )}

      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ alignItems: 'stretch', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
        {videos.map((video) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={video.id} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card 
              onClick={() => handlePlay(video)}
              sx={{ 
                bgcolor: '#181818',
                color: 'white',
                width: { xs: '100%', sm: 280 },
                maxWidth: 280,
                height: { xs: 'auto', sm: 400 },
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#282828',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <Box 
                sx={{ 
                  position: 'relative', 
                  height: { xs: 150, sm: 200 }, 
                  bgcolor: '#282828',
                  overflow: 'hidden'
                }}
              >
                {video.thumbnail ? (
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.style.background = 'linear-gradient(135deg, #1db954 20%, #1ed760 100%)';
                    }}
                  />
                ) : (
                  <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1db954 20%, #1ed760 100%)' }}>
                    <Typography variant="h1" sx={{ fontSize: '5rem', opacity: 0.3 }}>🎵</Typography>
                  </Box>
                )}

              </Box>
              
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      mb: 1
                    }}
                  >
                    {video.title}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                    {video.channel}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {videos.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" sx={{ color: '#b3b3b3', mb: 2 }}>
            Search for your favorite music
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            Premium feature: Access millions of songs from YouTube
          </Typography>
        </Box>
      )}


    </Box>
  );
}