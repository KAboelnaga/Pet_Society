import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const MessageList = ({ messages, typingUsers, loading, compact = false }) => {
  const { user } = useAuth();
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.created).toDateString();
    const previousDate = new Date(previousMessage.created).toDateString();
    
    return currentDate !== previousDate;
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100%"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      flex: 1,
      overflow: 'auto',
      p: compact ? 0.5 : 1,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {messages.length === 0 ? (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height="100%"
        >
          <Typography color="textSecondary">
            No messages yet. Start the conversation!
          </Typography>
        </Box>
      ) : (
        <>
          {messages.map((message, index) => (
            <React.Fragment key={message.id}>
              {/* Date Separator */}
              {shouldShowDateSeparator(message, messages[index - 1]) && (
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  my: 3
                }}>
                  <Chip
                    label={formatMessageDate(message.created)}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      border: 'none',
                      '& .MuiChip-label': {
                        px: 2,
                        py: 0.5,
                      }
                    }}
                  />
                </Box>
              )}
              
              {/* Message */}
              <Box sx={{
                display: 'flex',
                mb: compact ? 0.5 : 1,
                justifyContent: message.author.id === user?.id ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end',
                px: compact ? 1 : 2,
              }}>
                {/* Avatar for other users (left side) */}
                {message.author.id !== user?.id && (
                  <Avatar
                    sx={{
                      width: compact ? 24 : 28,
                      height: compact ? 24 : 28,
                      mr: 1,
                      fontSize: compact ? '0.75rem' : '0.875rem'
                    }}
                  >
                    {message.author.username.charAt(0).toUpperCase()}
                  </Avatar>
                )}

                {/* Message Bubble */}
                <Box sx={{
                  maxWidth: '70%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.author.id === user?.id ? 'flex-end' : 'flex-start',
                }}>
                  {/* Message Content */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: compact ? 1 : 1.5,
                      backgroundColor: message.author.id === user?.id
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : '#f1f3f4',
                      color: message.author.id === user?.id ? 'white' : 'text.primary',
                      borderRadius: message.author.id === user?.id
                        ? '18px 18px 4px 18px'  // Sent message (right)
                        : '18px 18px 18px 4px', // Received message (left)
                      position: 'relative',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      background: message.author.id === user?.id
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : '#f1f3f4',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        wordBreak: 'break-word',
                        fontSize: compact ? '0.875rem' : '0.95rem',
                        lineHeight: 1.4,
                      }}
                    >
                      {message.body}
                    </Typography>
                  </Paper>

                  {/* Timestamp */}
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      mt: 0.5,
                      mx: 1,
                      opacity: 0.7,
                    }}
                  >
                    {formatMessageTime(message.created)}
                  </Typography>
                </Box>

                {/* Avatar for current user (right side) */}
                {message.author.id === user?.id && (
                  <Avatar
                    sx={{
                      width: compact ? 24 : 28,
                      height: compact ? 24 : 28,
                      ml: 1,
                      fontSize: compact ? '0.75rem' : '0.875rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    {message.author.username.charAt(0).toUpperCase()}
                  </Avatar>
                )}
              </Box>
            </React.Fragment>
          ))}
          
          {/* Typing Indicators */}
          {typingUsers.length > 0 && (
            <Box sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              px: compact ? 1 : 2,
              mb: 1,
            }}>
              <Avatar
                sx={{
                  width: compact ? 24 : 28,
                  height: compact ? 24 : 28,
                  mr: 1,
                  fontSize: compact ? '0.75rem' : '0.875rem'
                }}
              >
                {typingUsers[0]?.username?.charAt(0).toUpperCase()}
              </Avatar>

              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  backgroundColor: '#f1f3f4',
                  borderRadius: '18px 18px 18px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                  {typingUsers.map(user => user.username).join(', ')}
                  {typingUsers.length === 1 ? ' is' : ' are'} typing
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {[0, 1, 2].map((dot) => (
                    <Box
                      key={dot}
                      sx={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        backgroundColor: '#9ca3af',
                        animation: 'typing 1.4s infinite',
                        animationDelay: `${dot * 0.2}s`,
                        '@keyframes typing': {
                          '0%, 60%, 100%': { opacity: 0.3 },
                          '30%': { opacity: 1 },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default MessageList;
