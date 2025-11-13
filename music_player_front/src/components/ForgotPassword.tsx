import { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Paper, Stepper, Step, StepLabel } from '@mui/material';

interface ForgotPasswordProps {
  onBack: () => void;
}

export default function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://localhost:7192/api/Password/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        setStep(1);
      } else {
        setError('Failed to send OTP');
      }
    } catch (err) {
      setError('Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://localhost:7192/api/Password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      if (response.ok) {
        setStep(2);
      } else {
        setError('Invalid OTP');
      }
    } catch (err) {
      setError('Error verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://localhost:7192/api/Password/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      if (response.ok) {
        alert('Password reset successfully!');
        onBack();
      } else {
        setError('Failed to reset password');
      }
    } catch (err) {
      setError('Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#121212', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
      <Paper sx={{ bgcolor: '#181818', p: 4, borderRadius: 3, maxWidth: 500, width: '100%', border: '1px solid rgba(29, 185, 84, 0.2)' }}>
        <Typography variant="h4" sx={{ color: '#1db954', fontWeight: 'bold', textAlign: 'center', mb: 3 }}>Reset Password</Typography>
        
        <Stepper activeStep={step} sx={{ mb: 4, '& .MuiStepLabel-label': { color: '#b3b3b3' }, '& .MuiStepLabel-label.Mui-active': { color: '#1db954' }, '& .MuiStepLabel-label.Mui-completed': { color: '#1db954' }, '& .MuiStepIcon-root': { color: '#404040' }, '& .MuiStepIcon-root.Mui-active': { color: '#1db954' }, '& .MuiStepIcon-root.Mui-completed': { color: '#1db954' } }}>
          <Step><StepLabel>Email</StepLabel></Step>
          <Step><StepLabel>Verify OTP</StepLabel></Step>
          <Step><StepLabel>New Password</StepLabel></Step>
        </Stepper>

        {step === 0 && (
          <Box>
            <TextField
              fullWidth
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(40, 40, 40, 0.8)', color: 'white', '& fieldset': { borderColor: '#404040' }, '&:hover fieldset': { borderColor: '#1db954' }, '&.Mui-focused fieldset': { borderColor: '#1db954' } } }}
            />
            <Button fullWidth onClick={handleSendOtp} disabled={loading} sx={{ bgcolor: '#1db954', color: 'black', fontWeight: 'bold', py: 1.5, '&:hover': { bgcolor: '#1ed760' }, '&:disabled': { opacity: 0.6 } }}>
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </Box>
        )}

        {step === 1 && (
          <Box>
            <TextField
              fullWidth
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(40, 40, 40, 0.8)', color: 'white', '& fieldset': { borderColor: '#404040' }, '&:hover fieldset': { borderColor: '#1db954' }, '&.Mui-focused fieldset': { borderColor: '#1db954' } } }}
            />
            <Button fullWidth onClick={handleVerifyOtp} disabled={loading} sx={{ bgcolor: '#1db954', color: 'black', fontWeight: 'bold', py: 1.5, '&:hover': { bgcolor: '#1ed760' }, '&:disabled': { opacity: 0.6 } }}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </Box>
        )}

        {step === 2 && (
          <Box>
            <TextField
              fullWidth
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(40, 40, 40, 0.8)', color: 'white', '& fieldset': { borderColor: '#404040' }, '&:hover fieldset': { borderColor: '#1db954' }, '&.Mui-focused fieldset': { borderColor: '#1db954' } } }}
            />
            <Button fullWidth onClick={handleResetPassword} disabled={loading} sx={{ bgcolor: '#1db954', color: 'black', fontWeight: 'bold', py: 1.5, '&:hover': { bgcolor: '#1ed760' }, '&:disabled': { opacity: 0.6 } }}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mt: 2, bgcolor: 'rgba(211, 47, 47, 0.2)', color: '#ff6b6b' }}>{error}</Alert>}

        <Button fullWidth onClick={onBack} sx={{ mt: 2, color: '#1db954', textTransform: 'none' }}>
          Back to Login
        </Button>
      </Paper>
    </Box>
  );
}
