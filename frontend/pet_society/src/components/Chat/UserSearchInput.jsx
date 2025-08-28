import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Person as PersonIcon, Group as GroupIcon } from '@mui/icons-material';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const UserSearchInput = ({ 
  value, 
  onChange, 
  onUserSelect, 
  placeholder = "Search users...",
  error = false,
  helperText = "",
  multiple = false 
}) => {
  const [searchResults, setSearchResults] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const { user } = useAuth();

  // Load followed users when component mounts
  useEffect(() => {
    const loadFollowedUsers = async () => {
      try {
        // You'll need to implement this API endpoint
        const response = await chatAPI.getFollowedUsers();
        setFollowedUsers(response.data || []);
      } catch (error) {
        console.error('Error loading followed users:', error);
        setFollowedUsers([]);
      }
    };

    loadFollowedUsers();
  }, []);

  // Search users on input change
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim()) {
      setLoading(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          // You'll need to implement this API endpoint
          const response = await chatAPI.searchUsers(value.trim());
          setSearchResults(response.data || []);
        } catch (error) {
          console.error('Error searching users:', error);
          setSearchResults([]);
        } finally {
          setLoading(false);
        }
      }, 300); // Debounce for 300ms
    } else {
      setSearchResults([]);
      setLoading(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [value]);

  // Show/hide dropdown based on focus and results
  useEffect(() => {
    const shouldShow = value.trim() ? searchResults.length > 0 : followedUsers.length > 0;
    setShowDropdown(shouldShow);
  }, [value, searchResults, followedUsers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserClick = (selectedUser) => {
    if (multiple) {
      const isAlreadySelected = selectedUsers.some(u => u.username === selectedUser.username);
      if (!isAlreadySelected) {
        const newSelectedUsers = [...selectedUsers, selectedUser];
        setSelectedUsers(newSelectedUsers);
        onChange(''); // Clear input
        onUserSelect(newSelectedUsers);
      }
    } else {
      onChange(selectedUser.username);
      onUserSelect(selectedUser);
      setShowDropdown(false);
    }
  };

  const handleRemoveUser = (userToRemove) => {
    const newSelectedUsers = selectedUsers.filter(u => u.username !== userToRemove.username);
    setSelectedUsers(newSelectedUsers);
    onUserSelect(newSelectedUsers);
  };

  const displayUsers = value.trim() ? searchResults : followedUsers;

  return (
    <Box ref={dropdownRef} sx={{ position: 'relative', width: '100%' }}>
      {/* Selected Users Chips (for multiple selection) */}
      {multiple && selectedUsers.length > 0 && (
        <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {selectedUsers.map((user) => (
            <Chip
              key={user.username}
              label={user.username}
              onDelete={() => handleRemoveUser(user)}
              size="small"
              avatar={<Avatar src={user.image} sx={{ width: 20, height: 20 }} />}
            />
          ))}
        </Box>
      )}

      {/* Search Input */}
      <TextField
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        onFocus={() => setShowDropdown(true)}
        InputProps={{
          endAdornment: loading && <CircularProgress size={20} />,
        }}
      />

      {/* Dropdown */}
      {showDropdown && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1300,
            maxHeight: 300,
            overflow: 'auto',
            mt: 0.5,
          }}
        >
          <List dense>
            {!value.trim() && followedUsers.length > 0 && (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" color="text.secondary">
                      People you follow
                    </Typography>
                  }
                />
              </ListItem>
            )}
            
            {displayUsers.length === 0 && !loading && (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body2" color="text.secondary">
                      {value.trim() ? 'No users found' : 'No followed users'}
                    </Typography>
                  }
                />
              </ListItem>
            )}

            {displayUsers.map((user) => (
              <ListItem
                key={user.username}
                button
                onClick={() => handleUserClick(user)}
                disabled={multiple && selectedUsers.some(u => u.username === user.username)}
              >
                <ListItemAvatar>
                  <Avatar src={user.image} sx={{ width: 32, height: 32 }}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${user.first_name} ${user.last_name}`}
                  secondary={`@${user.username}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default UserSearchInput;
