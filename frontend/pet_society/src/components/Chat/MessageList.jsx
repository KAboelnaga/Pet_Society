import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import Message from './Message';

const MessageList = ({ 
  messages, 
  typingUsers, 
  loading, 
  loadingOlder = false, 
  hasMoreMessages = true, 
  compact = false 
}) => {
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
    <Box 
      sx={{
        flex: 1,
        p: compact ? 0.5 : 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
      }}
    >
      {/* Loading older messages indicator */}
      {loadingOlder && (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center"
          py={2}
        >
          <CircularProgress size={20} />
          <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
            Loading older messages...
          </Typography>
        </Box>
      )}
      
      {/* No more messages indicator */}
      {!hasMoreMessages && messages.length > 0 && (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center"
          py={1}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
            Beginning of conversation
          </Typography>
        </Box>
      )}
      
      {messages.length === 0 && !loading ? (
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
              <Message
                message={message}
                isOwnMessage={message.author.id === user?.id}
                formatMessageTime={formatMessageTime}
              />
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
