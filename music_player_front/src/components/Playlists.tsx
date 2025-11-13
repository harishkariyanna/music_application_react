import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { PlayArrow, Favorite, Folder, Delete, ArrowBack, DragIndicator, Shuffle } from '@mui/icons-material';
import axios from 'axios';
import Toast from './Toast';

interface Media {
  mediaId: number;
  title: string;
  composer: string;
  url: string;
}

interface Playlist {
  playlistId: number;
  name: string;
  playlistType: number;
  playlistMedias: { media: Media }[];
}

interface PlaylistsProps {
  onMusicPlay?: (media: Media[], index: number, playlistName?: string, isShuffled?: boolean) => void;
}

export default function Playlists({ onMusicPlay }: PlaylistsProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isShuffled, setIsShuffled] = useState(false);
  const [originalOrder, setOriginalOrder] = useState<Media[]>([]);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://localhost:7192/api/Playlists/my-playlists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async (playlistId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://localhost:7192/api/Playlists/${playlistId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlaylists(playlists.filter(p => p.playlistId !== playlistId));
      setDeleteDialog(null);
      if (selectedPlaylist?.playlistId === playlistId) {
        setSelectedPlaylist(null);
      }
      setToast({message: 'Playlist deleted successfully', type: 'success'});
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      setToast({message: 'Failed to delete playlist', type: 'error'});
    }
  };

  const handlePlay = (index: number) => {
    if (selectedPlaylist) {
      const songs = selectedPlaylist.playlistMedias.map(pm => pm.media);
      onMusicPlay?.(songs, index, selectedPlaylist.name, isShuffled);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex || !selectedPlaylist) return;
    
    const songs = [...selectedPlaylist.playlistMedias];
    const [draggedSong] = songs.splice(draggedIndex, 1);
    songs.splice(dropIndex, 0, draggedSong);
    
    const updatedPlaylist = { ...selectedPlaylist, playlistMedias: songs };
    setSelectedPlaylist(updatedPlaylist);
    setDraggedIndex(null);
    
    try {
      const token = localStorage.getItem('token');
      const mediaIds = songs.map(pm => pm.media.mediaId);
      await axios.put(`https://localhost:7192/api/Playlists/${selectedPlaylist.playlistId}/reorder`, 
        mediaIds,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Failed to reorder playlist:', error);
      fetchPlaylists();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: '#1db954' }} />
      </Box>
    );
  }

  if (selectedPlaylist) {
    const songs = isShuffled && originalOrder.length > 0 ? [...originalOrder].sort(() => Math.random() - 0.5) : selectedPlaylist.playlistMedias.map(pm => pm.media);
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#121212', minHeight: '100vh', pb: '120px' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
          <IconButton onClick={() => setSelectedPlaylist(null)} sx={{ color: 'white' }}>
            <ArrowBack />
          </IconButton>
          {selectedPlaylist.playlistType === 2 ? <Favorite sx={{ fontSize: { xs: 40, sm: 60 }, color: '#1db954' }} /> : <Folder sx={{ fontSize: { xs: 40, sm: 60 }, color: '#1db954' }} />}
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}>
            {selectedPlaylist.name}
          </Typography>
          <IconButton 
            onClick={() => {
              if (songs.length > 0) {
                if (!isShuffled) {
                  setOriginalOrder(songs);
                  const shuffled = [...songs].sort(() => Math.random() - 0.5);
                  setIsShuffled(true);
                  onMusicPlay?.(shuffled, 0, selectedPlaylist.name, true);
                } else {
                  setIsShuffled(false);
                  onMusicPlay?.(originalOrder, 0, selectedPlaylist.name, false);
                }
              }
            }}
            sx={{ color: isShuffled ? '#1db954' : 'white', ml: { xs: 0, sm: 'auto' } }}
          >
            <Shuffle />
          </IconButton>
          <IconButton onClick={() => setDeleteDialog(selectedPlaylist.playlistId)} sx={{ color: '#ff6b6b' }}>
            <Delete />
          </IconButton>
        </Box>

        {songs.length === 0 ? (
          <Typography sx={{ color: '#b3b3b3', textAlign: 'center', mt: 4 }}>
            No songs in this playlist yet.
          </Typography>
        ) : (
          <Box sx={{ display: 'grid', gap: 2 }}>
            {songs.map((song, index) => (
              <Card 
                key={song.mediaId} 
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                sx={{ 
                  bgcolor: '#181818', 
                  '&:hover': { bgcolor: '#282828' },
                  cursor: 'move',
                  opacity: draggedIndex === index ? 0.5 : 1
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <DragIndicator sx={{ color: '#666', cursor: 'grab' }} />
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
                  <Typography variant="caption" sx={{ color: '#666' }}>#{index + 1}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#121212', minHeight: '100vh' }}>
      <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 4, fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}>
        Your Playlists
      </Typography>

      {playlists.length === 0 ? (
        <Typography sx={{ color: '#b3b3b3', textAlign: 'center', mt: 4 }}>
          No playlists yet. Create one from the media player!
        </Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(200px, 1fr))' }, gap: { xs: 2, sm: 3 } }}>
          {playlists.map((playlist) => (
            <Card 
              key={playlist.playlistId} 
              sx={{ 
                bgcolor: '#181818', 
                cursor: 'pointer',
                '&:hover': { bgcolor: '#282828' },
                position: 'relative'
              }}
              onClick={() => setSelectedPlaylist(playlist)}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                {playlist.playlistType === 2 ? (
                  <Favorite sx={{ fontSize: 80, color: '#1db954', mb: 2 }} />
                ) : (
                  <Folder sx={{ fontSize: 80, color: '#1db954', mb: 2 }} />
                )}
                <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>{playlist.name}</Typography>
                <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                  {playlist.playlistMedias?.length || 0} songs
                </Typography>
                <IconButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteDialog(playlist.playlistId);
                  }}
                  sx={{ position: 'absolute', top: 8, right: 8, color: '#ff6b6b' }}
                >
                  <Delete />
                </IconButton>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={deleteDialog !== null} onClose={() => setDeleteDialog(null)} PaperProps={{ sx: { bgcolor: '#282828', color: 'white' } }}>
        <DialogTitle>Delete Playlist</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this playlist?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)} sx={{ color: '#b3b3b3' }}>Cancel</Button>
          <Button onClick={() => deleteDialog && handleDeletePlaylist(deleteDialog)} sx={{ color: '#ff6b6b' }}>Delete</Button>
        </DialogActions>
      </Dialog>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Box>
  );
}
