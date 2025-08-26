import { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardMedia,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  PhotoCamera as PhotoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const MessageInput = ({ onSendMessage, onSendImage, onTyping, disabled, compact = false }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Focus input when component mounts
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSendMessage = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      handleStopTyping();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    // Handle typing indicator
    if (e.target.value.trim() && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      onTyping(false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file must be less than 10MB');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setShowImageDialog(true);
      };
      reader.readAsDataURL(file);
    }
    
    // Reset file input
    e.target.value = '';
  };

  const handleSendImage = () => {
    if (selectedImage && onSendImage) {
      onSendImage(selectedImage);
      setSelectedImage(null);
      setImagePreview(null);
      setShowImageDialog(false);
    }
  };

  const handleCancelImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setShowImageDialog(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <Paper elevation={0} sx={{ p: compact ? 1.5 : 2, bgcolor: 'transparent' }}>
        <Box sx={{ display: 'flex', gap: compact ? 0.5 : 1, alignItems: 'center' }}>
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={4}
            placeholder={disabled ? "Connecting..." : "Type a message..."}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            onBlur={handleStopTyping}
            disabled={disabled}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: compact ? '20px' : '24px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                '&:hover': {
                  backgroundColor: '#e5e7eb',
                },
                '&.Mui-focused': {
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 0 2px rgba(103, 126, 234, 0.2)',
                },
                '& fieldset': {
                  border: 'none',
                },
              },
              '& .MuiInputBase-input': {
                fontSize: compact ? '0.875rem' : '1rem',
                py: compact ? 1 : 1.5,
                px: compact ? 1.5 : 2,
              },
            }}
          />
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          
          <IconButton
            onClick={handleImageSelect}
            disabled={disabled}
            sx={{
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              width: compact ? 36 : 40,
              height: compact ? 36 : 40,
              '&:hover': {
                backgroundColor: '#e5e7eb',
                color: '#4b5563',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <PhotoIcon fontSize={compact ? 'small' : 'medium'} />
          </IconButton>
          
          <IconButton
            onClick={handleSendMessage}
            disabled={!message.trim() || disabled}
            sx={{
              background: message.trim() && !disabled
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : '#e5e7eb',
              color: message.trim() && !disabled ? 'white' : '#9ca3af',
              width: compact ? 36 : 40,
              height: compact ? 36 : 40,
              '&:hover': {
                background: message.trim() && !disabled
                  ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                  : '#d1d5db',
                transform: message.trim() && !disabled ? 'scale(1.05)' : 'none',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <SendIcon fontSize={compact ? 'small' : 'medium'} />
          </IconButton>
        </Box>
        
        {disabled && (
          <Typography 
            variant="caption" 
            color="textSecondary" 
            sx={{ mt: 1, display: 'block' }}
          >
            Connecting to chat server...
          </Typography>
        )}
      </Paper>

      {/* Image Preview Dialog */}
      <Dialog
        open={showImageDialog}
        onClose={handleCancelImage}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Send Image
          <IconButton onClick={handleCancelImage}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {imagePreview && (
            <Card>
              <CardMedia
                component="img"
                image={imagePreview}
                alt="Image preview"
                sx={{
                  maxHeight: 400,
                  objectFit: 'contain',
                  width: '100%',
                }}
              />
            </Card>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelImage} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSendImage}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
            }}
          >
            Send Image
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MessageInput;
