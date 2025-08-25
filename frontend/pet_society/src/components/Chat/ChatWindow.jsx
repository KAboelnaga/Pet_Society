import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Calculate position for stacking windows
  const windowWidth = 320;
  const windowSpacing = 10;
  const rightOffset = 20 + (position * (windowWidth + windowSpacing));

  const loadMessages = useCallback(async (page = 1, beforeMessageId = null) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingOlder(true);
      }
      
      const options = { 
        page, 
        pageSize: 50,
        beforeMessageId 
      };
      
      const response = await chatAPI.getMessages(conversation.id, options);
      
      // The messages are already decrypted by the backend in the 'message' field
      const processedMessages = response.data.messages.map(msg => ({
        ...msg,
        body: msg.message // Use the decrypted message from the backend
      }));
      
      if (page === 1) {
        // First load - replace all messages
        setMessages(processedMessages.reverse());
        setCurrentPage(1);
      } else {
        // Loading older messages - prepend to existing messages
        setMessages(prev => [...processedMessages.reverse(), ...prev]);
        setCurrentPage(page);
      }
      
      setHasMoreMessages(response.data.has_more);
    } catch (error) {
      console.error('Error loading messages:', error);
      if (page === 1) {
        setMessages([]);
      }
    } finally {
      if (page === 1) {
        setLoading(false);
      } else {
        setLoadingOlder(false);
      }
    }
  }, [conversation.id]);

  const markMessagesAsRead = useCallback(async () => {
    try {
      await chatAPI.markAsRead(conversation.id);
      console.log('Messages marked as read for chat:', conversation.id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [conversation.id]);

  const connectToRoom = useCallback(() => {
    const unsubscribeMessage = webSocketService.onMessage(async (data) => {
      try {
        const { decryptMessage } = await import('../../utils/encryption');
        
        setMessages(prev => {
          const messageExists = prev.some(msg => msg.id === data.message_id);
          if (messageExists) return prev;
          
          // Decrypt the message if it's encrypted
          const decryptedBody = decryptMessage(data.message);
          
          return [...prev, {
            id: data.message_id,
            body: decryptedBody,
            author: { username: data.username, id: data.user_id },
            created: data.timestamp,
          }];
        });
      } catch (error) {
        console.error('Error handling message:', error);
      }
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
  }, [conversation.name]);

  useEffect(() => {
    if (conversation) {
      loadMessages();
      connectToRoom();
      markMessagesAsRead();
      
      // Mark chat as active when window opens
      webSocketService.markChatActive(conversation.id);

      // Add page unload handler
      const handleUnload = () => {
        // Don't mark chat as inactive on page refresh if it's actively open
        if (!isMinimized) {
          localStorage.setItem(`chat_${conversation.id}_wasActive`, 'true');
        }
      };

      window.addEventListener('beforeunload', handleUnload);

      // Mark chat as inactive when window closes
      return () => {
        if (!document.hidden) { // Only mark inactive if not page refresh
          webSocketService.markChatInactive(conversation.id);
        }
        webSocketService.disconnect();
        window.removeEventListener('beforeunload', handleUnload);
      };
    }
  }, [conversation, loadMessages, connectToRoom, markMessagesAsRead, isMinimized]);

  // Restore active state on component mount
  useEffect(() => {
    if (conversation?.id) {
      const wasActive = localStorage.getItem(`chat_${conversation.id}_wasActive`);
      if (wasActive === 'true') {
        webSocketService.markChatActive(conversation.id);
        localStorage.removeItem(`chat_${conversation.id}_wasActive`);
      }
    }
  }, [conversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle window minimize/maximize
  useEffect(() => {
    if (conversation?.id) {
      if (!isMinimized) {
        markMessagesAsRead();
        webSocketService.markChatActive(conversation.id);
      } else {
        webSocketService.markChatInactive(conversation.id);
      }
    }
  }, [conversation?.id, isMinimized, markMessagesAsRead]);

  const loadOlderMessages = async () => {
    if (loadingOlder || !hasMoreMessages || messages.length === 0) {
      return;
    }

    const container = messagesContainerRef.current;
    const scrollHeightBefore = container.scrollHeight;
    const scrollTopBefore = container.scrollTop;

    const oldestMessage = messages[0];
    const nextPage = currentPage + 1;
    
    await loadMessages(nextPage, oldestMessage.id);

    // Preserve scroll position after loading older messages
    setTimeout(() => {
      if (container) {
        const scrollHeightAfter = container.scrollHeight;
        const scrollHeightDifference = scrollHeightAfter - scrollHeightBefore;
        container.scrollTop = scrollTopBefore + scrollHeightDifference;
      }
    }, 0);
  };

  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    
    // Load older messages when scrolled to the top (within 10px)
    if (scrollTop <= 10 && hasMoreMessages && !loadingOlder && !loading) {
      loadOlderMessages();
    }
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

  const handleSendImage = async (imageFile) => {
    try {
      // Send image via API since WebSocket doesn't handle file uploads well
      await chatAPI.sendImageMessage(conversation.id, imageFile);
      // Reload messages to show the new image
      loadMessages();
    } catch (error) {
      console.error('Error sending image:', error);
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
          <Box 
            ref={messagesContainerRef}
            onScroll={handleScroll}
            sx={{ 
              flex: 1, 
              overflow: 'auto', 
              bgcolor: '#ffffff',
              // Custom scrollbar styling
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c1c1c1',
                borderRadius: '10px',
                '&:hover': {
                  background: '#a8a8a8',
                },
              },
            }}
          >
            <MessageList
              messages={messages}
              typingUsers={typingUsers}
              loading={loading}
              loadingOlder={loadingOlder}
              hasMoreMessages={hasMoreMessages}
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
              onSendImage={handleSendImage}
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
