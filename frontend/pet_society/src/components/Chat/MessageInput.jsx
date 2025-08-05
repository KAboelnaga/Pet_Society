import { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import {
  Send as SendIcon,
} from '@mui/icons-material';

const MessageInput = ({ onSendMessage, onTyping, disabled, compact = false }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
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
            ml: 1,
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
  );
};

export default MessageInput;
