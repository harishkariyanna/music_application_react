import { useEffect } from 'react';
import { Snackbar, Alert, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <Snackbar open anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} onClose={onClose}>
      <Alert 
        severity={type} 
        onClose={onClose}
        sx={{ 
          bgcolor: type === 'success' ? '#1db954' : type === 'error' ? '#ff4444' : type === 'warning' ? '#ffaa00' : '#1db954',
          color: type === 'warning' ? 'black' : 'white',
          '& .MuiAlert-icon': { color: type === 'warning' ? 'black' : 'white' }
        }}
        action={
          <IconButton size="small" onClick={onClose} sx={{ color: type === 'warning' ? 'black' : 'white' }}>
            <Close fontSize="small" />
          </IconButton>
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
