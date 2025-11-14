import { useState, useEffect, useRef } from 'react';
import { mediaService } from '../services/api';
import axios from 'axios';
import Toast from './Toast';
import './MediaList.css';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField
} from '@mui/material';
import {
  MusicNote,
  VideoLibrary,
  Podcasts,
  MenuBook,
  PlaylistAdd,
  Search
} from '@mui/icons-material';

enum MediaType {
  Music = 1,
  Video = 2,
  Podcast = 3,
  AudioBook = 4
}

enum Genre {
  Pop = 1,
  Rock = 2,
  HipHop = 3,
  Electronic = 4,
  Classical = 5,
  Jazz = 6,
  Country = 7,
  RnB = 8,
  Reggae = 9,
  Folk = 10,
  Alternative = 11,
  Indie = 12,
  Other = 99
}

interface Media {
  mediaId: number;
  title: string;
  mediaType: MediaType;
  url: string;
  durationInMinutes: number;
  genre?: Genre;
  releaseDate: string;
  composer?: string;
  album?: string;
  description?: string;
  creatorId?: number;
  thumbnail?: string;
  language?: string;
}

interface MediaListProps {
  onMusicPlay?: (media: Media[], index: number) => void;
}

export default function MediaList({ onMusicPlay }: MediaListProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePlaylistDialog, setShowCreatePlaylistDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedComposer, setSelectedComposer] = useState<string>('');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);
  
  const subscriptionPlan = localStorage.getItem('subscriptionPlan') || 'Free';
  const isPremium = subscriptionPlan === 'Premium' || subscriptionPlan === 'Family';
  const loadingPromise = useRef<Promise<any> | null>(null);

  useEffect(() => {
    if (!loadingPromise.current) {
      loadingPromise.current = loadMedia();
    }
  }, []);

  const loadMedia = async () => {
    try {
      const data = await mediaService.getAll();
      setMedia(data);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  };

  const playMedia = (mediaItem: Media) => {
    if (mediaItem.mediaType === MediaType.Music) {
      const musicOnlyMedia = media.filter(m => m.mediaType === MediaType.Music);
      const index = musicOnlyMedia.findIndex(m => m.mediaId === mediaItem.mediaId);
      onMusicPlay?.(musicOnlyMedia, index);
    }
  };

  const getGenreName = (genre?: Genre) => {
    if (!genre) return 'Unknown';
    return Genre[genre] || 'Unknown';
  };

  const getMediaIcon = (type: MediaType) => {
    switch (type) {
      case MediaType.Music: return <MusicNote />;
      case MediaType.Video: return <VideoLibrary />;
      case MediaType.Podcast: return <Podcasts />;
      case MediaType.AudioBook: return <MenuBook />;
      default: return <MusicNote />;
    }
  };

  const handleAddToPlaylist = () => {
    if (!isPremium) {
      setToast({message: 'Creating playlists is only available for Premium and Family subscribers!', type: 'warning'});
      return;
    }
    setShowCreatePlaylistDialog(true);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      setToast({message: 'Please enter a playlist name', type: 'warning'});
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://localhost:7192/api/Playlists/create', {
        name: newPlaylistName,
        mediaIds: []
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewPlaylistName('');
      setShowCreatePlaylistDialog(false);
      setToast({message: `Playlist "${newPlaylistName}" created successfully!`, type: 'success'});
    } catch (error: any) {
      console.error('Failed to create playlist:', error);
      setToast({message: error.response?.data || 'Failed to create playlist', type: 'error'});
    }
  };

  const getUniqueLanguages = () => {
    const languages = media.map(m => m.language).filter(Boolean);
    return [...new Set(languages)] as string[];
  };

  const getUniqueComposers = () => {
    const composers = media.map(m => m.composer).filter(Boolean);
    return [...new Set(composers)] as string[];
  };

  const getLanguageImage = (language: string) => {
    const images: { [key: string]: string } = {
      'Kannada': '/monuments/kannada.jpg',
      'Telugu': '/monuments/telugu.jpg',
      'Tamil': '/monuments/tamil.jpg',
      'Hindi': '/monuments/hindi.jpg',
      'English': '/monuments/english.jpg',
      'Malayalam': '/monuments/malyalam.jpg',
      'Marathi': '/monuments/marathi.jpg',
      'Bengali': '/monuments/bengali.jpg',
      'Punjabi': '/monuments/punjabi.jpg'
    };
    return images[language] || '';
  };

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.mediaType === MediaType.Music &&
      (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.composer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.album?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLanguage = !selectedLanguage || item.language === selectedLanguage;
    const matchesComposer = !selectedComposer || item.composer === selectedComposer;
    return matchesSearch && matchesLanguage && matchesComposer;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ color: '#1db954' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#121212', minHeight: '100vh', color: 'white', p: { xs: 2, sm: 3, md: 4 }, pb: 12 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white', fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}>
          {selectedLanguage || selectedComposer ? (selectedLanguage || selectedComposer) : 'Browse Music'}
        </Typography>
        <Button
          startIcon={<PlaylistAdd />}
          onClick={handleAddToPlaylist}
          sx={{ 
            bgcolor: isPremium ? '#1db954' : '#666', 
            color: isPremium ? 'black' : '#999',
            '&:hover': { bgcolor: isPremium ? '#1ed760' : '#666' }
          }}
        >
          Create Playlist {!isPremium && '(Premium)'}
        </Button>
      </Box>
      
      <TextField
        fullWidth
        placeholder="Search for songs, artists, or albums..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: <Search sx={{ color: '#b3b3b3', mr: 1 }} />
        }}
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            color: 'white',
            bgcolor: '#282828',
            '& fieldset': { borderColor: '#404040' },
            '&:hover fieldset': { borderColor: '#1db954' },
            '&.Mui-focused fieldset': { borderColor: '#1db954' }
          }
        }}
      />

      {(selectedLanguage || selectedComposer) && (
        <Box sx={{ mb: 3 }}>
          <Button onClick={() => { setSelectedLanguage(''); setSelectedComposer(''); }} sx={{ color: '#1db954' }}>
            ← Back to all music
          </Button>
        </Box>
      )}

      {!selectedLanguage && !selectedComposer && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#1db954', mb: 2 }}>🌍 Languages</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
            {getUniqueLanguages().map(lang => (
              <Box
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundImage: `url(${getLanguageImage(lang)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  color: 'white',
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.3s',
                  minWidth: 120,
                  height: 60,
                  border: '2px solid #1db954',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': { transform: 'scale(1.05) rotate(2deg)' },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    zIndex: 1
                  }
                }}
              >
                <Typography sx={{ fontWeight: 'bold', position: 'relative', zIndex: 2, textShadow: '2px 2px 4px rgba(0,0,0,0.9)', textAlign: 'center' }}>
                  {lang} ({media.filter(m => m.language === lang).length})
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {!isPremium && (
        <Box sx={{ bgcolor: '#ff6b6b', p: 2, borderRadius: 2, mb: 3 }}>
          <Typography variant="body2" sx={{ color: 'white' }}>
            ⚠️ Free Plan: Limited to 3 skips per day • Cannot seek in songs • Standard quality (128kbps)
          </Typography>
        </Box>
      )}
      
      <div className="media-grid">
        {filteredMedia.map((item) => (
          <div
            key={item.mediaId}
            className="media-card"
            onClick={() => item.mediaType === MediaType.Music && playMedia(item)}
          >
            <div className="media-card-image">
              {item.thumbnail ? (
                <img
                  src={`https://localhost:7192/api/Media/${item.mediaId}/thumbnail`}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e: any) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                getMediaIcon(item.mediaType)
              )}
            </div>
            
            <div className="media-card-content">
              <div className="media-card-title">{item.title}</div>
              <div className="media-card-artist">{item.composer || item.album || 'Unknown Artist'}</div>
              
              <div className="media-card-chips">
                <span className="chip chip-primary">{MediaType[item.mediaType]}</span>
                {item.genre && (
                  <span className="chip chip-secondary">{getGenreName(item.genre)}</span>
                )}
              </div>
              
              <div className="media-card-duration">{item.durationInMinutes} min</div>
            </div>
          </div>
        ))}
      </div>

      {!selectedLanguage && !selectedComposer && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" sx={{ color: '#1db954', mb: 3 }}>🎤 Composers</Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
            {getUniqueComposers().map(composer => (
              <Box
                key={composer}
                onClick={() => setSelectedComposer(composer)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid #1db954',
                    mb: 1
                  }}
                >
                  <Box
                    component="img"
                    src={`https://localhost:7192/api/Media/composer-image/${encodeURIComponent(composer)}`}
                    alt={composer}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e: any) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231db954"%3E%3Cpath d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/%3E%3C/svg%3E';
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: 'white', textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {composer}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                  {media.filter(m => m.composer === composer).length} songs
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <Dialog open={showCreatePlaylistDialog} onClose={() => setShowCreatePlaylistDialog(false)} PaperProps={{ sx: { bgcolor: '#282828', color: 'white', minWidth: 400 } }}>
        <DialogTitle sx={{ color: '#1db954' }}>Create New Playlist</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              placeholder="Enter playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreatePlaylist()}
              autoFocus
              sx={{ 
                '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#404040' } },
                '& .MuiInputLabel-root': { color: '#b3b3b3' }
              }}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button 
                onClick={() => setShowCreatePlaylistDialog(false)}
                sx={{ color: '#b3b3b3' }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreatePlaylist} 
                variant="contained" 
                sx={{ bgcolor: '#1db954', '&:hover': { bgcolor: '#1ed760' } }}
              >
                Create
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Box>
  );
}
