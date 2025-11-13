import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, CircularProgress } from '@mui/material';
import { Language, Person, ArrowBack } from '@mui/icons-material';
import { mediaService } from '../services/api';

interface Media {
  mediaId: number;
  title: string;
  composer?: string;
  language?: string;
  album?: string;
  durationInMinutes: number;
}

interface BrowseByCategoryProps {
  onMusicPlay?: (media: Media[], index: number) => void;
}

export default function BrowseByCategory({ onMusicPlay }: BrowseByCategoryProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'main' | 'language' | 'composer'>('main');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const data = await mediaService.getAll();
      setMedia(data.filter(m => m.mediaType === 1));
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
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

  const handleLanguageClick = (language: string) => {
    setSelectedCategory(language);
    setFilteredMedia(media.filter(m => m.language === language));
    setView('language');
  };

  const handleComposerClick = (composer: string) => {
    setSelectedCategory(composer);
    setFilteredMedia(media.filter(m => m.composer === composer));
    setView('composer');
  };

  const handlePlaySong = (index: number) => {
    onMusicPlay?.(filteredMedia, index);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ color: '#1db954' }} />
      </Box>
    );
  }

  if (view === 'language' || view === 'composer') {
    return (
      <Box sx={{ bgcolor: '#121212', minHeight: '100vh', p: 4, pb: 12 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <ArrowBack sx={{ color: 'white', cursor: 'pointer', fontSize: 32 }} onClick={() => setView('main')} />
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
            {selectedCategory}
          </Typography>
          <Chip label={`${filteredMedia.length} songs`} sx={{ bgcolor: '#1db954', color: 'black' }} />
        </Box>

        <Grid container spacing={3}>
          {filteredMedia.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.mediaId}>
              <Card 
                onClick={() => handlePlaySong(index)}
                sx={{ 
                  bgcolor: '#181818', 
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': { bgcolor: '#282828', transform: 'translateY(-4px)' }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    src={`https://localhost:7192/api/Media/${item.mediaId}/thumbnail`}
                    alt={item.title}
                    sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                    onError={(e: any) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <Box sx={{ width: '100%', height: 200, bgcolor: '#333', display: 'none', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: '#1db954' }}>
                    🎵
                  </Box>
                </Box>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 1 }}>
                    {item.composer || 'Unknown Artist'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {item.durationInMinutes} min
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const languages = getUniqueLanguages();
  const composers = getUniqueComposers();

  return (
    <Box sx={{ bgcolor: '#121212', minHeight: '100vh', p: 4, pb: 12 }}>
      <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 4 }}>
        Browse by Category
      </Typography>

      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Language sx={{ color: '#1db954', fontSize: 32 }} />
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
            Languages
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {languages.map((language) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={language}>
              <Card 
                onClick={() => handleLanguageClick(language)}
                sx={{ 
                  bgcolor: '#1db954', 
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': { bgcolor: '#1ed760', transform: 'scale(1.05)' }
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h6" sx={{ color: 'black', fontWeight: 'bold' }}>
                    {language}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#000' }}>
                    {media.filter(m => m.language === language).length} songs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Person sx={{ color: '#1db954', fontSize: 32 }} />
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
            Composers
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {composers.map((composer) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={composer}>
              <Card 
                onClick={() => handleComposerClick(composer)}
                sx={{ 
                  bgcolor: '#282828', 
                  cursor: 'pointer',
                  border: '2px solid #1db954',
                  transition: 'all 0.3s',
                  '&:hover': { bgcolor: '#333', transform: 'scale(1.05)' }
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {composer}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#b3b3b3' }}>
                    {media.filter(m => m.composer === composer).length} songs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
