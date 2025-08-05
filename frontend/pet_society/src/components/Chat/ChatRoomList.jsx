import { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  Badge,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Group as GroupIcon,
  Lock as LockIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';

const ChatRoomList = ({ 
  chatGroups, 
  selectedRoom, 
  onRoomSelect, 
  onCreateRoom, 
  onRefresh 
}) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [privateDialogOpen, setPrivateDialogOpen] = useState(false);
  const [privateUsername, setPrivateUsername] = useState('');

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      onCreateRoom({
        name: newRoomName.trim(),
        is_private: isPrivate,
      });
      setNewRoomName('');
      setIsPrivate(false);
      setCreateDialogOpen(false);
    }
  };

  const handleCreatePrivateChat = () => {
    if (privateUsername.trim()) {
      onCreateRoom({
        name: `private-${Date.now()}`,
        is_private: true,
        invite_user: privateUsername.trim(),
      });
      setPrivateUsername('');
      setPrivateDialogOpen(false);
    }
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Chat Rooms</Typography>
          <Box>
            <IconButton onClick={onRefresh} size="small">
              <RefreshIcon />
            </IconButton>
            <IconButton
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              size="small"
              color="primary"
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Chat Room List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {chatGroups.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No chat rooms available. Create one to get started!
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {chatGroups.map((group) => (
              <ListItem key={group.id} disablePadding>
                <ListItemButton
                  selected={selectedRoom?.id === group.id}
                  onClick={() => onRoomSelect(group)}
                  sx={{ 
                    py: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Primary content */}
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      {group.is_private ? <LockIcon fontSize="small" /> : <GroupIcon fontSize="small" />}
                      <Typography variant="subtitle1" noWrap>
                        {group.is_private && group.name.startsWith('private-')
                          ? `Private Chat ${group.name.split('-')[1]}`
                          : group.name}
                      </Typography>
                      {group.online_count > 0 && (
                        <Badge
                          badgeContent={group.online_count}
                          color="success"
                          variant="dot"
                        />
                      )}
                    </Box>

                    {/* Secondary content */}
                    {group.last_message && (
                      <Typography variant="body2" color="textSecondary" noWrap sx={{ mb: 0.5 }}>
                        {group.last_message.author}: {group.last_message.body}
                      </Typography>
                    )}

                    {/* Footer content */}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Chip
                        label={`${group.member_count} members`}
                        size="small"
                        variant="outlined"
                      />
                      {group.last_message && (
                        <Typography variant="caption" color="textSecondary">
                          {formatLastMessageTime(group.last_message.created)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Create Room Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Group Chat</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            variant="outlined"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            helperText="Enter a name for your group chat (e.g., 'Pet Lovers', 'Study Group')"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateRoom();
              }
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
            }
            label="Private Group (invite only)"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateRoom} 
            variant="contained"
            disabled={!newRoomName.trim()}
          >
            Create Group
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          setCreateDialogOpen(true);
          setMenuAnchor(null);
        }}>
          <ListItemIcon>
            <GroupIcon fontSize="small" />
          </ListItemIcon>
          Create Group Chat
        </MenuItem>
        <MenuItem onClick={() => {
          setPrivateDialogOpen(true);
          setMenuAnchor(null);
        }}>
          <ListItemIcon>
            <ChatIcon fontSize="small" />
          </ListItemIcon>
          Start Private Chat
        </MenuItem>
      </Menu>

      {/* Private Chat Dialog */}
      <Dialog
        open={privateDialogOpen}
        onClose={() => setPrivateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Start Private Chat</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            fullWidth
            variant="outlined"
            value={privateUsername}
            onChange={(e) => setPrivateUsername(e.target.value)}
            helperText="Enter the username of the person you want to chat with privately"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreatePrivateChat();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrivateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreatePrivateChat}
            variant="contained"
            disabled={!privateUsername.trim()}
          >
            Start Private Chat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatRoomList;
