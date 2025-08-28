import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Card,
  CardMedia,
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { getAbsoluteImageUrl } from '../../config/api';
import { useTheme } from '../../context/ThemeContext';

const Message = ({ message, isOwnMessage, formatMessageTime }) => {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const { theme } = useTheme();

  const handleImageClick = () => {
    setImageDialogOpen(true);
  };

  const handleCloseImageDialog = () => {
    setImageDialogOpen(false);
  };

  const renderMessageContent = () => {
    if (message.message_type === 'image') {
      // Try different image URL possibilities and convert to absolute URL
      const relativeImageUrl = message.image_url || message.image;
      const imageUrl = getAbsoluteImageUrl(relativeImageUrl);
      
      if (imageUrl) {
        return (
          <Card 
            sx={{ 
              maxWidth: 300, 
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 2,
              },
              transition: 'box-shadow 0.2s ease-in-out',
            }}
            onClick={handleImageClick}
          >
            <CardMedia
              component="img"
              image={imageUrl}
              alt="Shared image"
              sx={{
                maxHeight: 200,
                objectFit: 'cover',
                width: '100%',
              }}
            />
          </Card>
        );
      } else {
        // Fallback for missing image URL
        return (
          <Paper
            elevation={1}
            sx={{
              p: 2,
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#666',
            }}
          >
            <Typography variant="body2">
              📷 Image (URL not available)
            </Typography>
          </Paper>
        );
      }
    }

    // Regular text message
    return (
      <Typography
        variant="body2"
        sx={{
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          color: isOwnMessage ? 'white' : theme.colors.text,
        }}
      >
        {message.body}
      </Typography>
    );
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
          mb: 1.5,
          px: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            maxWidth: '70%',
            flexDirection: isOwnMessage ? 'row-reverse' : 'row',
            alignItems: 'flex-end',
            gap: 1,
          }}
        >
          {!isOwnMessage && (
            <Avatar
              src={message.author?.profile?.profile_picture}
              sx={{ width: 32, height: 32, fontSize: '0.875rem' }}
            >
              {message.author?.first_name?.[0] || message.author?.username?.[0] || 'U'}
            </Avatar>
          )}

          <Box>
            {!isOwnMessage && (
              <Typography
                variant="caption"
                sx={{
                  ml: 1,
                  color: theme.colors.textSecondary
                }}
              >
                {message.author?.first_name || message.author?.username}
              </Typography>
            )}
            
            <Paper
              elevation={1}
              sx={{
                p: message.message_type === 'image' ? 0.5 : 2,
                backgroundColor: isOwnMessage
                  ? theme.colors.primary
                  : theme.colors.surface,
                background: isOwnMessage
                  ? theme.colors.primary
                  : theme.colors.surface,
                borderRadius: isOwnMessage
                  ? '18px 18px 6px 18px'
                  : '18px 18px 18px 6px',
                mt: !isOwnMessage ? 0.5 : 0,
              }}
            >
              {renderMessageContent()}
              
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'right',
                  color: isOwnMessage ? 'rgba(255,255,255,0.7)' : theme.colors.textSecondary,
                  mt: message.message_type === 'image' ? 1 : 0.5,
                  px: message.message_type === 'image' ? 1 : 0,
                }}
              >
                {formatMessageTime(message.created)}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Image Preview Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={handleCloseImageDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={handleCloseImageDialog}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              zIndex: 1,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          {message.message_type === 'image' && (message.image_url || message.image) && (
            <img
              src={getAbsoluteImageUrl(message.image_url || message.image)}
              alt="Full size image"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '80vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Message;
