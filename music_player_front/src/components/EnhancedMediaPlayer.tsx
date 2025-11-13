import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Slider, LinearProgress, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemButton, ListItemText, TextField, Button } from '@mui/material';
import { PlayArrow, Pause, SkipNext, SkipPrevious, Favorite, Shuffle, PlaylistAdd, Close } from '@mui/icons-material';
import axios from 'axios';
import Toast from './Toast';

const AudioVisualizer = ({ isPlaying }: { isPlaying: boolean }) => {
  const bars = 20;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: 40, justifyContent: 'center' }}>
      {Array.from({ length: bars }).map((_, i) => (
        <Box
          key={i}
          sx={{
            width: 3,
            bgcolor: '#1db954',
            borderRadius: 1,
            animation: isPlaying ? `wave ${0.5 + Math.random() * 0.5}s ease-in-out infinite alternate` : 'none',
            animationDelay: `${i * 0.05}s`,
            height: isPlaying ? '100%' : '20%',
            transition: 'height 0.3s',
            '@keyframes wave': {
              '0%': { height: '20%' },
              '100%': { height: `${30 + Math.random() * 70}%` }
            }
          }}
        />
      ))}
    </Box>
  );
};

interface Media {
  mediaId: number;
  title: string;
  url: string;
  composer?: string;
}

