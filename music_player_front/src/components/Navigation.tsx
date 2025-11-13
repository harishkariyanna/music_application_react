import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Box, Button, IconButton, Avatar, Menu, MenuItem, Typography, Divider } from '@mui/material';
import { Home, QueueMusic, CloudUpload, LibraryMusic, CreditCard, YouTube, Settings, Logout, MusicNote, Menu as MenuIcon } from '@mui/icons-material';

interface NavigationProps {
  userRole: number;
  onLogout: () => void;
}

export default function Navigation({ userRole, onLogout }: NavigationProps) {
  const isAuthenticated = !!localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState(localStorage.getItem('subscriptionPlan') || 'Free');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const handleStorageChange = () => {
      setSubscriptionPlan(localStorage.getItem('subscriptionPlan') || 'Free');
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen for manual updates
    const interval = setInterval(() => {
      const currentPlan = localStorage.getItem('subscriptionPlan') || 'Free';
      if (currentPlan !== subscriptionPlan) {
        setSubscriptionPlan(currentPlan);
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [subscriptionPlan]);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getUserInfo = () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'User',
          role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'User',
          subscription: subscriptionPlan
        };
      } catch (error) {
        return { name: 'User', role: 'User', subscription: subscriptionPlan };
      }
    }
    return { name: 'User', role: 'User', subscription: subscriptionPlan };
  };

  const userInfo = getUserInfo();

  return (
    <AppBar position="sticky" sx={{ bgcolor: '#181818', borderBottom: '1px solid #282828' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MusicNote sx={{ color: '#1db954', fontSize: 32 }} />
          <Typography variant="h6" sx={{ color: '#1db954', fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
            MusicStream Pro
          </Typography>
        </Box>

        {!isAuthenticated ? (
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <Button onClick={() => navigate('/login')} sx={{ color: 'white', bgcolor: '#1db954', '&:hover': { bgcolor: '#1ed760' } }}>Login</Button>
            <Button onClick={() => navigate('/register')} sx={{ color: '#1db954', borderColor: '#1db954', '&:hover': { borderColor: '#1ed760', bgcolor: 'rgba(29, 185, 84, 0.1)' } }} variant="outlined">Register</Button>
          </Box>
        ) : (
          <>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, ml: 'auto', mr: 1 }}>
              <Button startIcon={<Home />} onClick={() => navigate('/')} sx={{ color: location.pathname === '/' ? '#1db954' : 'white', '&:hover': { bgcolor: 'rgba(29, 185, 84, 0.1)' } }}>Home</Button>
              <Button startIcon={<QueueMusic />} onClick={() => navigate('/playlists')} sx={{ color: location.pathname === '/playlists' ? '#1db954' : 'white', '&:hover': { bgcolor: 'rgba(29, 185, 84, 0.1)' } }}>Playlists</Button>
              {userRole >= 2 && <Button startIcon={<CloudUpload />} onClick={() => navigate('/upload')} sx={{ color: location.pathname === '/upload' ? '#1db954' : 'white', '&:hover': { bgcolor: 'rgba(29, 185, 84, 0.1)' } }}>Upload</Button>}
              {userRole >= 2 && <Button startIcon={<LibraryMusic />} onClick={() => navigate('/myuploads')} sx={{ color: location.pathname === '/myuploads' ? '#1db954' : 'white', '&:hover': { bgcolor: 'rgba(29, 185, 84, 0.1)' } }}>My Uploads</Button>}
              {userRole !== 3 && <Button startIcon={<CreditCard />} onClick={() => navigate('/subscription')} sx={{ color: location.pathname === '/subscription' ? '#1db954' : 'white', '&:hover': { bgcolor: 'rgba(29, 185, 84, 0.1)' } }}>Subscription</Button>}
              {subscriptionPlan === 'Premium' && <Button startIcon={<YouTube />} onClick={() => navigate('/youtube')} sx={{ color: location.pathname === '/youtube' ? '#1db954' : 'white', '&:hover': { bgcolor: 'rgba(29, 185, 84, 0.1)' } }}>YouTube</Button>}
              {userRole === 3 && <Button startIcon={<Settings />} onClick={() => navigate('/admin')} sx={{ color: location.pathname === '/admin' ? '#1db954' : 'white', '&:hover': { bgcolor: 'rgba(29, 185, 84, 0.1)' } }}>Admin</Button>}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: { xs: 'auto', md: 0 } }}>
              <IconButton sx={{ display: { xs: 'flex', md: 'none' }, color: 'white' }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <MenuIcon />
              </IconButton>
              <IconButton onClick={handleProfileClick}>
                <Avatar sx={{ bgcolor: '#1db954', width: 32, height: 32 }}>{userInfo.name[0]}</Avatar>
              </IconButton>
            </Box>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose} PaperProps={{ sx: { bgcolor: '#282828', color: 'white', minWidth: 200 } }}>
              <MenuItem disabled><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{userInfo.name}</Typography></MenuItem>
              <MenuItem disabled><Typography variant="caption">Role: {userInfo.role}</Typography></MenuItem>
              <MenuItem disabled><Typography variant="caption">Plan: {userInfo.subscription}</Typography></MenuItem>
              <Divider sx={{ bgcolor: '#404040' }} />
              <MenuItem onClick={onLogout} sx={{ color: '#ff6b6b', '&:hover': { bgcolor: 'rgba(255, 107, 107, 0.1)' } }}>
                <Logout sx={{ mr: 1, fontSize: 20 }} /> Logout
              </MenuItem>
            </Menu>
            {mobileMenuOpen && (
              <Box sx={{ display: { xs: 'flex', md: 'none' }, position: 'fixed', top: 64, left: 0, right: 0, bgcolor: '#181818', flexDirection: 'column', p: 2, gap: 1, zIndex: 1000, borderBottom: '1px solid #282828' }}>
                <Button fullWidth startIcon={<Home />} onClick={() => { navigate('/'); setMobileMenuOpen(false); }} sx={{ color: 'white', justifyContent: 'flex-start' }}>Home</Button>
                <Button fullWidth startIcon={<QueueMusic />} onClick={() => { navigate('/playlists'); setMobileMenuOpen(false); }} sx={{ color: 'white', justifyContent: 'flex-start' }}>Playlists</Button>
                {userRole >= 2 && <Button fullWidth startIcon={<CloudUpload />} onClick={() => { navigate('/upload'); setMobileMenuOpen(false); }} sx={{ color: 'white', justifyContent: 'flex-start' }}>Upload</Button>}
                {userRole >= 2 && <Button fullWidth startIcon={<LibraryMusic />} onClick={() => { navigate('/myuploads'); setMobileMenuOpen(false); }} sx={{ color: 'white', justifyContent: 'flex-start' }}>My Uploads</Button>}
                {userRole !== 3 && <Button fullWidth startIcon={<CreditCard />} onClick={() => { navigate('/subscription'); setMobileMenuOpen(false); }} sx={{ color: 'white', justifyContent: 'flex-start' }}>Subscription</Button>}
                {subscriptionPlan === 'Premium' && <Button fullWidth startIcon={<YouTube />} onClick={() => { navigate('/youtube'); setMobileMenuOpen(false); }} sx={{ color: 'white', justifyContent: 'flex-start' }}>YouTube</Button>}
                {userRole === 3 && <Button fullWidth startIcon={<Settings />} onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }} sx={{ color: 'white', justifyContent: 'flex-start' }}>Admin</Button>}
              </Box>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}