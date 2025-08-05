import { useState, useEffect, useCallback } from 'react';
import {
  Snackbar,
  Alert,
  Avatar,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Reply as ReplyIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const NotificationSystem = ({ onMessageClick }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const showNotification = useCallback((message, conversation) => {
    // Don't show notification for own messages
    if (message.author.id === user?.id) return;

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(
        `${message.author.username} - ${conversation.name}`,
        {
          body: message.body,
          icon: '/favicon.ico', // You can use user avatar here
          tag: `chat-${conversation.id}`,
          requireInteraction: false,
        }
      );

      notification.onclick = () => {
        window.focus();
        onMessageClick?.(conversation, message);
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }

    // In-app notification
    const inAppNotification = {
      id: Date.now(),
      message,
      conversation,
      timestamp: new Date(),
    };

    setNotifications(prev => [...prev, inAppNotification]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== inAppNotification.id));
    }, 5000);
  }, [user?.id, onMessageClick]);

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleNotificationClick = (notification) => {
    onMessageClick?.(notification.conversation, notification.message);
    removeNotification(notification.id);
  };

  // Expose the showNotification function
  useEffect(() => {
    window.showChatNotification = showNotification;
    return () => {
      delete window.showChatNotification;
    };
  }, [showNotification]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: 400,
      }}
    >
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ position: 'relative', mb: 1 }}
        >
          <Alert
            severity="info"
            variant="filled"
            sx={{
              width: '100%',
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.9,
              },
            }}
            onClick={() => handleNotificationClick(notification)}
            action={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton
                  size="small"
                  color="inherit"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNotificationClick(notification);
                  }}
                >
                  <ReplyIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="inherit"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            }
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{ width: 32, height: 32 }}
                src={notification.message.author.image}
              >
                {notification.message.author.username.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                  {notification.message.author.username}
                </Typography>
                <Typography variant="body2" noWrap sx={{ opacity: 0.9 }}>
                  {notification.message.body}
                </Typography>
              </Box>
            </Box>
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
};

export default NotificationSystem;
