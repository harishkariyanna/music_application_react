import { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, InputAdornment, Paper } from '@mui/material';
import { Person, Lock, MusicNote } from '@mui/icons-material';
import { authService } from '../services/api';

interface LoginDto {
  username: string;
  password: string;
}

interface LoginProps {
  onLogin: (token: string) => void;
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

interface ValidationErrors {
  username?: string;
  password?: string;
}

export default function Login({ onLogin, onSwitchToRegister, onSwitchToForgotPassword }: LoginProps) {
  const [credentials, setCredentials] = useState<LoginDto>({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Username or Email is required';
        if (value.length < 3) return 'Must be at least 3 characters';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (field: keyof LoginDto, value: string) => {
    setCredentials({ ...credentials, [field]: value });
    const error = validateField(field, value);
    setErrors({ ...errors, [field]: error });
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const isFormValid = () => {
    const usernameError = validateField('username', credentials.username);
    const passwordError = validateField('password', credentials.password);
    return !usernameError && !passwordError && credentials.username && credentials.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ username: true, password: true });
    
    // Validate all fields
    const usernameError = validateField('username', credentials.username);
    const passwordError = validateField('password', credentials.password);
    
    setErrors({
      username: usernameError,
      password: passwordError
    });

    if (usernameError || passwordError) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      onLogin(response.token);
    } catch (err: any) {
      setError(err.response?.data || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#121212', minHeight: '100vh', display: 'flex' }}>
      <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', backgroundImage: 'url(/musicbackgroundimageloginpage.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.5)' }} />
        <Box sx={{ textAlign: 'center', zIndex: 1, p: 4 }}>
          <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold', mb: 2, textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>MusicStream Pro</Typography>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 500, textShadow: '2px 2px 4px rgba(0,0,0,0.8)', maxWidth: 600, mx: 'auto' }}>Your ultimate music streaming platform with millions of songs, personalized playlists, and ad-free listening experience</Typography>
        </Box>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper sx={{ bgcolor: '#181818', p: 4, borderRadius: 3, maxWidth: 450, width: '100%', border: '1px solid rgba(29, 185, 84, 0.2)' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <MusicNote sx={{ fontSize: 60, color: '#1db954', mb: 1 }} />
          <Typography variant="h4" sx={{ color: '#1db954', fontWeight: 'bold', mb: 0.5 }}>Welcome Back</Typography>
          <Typography variant="body2" sx={{ color: '#b3b3b3' }}>Login to continue your music journey</Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            placeholder="Username or Email *"
            value={credentials.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            onBlur={() => handleBlur('username')}
            error={!!(errors.username && touched.username)}
            helperText={touched.username && errors.username}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(40, 40, 40, 0.8)', color: 'white', '& fieldset': { borderColor: '#404040' }, '&:hover fieldset': { borderColor: '#1db954' }, '&.Mui-focused fieldset': { borderColor: '#1db954' } }, '& .MuiFormHelperText-root': { color: '#ff4444' } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#1db954' }} /></InputAdornment> }}
          />
          <TextField
            fullWidth
            type="password"
            placeholder="Password *"
            value={credentials.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            error={!!(errors.password && touched.password)}
            helperText={touched.password && errors.password}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(40, 40, 40, 0.8)', color: 'white', '& fieldset': { borderColor: '#404040' }, '&:hover fieldset': { borderColor: '#1db954' }, '&.Mui-focused fieldset': { borderColor: '#1db954' } }, '& .MuiFormHelperText-root': { color: '#ff4444' } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#1db954' }} /></InputAdornment> }}
          />
          {error && <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(211, 47, 47, 0.2)', color: '#ff6b6b' }}>{error}</Alert>}
          <Button fullWidth type="submit" disabled={loading || !isFormValid()} sx={{ bgcolor: '#1db954', color: 'black', fontWeight: 'bold', py: 1.5, mb: 2, '&:hover': { bgcolor: '#1ed760' }, '&:disabled': { opacity: 0.6 } }}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 0.5 }}>
            Don't have an account?{' '}
            <Button onClick={onSwitchToRegister} sx={{ color: '#1db954', textTransform: 'none', p: 0.5, minWidth: 'auto' }}>Register</Button>
          </Typography>
          <Button onClick={onSwitchToForgotPassword} sx={{ color: '#1db954', textTransform: 'none', fontSize: '0.875rem' }}>Forgot Password?</Button>
        </Box>
      </Paper>
      </Box>
    </Box>
  );
}