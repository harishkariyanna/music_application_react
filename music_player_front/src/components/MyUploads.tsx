import { useState, useEffect } from 'react';
import { mediaService } from '../services/api';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  Chip,
  CircularProgress,
  Button
} from '@mui/material';
import {
  MusicNote,
  VideoLibrary,
  Podcasts,
  MenuBook,
  Delete
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
}

export default function MyUploads() {
  const [uploads, setUploads] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    loadUploads();
  }, []);

  const loadUploads = async () => {
    try {
      const data = await mediaService.getMyUploads();
      setUploads(data);
    } catch (error) {
      console.error('Failed to load uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await mediaService.delete(id);
      setUploads(uploads.filter(item => item.mediaId !== id));
      setToast({message: 'Media deleted successfully', type: 'success'});
    } catch (error) {
      console.error('Failed to delete media:', error);
      setToast({message: 'Failed to delete media', type: 'error'});
    }
    setConfirmDelete(null);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ color: '#1db954' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#121212', minHeight: '100vh', color: 'white', width: '100%', p: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', color: 'white' }}>
        My Uploads
      </Typography>
      
      {uploads.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" sx={{ color: '#b3b3b3', mb: 2 }}>
            No uploads yet
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            Start by uploading your first media file
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
          {uploads.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.mediaId} sx={{ display: 'flex', maxWidth: '300px' }}>
              <Card 
                sx={{ 
                  bgcolor: '#181818', 
                  color: 'white',
                  width: 280,
                  height: 450,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#282828',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  {item.thumbnail ? (
                    <Box
                      component="img"
                      src={`https://localhost:7192/api/Media/${item.mediaId}/thumbnail`}
                      alt={item.title}
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        bgcolor: '#333'
                      }}
                      onError={(e: any) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <Box 
                    sx={{ 
                      height: 200, 
                      bgcolor: '#333', 
                      display: item.thumbnail ? 'none' : 'flex',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '4rem',
                      color: '#1db954'
                    }}
                  >
                    {getMediaIcon(item.mediaType)}
                  </Box>
                  
                  <IconButton
                    onClick={() => setConfirmDelete(item.mediaId)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: '#dc3545',
                      color: 'white',
                      '&:hover': { bgcolor: '#c82333', transform: 'scale(1.1)' }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
                
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 'bold', 
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      {item.composer && (
                        <Box
                          component="img"
                          src={`https://localhost:7192/api/Media/composer-image/${encodeURIComponent(item.composer)}`}
                          alt={item.composer}
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1px solid #1db954'
                          }}
                          onError={(e: any) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#b3b3b3',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1
                        }}
                      >
                        {item.composer || item.album || 'Unknown Artist'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label={MediaType[item.mediaType]} 
                        size="small" 
                        sx={{ bgcolor: '#1db954', color: 'black' }}
                      />
                      {item.genre && (
                        <Chip 
                          label={getGenreName(item.genre)} 
                          size="small" 
                          sx={{ bgcolor: '#333', color: 'white' }}
                        />
                      )}
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" sx={{ color: '#b3b3b3', display: 'block', mb: 1 }}>
                      {item.durationInMinutes} min
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {new Date(item.releaseDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Media"
          message="Are you sure you want to delete this media?"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
          confirmText="Delete"
        />
      )}
    </Box>
  );
}