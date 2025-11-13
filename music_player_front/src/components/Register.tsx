import { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, InputAdornment, Paper, Select, MenuItem, LinearProgress } from '@mui/material';
import { Person, Email, Lock, Settings, MusicNote } from '@mui/icons-material';
import { authService } from '../services/api';

enum UserRole {
  User = 1,
  Creator = 2,
  Admin = 3
}

interface RegisterDto {
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

interface RegisterProps {
  onRegister: () => void;
  onSwitchToLogin: () => void;
}

interface ValidationErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export default function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [userData, setUserData] = useState<RegisterDto>({
    username: '',
    email: '',
    passwordHash: '',
    role: UserRole.User
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/\d/.test(password)) errors.push('One number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('One special character');
    
    return { isValid: errors.length === 0, errors };
  };

  const getPasswordStrength = (password: string): PasswordStrength => {
    if (!password) return { score: 0, label: '', color: '#666' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    const strengths = [
      { score: 0, label: '', color: '#666' },
      { score: 1, label: 'Very Weak', color: '#ff4444' },
      { score: 2, label: 'Weak', color: '#ff8800' },
      { score: 3, label: 'Fair', color: '#ffaa00' },
      { score: 4, label: 'Good', color: '#88cc00' },
      { score: 5, label: 'Strong', color: '#00cc44' }
    ];
    
    return strengths[score];
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (value.length > 20) return 'Username must be less than 20 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!validateEmail(value)) return 'Please enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        const passwordValidation = validatePassword(value);
        if (!passwordValidation.isValid) {
          return `Password must have: ${passwordValidation.errors.join(', ')}`;
        }
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== userData.passwordHash) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (field: keyof RegisterDto | 'confirmPassword', value: string) => {
    if (field === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setUserData({ ...userData, [field]: value });
    }
    
    const error = validateField(field, value);
    setErrors({ ...errors, [field]: error });
    
    // Also validate confirm password if password changes
    if (field === 'passwordHash' && confirmPassword) {
      const confirmError = validateField('confirmPassword', confirmPassword);
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const isFormValid = () => {
    const usernameError = validateField('username', userData.username);
    const emailError = validateField('email', userData.email);
    const passwordError = validateField('password', userData.passwordHash);
    const confirmPasswordError = validateField('confirmPassword', confirmPassword);
    
    return !usernameError && !emailError && !passwordError && !confirmPasswordError &&
           userData.username && userData.email && userData.passwordHash && confirmPassword;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ username: true, email: true, password: true, confirmPassword: true });
    
    // Validate all fields
    const usernameError = validateField('username', userData.username);
    const emailError = validateField('email', userData.email);
    const passwordError = validateField('password', userData.passwordHash);
    const confirmPasswordError = validateField('confirmPassword', confirmPassword);
    
    setErrors({
      username: usernameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError
    });

    if (usernameError || emailError || passwordError || confirmPasswordError) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await authService.register(userData);
      onRegister();
    } catch (err: any) {
      setError(err.response?.data || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(userData.passwordHash);

  return (
    <Box sx={{ bgcolor: '#121212', minHeight: '100vh', display: 'flex' }}>
      <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', backgroundImage: 'url(/musicbackgroundregister.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.5)' }} />
        <Box sx={{ textAlign: 'center', zIndex: 1, p: 4 }}>
          <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold', mb: 2, textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>MusicStream Pro</Typography>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 500, textShadow: '2px 2px 4px rgba(0,0,0,0.8)', maxWidth: 600, mx: 'auto' }}>Start free forever! Upgrade to Premium anytime for unlimited features and ad-free experience</Typography>
        </Box>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, overflowY: 'auto' }}>
      <Paper sx={{ bgcolor: '#181818', p: 4, borderRadius: 3, maxWidth: 450, width: '100%', border: '1px solid rgba(29, 185, 84, 0.2)', my: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Person sx={{ fontSize: 60, color: '#1db954', mb: 1 }} />
          <Typography variant="h4" sx={{ color: '#1db954', fontWeight: 'bold', mb: 0.5 }}>Join Us</Typography>
          <Typography variant="body2" sx={{ color: '#b3b3b3' }}>Create your account and start your music journey</Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            placeholder="Username *"
            value={userData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            onBlur={() => handleBlur('username')}
            error={!!(errors.username && touched.username)}
            helperText={touched.username && errors.username}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(40, 40, 40, 0.8)', color: 'white', '& fieldset': { borderColor: '#404040' }, '&:hover fieldset': { borderColor: '#1db954' }, '&.Mui-focused fieldset': { borderColor: '#1db954' } }, '& .MuiFormHelperText-root': { color: '#ff4444' } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#1db954' }} /></InputAdornment> }}
          />
          <TextField
            fullWidth
            type="email"
            placeholder="Email *"
            value={userData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            error={!!(errors.email && touched.email)}
            helperText={touched.email && errors.email}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(40, 40, 40, 0.8)', color: 'white', '& fieldset': { borderColor: '#404040' }, '&:hover fieldset': { borderColor: '#1db954' }, '&.Mui-focused fieldset': { borderColor: '#1db954' } }, '& .MuiFormHelperText-root': { color: '#ff4444' } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#1db954' }} /></InputAdornment> }}
          />
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              type="password"
              placeholder="Password *"
              value={userData.passwordHash}
              onChange={(e) => handleInputChange('passwordHash', e.target.value)}
              onBlur={() => handleBlur('password')}
              error={!!(errors.password && touched.password)}
              helperText={touched.password && errors.password}
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(40, 40, 40, 0.8)', color: 'white', '& fieldset': { borderColor: '#404040' }, '&:hover fieldset': { borderColor: '#1db954' }, '&.Mui-focused fieldset': { borderColor: '#1db954' } }, '& .MuiFormHelperText-root': { color: '#ff4444' } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#1db954' }} /></InputAdornment> }}
            />
            {userData.passwordHash && (
              <Box sx={{ mt: 1 }}>
                <LinearProgress variant="determinate" value={(passwordStrength.score / 5) * 100} sx={{ height: 4, borderRadius: 2, bgcolor: '#404040', '& .MuiLinearProgress-bar': { bgcolor: passwordStrength.color } }} />
                <Typography variant="caption" sx={{ color: passwordStrength.color, mt: 0.5, display: 'block' }}>{passwordStrength.label}</Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              type="password"
              placeholder="Confirm Password *"
              value={confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              error={!!(errors.confirmPassword && touched.confirmPassword)}
              helperText={touched.confirmPassword && errors.confirmPassword}
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(40, 40, 40, 0.8)', color: 'white', '& fieldset': { borderColor: '#404040' }, '&:hover fieldset': { borderColor: '#1db954' }, '&.Mui-focused fieldset': { borderColor: '#1db954' } }, '& .MuiFormHelperText-root': { color: '#ff4444' } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#1db954' }} /></InputAdornment> }}
            />
            {confirmPassword && userData.passwordHash && (
              <Typography variant="caption" sx={{ color: confirmPassword === userData.passwordHash ? '#00cc44' : '#ff4444', mt: 0.5, display: 'block' }}>
                {confirmPassword === userData.passwordHash ? '✓ Passwords match' : '✗ Passwords do not match'}
              </Typography>
            )}
          </Box>
          <Select
            fullWidth
            value={userData.role}
            onChange={(e) => setUserData({ ...userData, role: Number(e.target.value) as UserRole })}
            startAdornment={<InputAdornment position="start"><Settings sx={{ color: '#1db954' }} /></InputAdornment>}
            sx={{ mb: 2, bgcolor: 'rgba(40, 40, 40, 0.8)', color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#404040' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1db954' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1db954' }, '& .MuiSvgIcon-root': { color: '#1db954' } }}
          >
            <MenuItem value={UserRole.User}>User</MenuItem>
            <MenuItem value={UserRole.Creator}>Creator</MenuItem>
          </Select>
          {error && <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(211, 47, 47, 0.2)', color: '#ff6b6b' }}>{error}</Alert>}
          <Button fullWidth type="submit" disabled={loading || !isFormValid()} sx={{ bgcolor: '#1db954', color: 'black', fontWeight: 'bold', py: 1.5, mb: 2, '&:hover': { bgcolor: '#1ed760' }, '&:disabled': { opacity: 0.6 } }}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
            Already have an account?{' '}
            <Button onClick={onSwitchToLogin} sx={{ color: '#1db954', textTransform: 'none', p: 0.5, minWidth: 'auto' }}>Login</Button>
          </Typography>
        </Box>
      </Paper>
      </Box>
    </Box>
  );
}