import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Divider,
  Badge,
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';

const UserList = ({ onlineUsers, onClose }) => {
  return (
    <Box sx={{ width: 300, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">Online Users</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* User List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {onlineUsers.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No users online
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {onlineUsers.map((user) => (
              <React.Fragment key={user.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      color="success"
                    >
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1">
                        {user.username}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="success.main">
                        Online
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="textSecondary" align="center">
          {onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online
        </Typography>
      </Box>
    </Box>
  );
};

export default UserList;
