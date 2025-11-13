import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmDialog({ 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}: ConfirmDialogProps) {
  return (
    <Dialog open onClose={onCancel} PaperProps={{ sx: { bgcolor: '#282828', color: 'white', minWidth: 400 } }}>
      <DialogTitle sx={{ color: '#1db954', fontWeight: 'bold' }}>{title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: '#b3b3b3' }}>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onCancel} sx={{ color: '#b3b3b3', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>{cancelText}</Button>
        <Button onClick={onConfirm} variant="contained" sx={{ bgcolor: '#1db954', color: 'black', '&:hover': { bgcolor: '#1ed760' } }}>{confirmText}</Button>
      </DialogActions>
    </Dialog>
  );
}
