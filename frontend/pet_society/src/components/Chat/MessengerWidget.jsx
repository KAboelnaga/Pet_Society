import { useState, useEffect } from 'react';
import {
  Box,
  Fab,
  Badge,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  Add as AddIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import ChatWindow from './ChatWindow';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MessengerWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatWindows, setChatWindows] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [newChatUsername, setNewChatUsername] = useState('');
  
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      const response = await chatAPI.getChatGroups();
      setConversations(response.data);
      
      // Calculate unread count (you'll need to implement this in backend)
      const unread = response.data.reduce((count, conv) => count + (conv.unread_count || 0), 0);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const openChatWindow = (conversation) => {
    // Check if chat window is already open
    const existingWindow = chatWindows.find(window => window.id === conversation.id);
    if (existingWindow) {
      // Focus existing window
      return;
    }

    // Add new chat window
    const newWindow = {
      id: conversation.id,
      conversation,
      isMinimized: false,
    };
    
    setChatWindows(prev => [...prev, newWindow]);
  };

  const closeChatWindow = (windowId) => {
    setChatWindows(prev => prev.filter(window => window.id !== windowId));
  };

  const minimizeChatWindow = (windowId) => {
    setChatWindows(prev => 
      prev.map(window => 
        window.id === windowId 
          ? { ...window, isMinimized: !window.isMinimized }
          : window
      )
    );
  };

  const handleStartNewChat = async () => {
    if (newChatUsername.trim()) {
      try {
        // Parse usernames (split by comma and clean up)
        const usernames = newChatUsername
          .split(',')
          .map(name => name.trim())
          .filter(name => name.length > 0);

        let chatData;

        if (usernames.length === 1) {
          // Single user = Private chat
          chatData = {
            name: `private-${Date.now()}`,
            is_private: true,
            invite_user: usernames[0],
          };
        } else {
          // Multiple users = Group chat
          chatData = {
            name: `Group with ${usernames.join(', ')}`,
            is_private: false,
            invite_users: usernames, // Send array for multiple users
          };
        }

        const response = await chatAPI.createChatGroup(chatData);
        const newConversation = response.data;
        setConversations(prev => [newConversation, ...prev]);
        openChatWindow(newConversation);

        setNewChatUsername('');
        setNewChatDialogOpen(false);
      } catch (error) {
        console.error('Error starting new chat:', error);
        // You can add error handling here (show toast, etc.)
      }
    }
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Offline';
    const now = new Date();
    const lastSeen = new Date(timestamp);
    const diffMinutes = Math.floor((now - lastSeen) / (1000 * 60));

    if (diffMinutes < 1) return 'Active now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const getConversationName = (conversation) => {
    if (conversation.is_private) {
      // For private chats, show the other user's name
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

  const getConversationAvatar = (conversation) => {
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

  return (
    <>
      {/* Floating Chat Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
        }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <Fab
            color="primary"
            onClick={() => setIsOpen(true)}
            sx={{
              width: 56,
              height: 56,
              background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #e11d48 50%, #f59e0b 100%)',
                transform: 'scale(1.05)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ChatIcon sx={{ fontSize: 24 }} />
          </Fab>
        </Badge>
      </Box>

      {/* Chat Drawer/Modal */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: isMobile ? '100%' : 380,
            maxWidth: '100vw',
            borderRadius: isMobile ? 0 : '16px 0 0 16px',
            background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)',
          },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <AppBar
            position="static"
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: isMobile ? 0 : '16px 0 0 0',
            }}
          >
            <Toolbar sx={{ minHeight: '64px !important' }}>
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                Messages
              </Typography>
              <IconButton
                color="inherit"
                onClick={() => setIsMinimized(!isMinimized)}
                size="small"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%'
                  }
                }}
              >
                <MinimizeIcon />
              </IconButton>
              <IconButton
                color="inherit"
                onClick={() => setIsOpen(false)}
                size="small"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

          {!isMinimized && (
            <>
              {/* Search/New Chat */}
              <Box sx={{ p: 2, pb: 1 }}>
                <Chip
                  icon={<AddIcon />}
                  label="Start New Chat"
                  clickable
                  color="primary"
                  variant="filled"
                  sx={{
                    width: '100%',
                    height: 40,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 500,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    },
                    '& .MuiChip-icon': {
                      color: 'white'
                    }
                  }}
                  onClick={() => setNewChatDialogOpen(true)}
                />
              </Box>

              <Divider />

              {/* Conversations List */}
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <List sx={{ p: 0 }}>
                  {conversations.map((conversation) => (
                    <ListItem
                      key={conversation.id}
                      button
                      onClick={() => openChatWindow(conversation)}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        mx: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(103, 126, 234, 0.08)',
                          transform: 'translateX(4px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            conversation.online_count > 0 ? (
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: '#4ade80',
                                  border: '2px solid white',
                                }}
                              />
                            ) : null
                          }
                        >
                          <Avatar
                            src={getConversationAvatar(conversation)}
                            sx={{
                              width: 48,
                              height: 48,
                              bgcolor: conversation.is_private
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                              fontSize: '1.2rem',
                              fontWeight: 600,
                            }}
                          >
                            {typeof getConversationAvatar(conversation) === 'string'
                              ? getConversationAvatar(conversation)
                              : null}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={getConversationName(conversation)}
                        secondary={
                          conversation.last_message
                            ? `${conversation.last_message.body}`
                            : 'Start a conversation'
                        }
                        primaryTypographyProps={{
                          fontWeight: conversation.unread_count ? 600 : 500,
                          fontSize: '0.95rem',
                          color: conversation.unread_count ? '#1f2937' : '#374151',
                        }}
                        secondaryTypographyProps={{
                          noWrap: true,
                          fontSize: '0.85rem',
                          color: '#6b7280',
                          fontWeight: conversation.unread_count ? 500 : 400,
                        }}
                      />
                      {conversation.unread_count > 0 && (
                        <Box
                          sx={{
                            minWidth: 20,
                            height: 20,
                            borderRadius: '10px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            px: conversation.unread_count > 9 ? 0.5 : 0,
                          }}
                        >
                          {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                        </Box>
                      )}
                    </ListItem>
                  ))}
                </List>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      {/* Chat Windows */}
      {chatWindows.map((window, index) => (
        <ChatWindow
          key={window.id}
          conversation={window.conversation}
          isMinimized={window.isMinimized}
          position={index}
          onClose={() => closeChatWindow(window.id)}
          onMinimize={() => minimizeChatWindow(window.id)}
        />
      ))}

      {/* New Chat Dialog */}
      <Dialog
        open={newChatDialogOpen}
        onClose={() => setNewChatDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Start New Chat</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            fullWidth
            variant="outlined"
            value={newChatUsername}
            onChange={(e) => setNewChatUsername(e.target.value)}
            helperText="Enter username for private chat, or multiple usernames separated by commas for group chat (e.g., 'alice, bob, khalifa')"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleStartNewChat();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewChatDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleStartNewChat}
            variant="contained"
            disabled={!newChatUsername.trim()}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Start Chat
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MessengerWidget;
