import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import webSocketService from '../../services/websocket';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ChatWindow = ({ conversation, isMinimized, position, onClose, onMinimize }) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const messagesEndRef = useRef(null);

  // Calculate position for stacking windows
  const windowWidth = 320;
  const windowSpacing = 10;
  const rightOffset = 20 + (position * (windowWidth + windowSpacing));

  useEffect(() => {
    if (conversation) {
      loadMessages();
      connectToRoom();
    }

    return () => {
      webSocketService.disconnect();
    };
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getMessages(conversation.id);
      setMessages(response.data.reverse());
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const connectToRoom = () => {
    const unsubscribeMessage = webSocketService.onMessage((data) => {
      setMessages(prev => {
        const messageExists = prev.some(msg => msg.id === data.message_id);
        if (messageExists) return prev;
        
        return [...prev, {
          id: data.message_id,
          body: data.message,
          author: { username: data.username, id: data.user_id },
          created: data.timestamp,
        }];
      });
    });

    const unsubscribeConnection = webSocketService.onConnection((status) => {
      setConnectionStatus(status);
    });

    const unsubscribeUserList = webSocketService.onUserListUpdate((users) => {
      setOnlineUsers(users);
    });

    const unsubscribeTyping = webSocketService.onTyping((data) => {
      if (data.is_typing) {
        setTypingUsers(prev => {
          if (!prev.find(user => user.id === data.user_id)) {
            return [...prev, { id: data.user_id, username: data.username }];
          }
          return prev;
        });
      } else {
        setTypingUsers(prev => prev.filter(user => user.id !== data.user_id));
      }
    });

    webSocketService.connect(conversation.name);

    return () => {
      unsubscribeMessage();
      unsubscribeConnection();
      unsubscribeUserList();
      unsubscribeTyping();
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (message) => {
    const success = webSocketService.sendMessage(message);
    if (!success) {
      chatAPI.sendMessage(conversation.id, message)
        .then(() => loadMessages())
        .catch(error => console.error('Error sending message:', error));
    }
  };

  const handleTyping = (isTyping) => {
    webSocketService.sendTypingIndicator(isTyping);
  };

  const getConversationName = () => {
    if (conversation.is_private) {
      const otherUser = conversation.members?.find(member => member.id !== user?.id);
      if (otherUser) {
        if (otherUser.first_name && otherUser.last_name) {
          return `${otherUser.first_name} ${otherUser.last_name}`;
        }
        return otherUser.username;
      }

      // Fallback: extract username from invite_user field
      if (conversation.invite_user) {
        return conversation.invite_user;
      }

      // Try to get from last message author (if it's not the current user)
      if (conversation.last_message && conversation.last_message.author !== user?.username) {
        return conversation.last_message.author;
      }

      // Last resort: show a generic name with some identifier
      return `Chat ${conversation.id}`;
    }
    return conversation.name;
  };

  const getConversationAvatar = () => {
    if (conversation.is_private) {
      const otherUser = conversation.members?.find(member => member.id !== user?.id);
      if (otherUser) {
        return otherUser.image || otherUser.username?.charAt(0).toUpperCase();
      }

      // Fallback for private chats without member info
      if (conversation.invite_user) {
        return conversation.invite_user.charAt(0).toUpperCase();
      }

      // Try to get from last message author
      if (conversation.last_message && conversation.last_message.author !== user?.username) {
        return conversation.last_message.author.charAt(0).toUpperCase();
      }

      return 'C'; // C for Chat
    }
    return conversation.name.charAt(0).toUpperCase();
  };

  const isOnline = () => {
    if (conversation.is_private) {
      const otherUser = conversation.members?.find(member => member.id !== user?.id);
      return onlineUsers.some(onlineUser => onlineUser.id === otherUser?.id);
    }
    return onlineUsers.length > 0;
  };

  if (isMobile) {
    // On mobile, don't show floating windows
    return null;
  }

  return (
    <Paper
      elevation={12}
      sx={{
        position: 'fixed',
        bottom: 20,
        right: rightOffset,
        width: windowWidth,
        height: isMinimized ? 'auto' : 520,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}
    >
      {/* Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          cursor: 'pointer',
          borderRadius: '16px 16px 0 0',
        }}
        onClick={onMinimize}
      >
        <Toolbar variant="dense" sx={{ minHeight: 56, px: 2 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              isOnline() ? (
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: '#4ade80',
                    border: '2px solid white',
                  }}
                />
              ) : null
            }
          >
            <Avatar
              src={getConversationAvatar()}
              sx={{
                width: 36,
                height: 36,
                mr: 1.5,
                bgcolor: conversation.is_private
                  ? 'rgba(255,255,255,0.2)'
                  : 'rgba(255,255,255,0.3)',
                fontSize: '1rem',
                fontWeight: 600,
                border: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              {typeof getConversationAvatar() === 'string'
                ? getConversationAvatar()
                : null}
            </Avatar>
          </Badge>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
              {getConversationName()}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
              {isOnline() ? 'Active now' : 'Last seen recently'}
            </Typography>
          </Box>

          <IconButton
            size="small"
            color="inherit"
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '50%'
              }
            }}
          >
            <MinimizeIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="inherit"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '50%'
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Chat Content */}
      <Collapse in={!isMinimized}>
        <Box sx={{ height: 464, display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>
          {/* Messages */}
          <Box sx={{ flex: 1, overflow: 'hidden', bgcolor: '#ffffff' }}>
            <MessageList
              messages={messages}
              typingUsers={typingUsers}
              loading={loading}
              compact={true}
            />
            <div ref={messagesEndRef} />
          </Box>

          {/* Message Input */}
          <Box sx={{
            borderTop: '1px solid #e5e7eb',
            bgcolor: '#ffffff',
            borderRadius: '0 0 16px 16px'
          }}>
            <MessageInput
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              disabled={connectionStatus !== 'connected'}
              compact={true}
            />
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ChatWindow;
