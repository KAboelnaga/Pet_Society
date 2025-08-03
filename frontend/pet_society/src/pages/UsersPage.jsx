import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Avatar,
  useTheme as useMuiTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  Block as BlockIcon,
  AdminPanelSettings as AdminIcon,
  ArrowBack,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

const UsersPage = () => {
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/admin/users/');
      setUsers(response.data);
    } catch (error) {
      showSnackbar('Error fetching users', 'error');
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`/admin/users/?search=${searchTerm}`);
      setUsers(response.data);
    } catch (error) {
      showSnackbar('Error searching users', 'error');
    }
  };

  const handleToggleBlock = async (userId, currentBlockedStatus) => {
    try {
      await axios.patch(`/admin/users/${userId}/update/`, {
        is_blocked: !currentBlockedStatus,
      });
      showSnackbar(`User ${currentBlockedStatus ? 'unblocked' : 'blocked'} successfully`);
      fetchUsers();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Error updating user', 'error');
    }
  };

  const handleToggleAdmin = async (userId, currentAdminStatus) => {
    try {
      await axios.patch(`/admin/users/${userId}/update/`, {
        is_admin: !currentAdminStatus,
      });
      showSnackbar(`User ${currentAdminStatus ? 'demoted' : 'promoted'} successfully`);
      fetchUsers();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Error updating user', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const canModifyUser = (user) => {
    // Superuser can modify anyone
    if (currentUser?.is_superuser) return true;
    
    // Regular admin can't modify other admins or superusers
    if (user.is_admin || user.is_superuser) return false;
    
    // Regular admin can modify regular users
    return true;
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => navigate('/')}
              sx={{ mr: { xs: 1, sm: 2 } }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
              Users Management
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: { xs: 1, sm: 2, md: 3, lg: 4 }, py: { xs: 2, sm: 3, md: 4 } }}>
        {/* Search Bar */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            mb: { xs: 2, sm: 3 }, 
            borderRadius: 3,
            background: theme.palette.background.search,
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Paper>

        {/* Users Table */}
        <Paper 
          elevation={0} 
          sx={{ 
            width: '100%', 
            overflow: 'hidden',
            borderRadius: 3,
          }}
        >
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Posts</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Joined</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar 
                          sx={{ 
                            mr: 2, 
                            width: { xs: 32, sm: 40 }, 
                            height: { xs: 32, sm: 40 },
                            bgcolor: user.is_admin ? 'primary.main' : 'grey.500',
                          }}
                        >
                          {user.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {user.username}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}>
                            {user.first_name} {user.last_name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}>
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {user.is_superuser ? (
                        <Chip label="Super Admin" color="error" size="small" sx={{ fontWeight: 'bold', fontSize: { xs: '0.625rem', sm: '0.75rem' } }} />
                      ) : user.is_admin ? (
                        <Chip label="Admin" color="primary" size="small" sx={{ fontWeight: 'bold', fontSize: { xs: '0.625rem', sm: '0.75rem' } }} />
                      ) : (
                        <Chip label="User" color="default" size="small" sx={{ fontWeight: 'bold', fontSize: { xs: '0.625rem', sm: '0.75rem' } }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_blocked ? 'Blocked' : 'Active'}
                        color={user.is_blocked ? 'error' : 'success'}
                        size="small"
                        sx={{ fontWeight: 'bold', fontSize: { xs: '0.625rem', sm: '0.75rem' } }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, fontSize: { xs: '0.625rem', sm: '0.75rem' } }}>
                        {user.posts_count}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        {/* Block/Unblock */}
                        {canModifyUser(user) && (
                          <IconButton
                            size="small"
                            onClick={() => handleToggleBlock(user.id, user.is_blocked)}
                            color={user.is_blocked ? 'success' : 'error'}
                            title={user.is_blocked ? 'Unblock User' : 'Block User'}
                            sx={{
                              '&:hover': {
                                backgroundColor: user.is_blocked ? 'success.light' : 'error.light',
                                color: 'white',
                              },
                            }}
                          >
                            <BlockIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                          </IconButton>
                        )}
                        
                        {/* Promote/Demote */}
                        {canModifyUser(user) && (
                          <IconButton
                            size="small"
                            onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                            color={user.is_admin ? 'warning' : 'primary'}
                            title={user.is_admin ? 'Demote from Admin' : 'Promote to Admin'}
                            sx={{
                              '&:hover': {
                                backgroundColor: user.is_admin ? 'warning.light' : 'primary.light',
                                color: 'white',
                              },
                            }}
                          >
                            <AdminIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersPage; 