interface EnhancedMediaPlayerProps {
  media: Media[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  playlistName?: string;
  isShuffled?: boolean;
  onClose?: () => void;
}

export default function EnhancedMediaPlayer({ media, currentIndex, onIndexChange, playlistName, isShuffled: playlistShuffled, onClose }: EnhancedMediaPlayerProps) {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [skipsToday, setSkipsToday] = useState(0);
  const [likedSongs, setLikedSongs] = useState<Set<number>>(new Set());
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [shuffleIndex, setShuffleIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);
  const [showAd, setShowAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://localhost:7192/api/Playlists/liked-music', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const likedIds = new Set(response.data?.playlistMedias?.map((pm: any) => pm.media.mediaId) || []);
        setLikedSongs(likedIds);
      } catch (error) {
        console.error('Failed to fetch liked songs:', error);
      }
    };
    fetchLikedSongs();
  }, []);
  
  const subscriptionPlan = localStorage.getItem('subscriptionPlan') || 'Free';
  const isPremium = subscriptionPlan === 'Premium' || subscriptionPlan === 'Family';
  const canSeek = isPremium;
  const maxSkips = isPremium ? Infinity : 3;

  useEffect(() => {
    const fetchSkipData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://localhost:7192/api/Users/skip-count', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSkipsToday(response.data.skipsToday || 0);
      } catch (error) {
        console.error('Failed to fetch skip data:', error);
        setSkipsToday(0);
      }
    };
    fetchSkipData();
  }, []);

  useEffect(() => {
    if (audioRef.current && media && media[currentIndex]) {
      const playAudio = async () => {
        try {
          const currentSrc = `https://localhost:7192${media[currentIndex].url}`;
          if (audioRef.current!.src !== currentSrc) {
            audioRef.current!.src = currentSrc;
            audioRef.current!.load();
          }
          if (audioRef.current!.paused) {
            await audioRef.current!.play();
            setIsPlaying(true);
          }
        } catch (error) {
          console.error('Autoplay failed:', error);
          setIsPlaying(false);
        }
      };
      playAudio();
    }
  }, [currentIndex, media]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const proceedToNextSong = (direction: 'next' | 'prev') => {
    if (isShuffled) {
      const newShuffleIndex = direction === 'next'
        ? (shuffleIndex + 1) % shuffledIndices.length
        : (shuffleIndex - 1 + shuffledIndices.length) % shuffledIndices.length;
      setShuffleIndex(newShuffleIndex);
      onIndexChange(shuffledIndices[newShuffleIndex]);
    } else {
      const newIndex = direction === 'next' 
        ? (currentIndex + 1) % media.length 
        : (currentIndex - 1 + media.length) % media.length;
      onIndexChange(newIndex);
    }
  };

  const handleSkip = (direction: 'next' | 'prev', isManual: boolean = true) => {
    if (direction === 'next' && !isPremium && skipsToday >= maxSkips && isManual) {
      setToast({message: `Free users can only skip ${maxSkips} songs per day. Upgrade to Premium for unlimited skips!`, type: 'warning'});
      return;
    }

    if (direction === 'next' && !isPremium && isManual) {
      const newSkips = skipsToday + 1;
      setSkipsToday(newSkips);
      
      const token = localStorage.getItem('token');
      axios.post('https://localhost:7192/api/Users/increment-skip', {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(error => console.error('Failed to update skip count:', error));
    }

    if (!isPremium && direction === 'next') {
      setShowAd(true);
      setAdCountdown(5);
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      proceedToNextSong(direction);
    }
  };

  useEffect(() => {
    if (showAd && adCountdown > 0) {
      const timer = setTimeout(() => setAdCountdown(adCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [showAd, adCountdown]);

  const handleCloseAd = () => {
    setShowAd(false);
    setAdCountdown(5);
    proceedToNextSong('next');
  };

  const handleSeek = (value: number) => {
    if (!canSeek) {
      setToast({message: 'Seeking is only available for Premium and Family subscribers!', type: 'warning'});
      return;
    }
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLikeSong = async (mediaId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (likedSongs.has(mediaId)) {
        await axios.delete(`https://localhost:7192/api/Playlists/unlike/${mediaId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLikedSongs(prev => {
          const newSet = new Set(prev);
          newSet.delete(mediaId);
          return newSet;
        });
      } else {
        await axios.post(`https://localhost:7192/api/Playlists/like/${mediaId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLikedSongs(prev => new Set(prev).add(mediaId));
      }
    } catch (error) {
      console.error('Failed to like/unlike:', error);
    }
  };

  const handleAddToPlaylist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({message: 'Please login to add songs to playlists', type: 'warning'});
        return;
      }
      const response = await axios.get('https://localhost:7192/api/Playlists/my-playlists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlaylists(response.data || []);
      setShowPlaylistDialog(true);
    } catch (error: any) {
      console.error('Failed to fetch playlists:', error);
      if (error.response?.status === 401) {
        setToast({message: 'Session expired. Please login again.', type: 'error'});
      } else {
        setToast({message: error.response?.data?.message || 'Failed to load playlists. Please try again.', type: 'error'});
      }
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      setToast({message: 'Please enter a playlist name', type: 'warning'});
      return;
    }
    if (!media[currentIndex]) return;
    try {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token, 'Token preview:', token?.substring(0, 20));
      if (!token) {
        setToast({message: 'Please login to create playlists', type: 'warning'});
        return;
      }
      await axios.post('https://localhost:7192/api/Playlists/create', {
        name: newPlaylistName,
        mediaIds: [media[currentIndex].mediaId]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewPlaylistName('');
      setToast({message: `Playlist "${newPlaylistName}" created with current song!`, type: 'success'});
      handleAddToPlaylist();
    } catch (error: any) {
      console.error('Failed to create playlist:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 401) {
        setToast({message: 'Session expired. Please login again.', type: 'error'});
        localStorage.removeItem('token');
      } else {
        setToast({message: error.response?.data || 'Failed to create playlist', type: 'error'});
      }
    }
  };

  const handleAddSongToPlaylist = async (playlistId: number, playlistName: string) => {
    if (!media[currentIndex]) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`https://localhost:7192/api/Playlists/${playlistId}/add-media/${media[currentIndex].mediaId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowPlaylistDialog(false);
      setToast({message: `Added "${media[currentIndex].title}" to "${playlistName}"`, type: 'success'});
    } catch (error: any) {
      console.error('Failed to add song to playlist:', error);
      setToast({message: error.response?.data || 'Failed to add song to playlist', type: 'error'});
    }
  };

  const handleShuffle = () => {
    if (!isShuffled) {
      const indices = media.map((_, i) => i);
      const shuffled = indices.sort(() => Math.random() - 0.5);
      setShuffledIndices(shuffled);
      setShuffleIndex(shuffled.indexOf(currentIndex));
      setIsShuffled(true);
    } else {
      setIsShuffled(false);
      setShuffledIndices([]);
      setShuffleIndex(0);
    }
  };

  if (!media || media.length === 0 || !media[currentIndex]) return null;

  const currentMedia = media[currentIndex];

  return (
    <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#181818', p: { xs: 1, sm: 2 }, borderTop: '1px solid #282828', zIndex: 1000 }}>
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          if (!isPremium) {
            setShowAd(true);
            setAdCountdown(5);
          } else {
            handleSkip('next', false);
          }
        }}
      />
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: { xs: 'none', md: 1 }, width: { xs: '100%', md: 'auto' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid #1db954',
                flexShrink: 0,
                position: 'relative',
                animation: isPlaying ? 'spin 3s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }}
            >
            <Box
              component="img"
              src={`https://localhost:7192/api/Media/${currentMedia.mediaId}/thumbnail`}
              alt={currentMedia.title}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e: any) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231db954"%3E%3Cpath d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/%3E%3C/svg%3E';
              }}
            />
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <AudioVisualizer isPlaying={isPlaying} />
          </Box>
          </Box>
          <Box sx={{ textAlign: { xs: 'center', md: 'left' }, flex: 1, minWidth: 0 }}>
            <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentMedia.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#b3b3b3', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              {currentMedia.composer || 'Unknown Artist'}
            </Typography>
            {playlistName && (
              <Typography variant="caption" sx={{ color: '#1db954', display: 'block', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                Playing from: {playlistName}{playlistShuffled ? ' (Shuffled)' : ''}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexWrap: 'wrap', justifyContent: 'center' }}>
          {onClose && (
            <IconButton onClick={onClose} sx={{ color: '#ff6b6b', display: { xs: 'inline-flex', md: 'none' } }}>
              <Close />
            </IconButton>
          )}
          <IconButton 
            onClick={() => handleLikeSong(currentMedia.mediaId)} 
            sx={{ 
              color: 'white',
              bgcolor: likedSongs.has(currentMedia.mediaId) ? '#1db954' : 'transparent',
              '&:hover': { bgcolor: likedSongs.has(currentMedia.mediaId) ? '#1ed760' : 'rgba(255,255,255,0.1)' }
            }}
          >
            <Favorite />
          </IconButton>
          <IconButton onClick={handleAddToPlaylist} sx={{ color: 'white', display: { xs: 'none', sm: 'inline-flex' } }}>
            <PlaylistAdd />
          </IconButton>
          <IconButton onClick={handleShuffle} sx={{ color: isShuffled ? '#1db954' : 'white', display: { xs: 'none', sm: 'inline-flex' } }}>
            <Shuffle />
          </IconButton>
          <IconButton onClick={() => handleSkip('prev')} sx={{ color: 'white' }}>
            <SkipPrevious />
          </IconButton>
          <IconButton onClick={togglePlay} sx={{ color: '#1db954', fontSize: '2rem' }}>
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
          <IconButton 
            onClick={() => handleSkip('next')} 
            sx={{ color: 'white' }}
            disabled={!isPremium && skipsToday >= maxSkips}
          >
            <SkipNext />
          </IconButton>
        </Box>

        <Box sx={{ flex: { xs: 'none', md: 1 }, width: { xs: '100%', md: 'auto' }, display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <Typography variant="caption" sx={{ color: '#b3b3b3', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
            {formatTime(currentTime)}
          </Typography>
          {canSeek ? (
            <Slider
              value={currentTime}
              max={duration}
              onChange={(_, value) => handleSeek(value as number)}
              sx={{ color: '#1db954' }}
            />
          ) : (
            <LinearProgress 
              variant="determinate" 
              value={(currentTime / duration) * 100} 
              sx={{ flex: 1, bgcolor: '#404040', '& .MuiLinearProgress-bar': { bgcolor: '#1db954' } }}
            />
          )}
          <Typography variant="caption" sx={{ color: '#b3b3b3', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
            {formatTime(duration)}
          </Typography>
        </Box>

        {!isPremium && (
          <Typography variant="caption" sx={{ color: '#ff6b6b', fontSize: { xs: '0.7rem', sm: '0.75rem' }, display: { xs: 'none', sm: 'block' } }}>
            Skips left: {maxSkips - skipsToday}/{maxSkips}
          </Typography>
        )}
        {onClose && (
          <IconButton onClick={onClose} sx={{ color: '#ff6b6b', display: { xs: 'none', md: 'inline-flex' } }}>
            <Close />
          </IconButton>
        )}
      </Box>

      <Dialog open={showPlaylistDialog} onClose={() => setShowPlaylistDialog(false)} PaperProps={{ sx: { bgcolor: '#282828', color: 'white', minWidth: 400 } }}>
        <DialogTitle sx={{ color: '#1db954' }}>Add to Playlist</DialogTitle>
        <DialogContent>
          {playlists.length > 0 && (
            <>
              <Typography sx={{ mb: 2, color: '#b3b3b3' }}>Select a playlist:</Typography>
              <List>
                {playlists.map((playlist: any) => (
                  <ListItem key={playlist.playlistId} disablePadding>
                    <ListItemButton 
                      onClick={() => handleAddSongToPlaylist(playlist.playlistId, playlist.name)}
                      sx={{ '&:hover': { bgcolor: '#404040' } }}
                    >
                      <ListItemText primary={playlist.name} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </>
          )}
          {playlists.length === 0 && (
            <Typography sx={{ mb: 2, color: '#b3b3b3' }}>No playlists found. Create one below:</Typography>
          )}
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <TextField
              fullWidth
              placeholder="New playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreatePlaylist()}
              sx={{ 
                '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#404040' } },
                '& .MuiInputLabel-root': { color: '#b3b3b3' }
              }}
            />
            <Button 
              onClick={handleCreatePlaylist} 
              variant="contained" 
              sx={{ bgcolor: '#1db954', '&:hover': { bgcolor: '#1ed760' }, minWidth: 100 }}
            >
              Create
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={showAd} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#181818', color: 'white' } }}>
        <DialogContent sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h5" sx={{ color: '#1db954', fontWeight: 'bold', mb: 2 }}>Advertisement</Typography>
          <Box sx={{ bgcolor: '#282828', p: 4, borderRadius: 2, mb: 3, minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h3" sx={{ color: '#1db954', mb: 2 }}>🎵</Typography>
            <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>Upgrade to Premium</Typography>
            <Typography sx={{ color: '#b3b3b3', mb: 2 }}>Enjoy ad-free music, unlimited skips, and more!</Typography>
            <Button variant="contained" onClick={() => { setShowAd(false); navigate('/subscription'); }} sx={{ bgcolor: '#1db954', color: 'black', fontWeight: 'bold', '&:hover': { bgcolor: '#1ed760' } }}>Get Premium</Button>
          </Box>
          <Typography sx={{ color: '#b3b3b3', mb: 2 }}>Your next song will play in {adCountdown} seconds...</Typography>
          <Button fullWidth disabled={adCountdown > 0} onClick={handleCloseAd} variant="outlined" sx={{ borderColor: '#1db954', color: adCountdown > 0 ? '#666' : '#1db954', '&:hover': { borderColor: '#1ed760', bgcolor: 'rgba(29, 185, 84, 0.1)' } }}>
            {adCountdown > 0 ? `Skip Ad (${adCountdown}s)` : 'Continue to Next Song'}
          </Button>
        </DialogContent>
      </Dialog>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Box>
  );
}
