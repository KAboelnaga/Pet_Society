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
} from '@mui/icons-material';
import ChatWindow from './ChatWindow';
import { chatAPI } from '../../services/api';
import globalWebSocketService from '../../services/globalWebSocket';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../contexts/ChatContext';

const MessengerWidget = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [newChatUsername, setNewChatUsername] = useState('');

  const { user } = useAuth();
  const {
    conversations,
    activeChats,
    isMessengerOpen,
    toggleMessenger,
    loadConversations,
    markAsRead,
    openChat,
    closeChat,
    minimizeChat,
    startPrivateChat
  } = useChat(); // Use conversations and activeChats from ChatContext
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Effect to ensure component re-renders when ChatContext conversations change
  useEffect(() => {
    // Component will re-render when conversations change
  }, [conversations]);

  useEffect(() => {
    if (user) {
      // First load conversations
      loadConversations().then(() => {
        // After loading conversations, mark active chats' messages as read
        const activeChats = JSON.parse(localStorage.getItem('activeChats') || '[]');
        activeChats.forEach(chatId => {
          chatAPI.markAsRead(chatId).catch(error => {
            console.error('Error marking messages as read:', error);
          });
        });
      });

      // Only listen for new chat notifications (ChatContext handles message notifications)
      const unsubscribeNewChat = globalWebSocketService.onNewChat(() => {
        loadConversations();
      });

      return () => {
        unsubscribeNewChat();
      };
    }
  }, [user, loadConversations, markAsRead]);

  const openChatWindow = async (conversation) => {
    openChat(conversation);
  };

      const [errorMessage, setErrorMessage] = useState('');

      const handleStartNewChat = async () => {
          setErrorMessage(''); // Reset error message
    if (newChatUsername.trim()) {
      try {
        // Parse usernames (split by comma and clean up)
        const usernames = newChatUsername
          .split(',')
          .map(name => name.trim())
          .filter(name => name.length > 0);

        if (usernames.length === 1) {
          // Single user = Private chat
          const targetUsername = usernames[0];

          // Check if private chat already exists with this user
          const existingPrivateChat = conversations.find(conv => {
            if (!conv.is_private) return false;

            // Check if this user is in the members
            const otherUser = conv.members?.find(member => member.id !== user?.id);
            if (otherUser && otherUser.username === targetUsername) {
              return true;
            }

            // Fallback: check invite_user field
            if (conv.invite_user === targetUsername) {
              return true;
            }

            // Check last message author as fallback
            if (conv.last_message && conv.last_message.author === targetUsername) {
              return true;
            }

            return false;
          });

          if (existingPrivateChat) {
            // Open existing private chat instead of creating new one
            console.log('Private chat already exists, opening existing chat');
            openChatWindow(existingPrivateChat);
            setNewChatUsername('');
            setNewChatDialogOpen(false);
            return;
          }

          // Create new private chat using ChatContext
          const newConversation = await startPrivateChat(targetUsername);
          openChat(newConversation);
        } else {
          // Multiple users = Group chat (always create new)
          const chatData = {
            name: `Group with ${usernames.join(', ')}`,
            is_private: false,
            invite_users: usernames,
          };

          const response = await chatAPI.createChatGroup(chatData);
          const newConversation = response.data;

          // Reload conversations to get updated data from backend
          loadConversations();

          openChatWindow(newConversation);
        }

        setNewChatUsername('');
        setNewChatDialogOpen(false);
      } catch (error) {
        console.error('Error starting new chat:', error);
        if (error.response && error.response.data && error.response.data.error) {
          setErrorMessage(error.response.data.error);
        } else {
          setErrorMessage('Failed to create chat. Please try again.');
        }
      }
    }
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
      {/* Chat Drawer/Modal */}
      <Drawer
        anchor="right"
        open={isMessengerOpen}
        onClose={toggleMessenger}
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
                onClick={toggleMessenger}
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
                      component="button"
                      onClick={() => {
                        openChatWindow(conversation);
                        // Hide the sidebar/drawer when clicking on a conversation
                        toggleMessenger();
                      }}
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
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: conversation.unread_count ? 600 : 500,
                            fontSize: '0.95rem',
                            color: conversation.unread_count ? '#1f2937' : '#374151',
                            mb: 0.5,
                          }}
                          noWrap
                        >
                          {getConversationName(conversation)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.85rem',
                            color: '#6b7280',
                            fontWeight: conversation.unread_count ? 500 : 400,
                          }}
                          noWrap
                        >
                          {conversation.last_message
                            ? `${conversation.last_message.body}`
                            : 'Start a conversation'}
                        </Typography>
                      </Box>
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
      {activeChats.map((chat, index) => (
        <ChatWindow
          key={chat.id}
          conversation={chat}
          isMinimized={chat.isMinimized || false}
          position={index}
          onClose={() => closeChat(chat.id)}
          onMinimize={() => minimizeChat(chat.id)}
        />
      ))}

      {/* New Chat Dialog */}
      <Dialog
        open={newChatDialogOpen}
        onClose={() => {
          setNewChatDialogOpen(false);
          setErrorMessage(''); // Clear error when dialog closes
        }}
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
            onChange={(e) => {
              setNewChatUsername(e.target.value);
              if (errorMessage) setErrorMessage(''); // Clear error when user types
            }}
            helperText={errorMessage || "Enter username for private chat, or multiple usernames separated by commas for group chat (e.g., 'alice, bob, khalifa')"}
            error={!!errorMessage}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleStartNewChat();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setNewChatDialogOpen(false);
            setErrorMessage(''); // Clear error when canceling
          }}>Cancel</Button>
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
