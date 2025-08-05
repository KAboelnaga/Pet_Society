import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Group as GroupIcon,
  Lock as LockIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import webSocketService from '../../services/websocket';
import { chatAPI } from '../../services/api';

const ChatRoom = ({ room, onRoomUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [userListOpen, setUserListOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (room) {
      loadMessages();
      connectToRoom();
    }

    return () => {
      webSocketService.disconnect();
    };
  }, [room]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getMessages(room.id);
      setMessages(response.data.reverse()); // Reverse to show oldest first
    } catch (error) {
      console.error('Error loading messages:', error);
      // For demo purposes, set empty messages if API fails
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const connectToRoom = () => {
    // Set up WebSocket event handlers
    const unsubscribeMessage = webSocketService.onMessage((data) => {
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        const messageExists = prev.some(msg => msg.id === data.message_id);
        if (messageExists) {
          return prev;
        }

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

    // Connect to WebSocket
    webSocketService.connect(room.name);

    // Cleanup function
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
      // Fallback to HTTP API if WebSocket is not connected
      chatAPI.sendMessage(room.id, message)
        .then(() => loadMessages())
        .catch(error => console.error('Error sending message:', error));
    }
    // Don't add message locally - let it come back through WebSocket
    // This prevents duplication
  };

  const handleTyping = (isTyping) => {
    webSocketService.sendTypingIndicator(isTyping);
  };

  const handleInviteUser = async () => {
    if (inviteUsername.trim()) {
      try {
        await chatAPI.inviteUser(room.id, inviteUsername.trim());
        setInviteUsername('');
        setInviteDialogOpen(false);
        // Optionally show success message
      } catch (error) {
        console.error('Error inviting user:', error);
        // Optionally show error message
      }
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'success';
      case 'connecting': return 'warning';
      case 'disconnected': return 'error';
      default: return 'default';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      default: return 'Unknown';
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Room Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          {room.is_private ? <LockIcon /> : <GroupIcon />}
          <Typography variant="h6">{room.name}</Typography>
          <Chip 
            label={getConnectionStatusText()} 
            color={getConnectionStatusColor()}
            size="small"
          />
        </Box>
        
        <Box display="flex" alignItems="center" gap={1}>
          <Chip
            label={`${onlineUsers.length} online`}
            color="success"
            size="small"
          />
          <IconButton
            onClick={() => setInviteDialogOpen(true)}
            size="small"
            title="Invite User"
          >
            <PersonAddIcon />
          </IconButton>
          <IconButton
            onClick={() => setUserListOpen(true)}
            size="small"
            title="Show Users"
          >
            <PeopleIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Messages Area */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <MessageList 
          messages={messages}
          typingUsers={typingUsers}
          loading={loading}
        />
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
        <MessageInput 
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          disabled={connectionStatus !== 'connected'}
        />
      </Box>

      {/* User List Drawer */}
      <Drawer
        anchor="right"
        open={userListOpen}
        onClose={() => setUserListOpen(false)}
      >
        <UserList
          onlineUsers={onlineUsers}
          onClose={() => setUserListOpen(false)}
        />
      </Drawer>

      {/* Invite User Dialog */}
      <Dialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Invite User to {room.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            fullWidth
            variant="outlined"
            value={inviteUsername}
            onChange={(e) => setInviteUsername(e.target.value)}
            helperText="Enter the username of the person you want to invite"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleInviteUser();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleInviteUser}
            variant="contained"
            disabled={!inviteUsername.trim()}
          >
            Invite
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatRoom;
