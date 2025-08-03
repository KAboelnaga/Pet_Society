import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, // This is like a <div>
  AppBar, // This is like a <header> with navigation
  Toolbar, // This is like a <nav> inside the header
  Typography, // This is like <h1>, <h2>, <p> etc.
  Button, // This is like a <button>
  Grid, // This is like Bootstrap's row/col system
  Card, // This is like a <div> with background and shadow
  CardContent, // This is like the content inside the card
  IconButton, // This is like a <button> with an icon
  Menu, // This is like a dropdown menu
  MenuItem, // This is like <option> in the dropdown
  Avatar, // This is like a circular image
  Chip, // This is like a small colored badge
  Divider, // This is like a <hr> line
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  People as PeopleIcon,
  Article as ArticleIcon,
  AccountCircle,
  Logout,
  TrendingUp,
  LightMode,
  DarkMode,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme, theme } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/admin/dashboard/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Statistics Card Component (like a div with stats)
  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color}15, ${color}25)`,
        border: `1px solid ${color}30`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${color}40`,
        }
      }}
    >
      <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
        {/* Icon Circle */}
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: '50%',
            width: { xs: 50, sm: 60 },
            height: { xs: 50, sm: 60 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: `0 4px 12px ${color}40`,
          }}
        >
          {icon}
        </Box>
        
        {/* Value Number */}
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.text.primary, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
          {value}
        </Typography>
        
        {/* Title */}
        <Typography color="textSecondary" gutterBottom variant="h6" sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' } }}>
          {title}
        </Typography>
        
        {/* Subtitle */}
        {subtitle && (
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  // Navigation Card Component (like a clickable div)
  const NavigationCard = ({ title, icon, onClick, color = 'primary.main' }) => (
    <Card
      sx={{
        height: { xs: 120, sm: 140 },
        cursor: 'pointer',
        background: `linear-gradient(135deg, ${color}08, ${color}15)`,
        border: `1px solid ${color}20`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: `0 12px 30px ${color}30`,
          background: `linear-gradient(135deg, ${color}15, ${color}25)`,
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
        {/* Icon */}
        <Box
          sx={{
            color: color,
            fontSize: { xs: 36, sm: 48 },
            mb: 2,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        
        {/* Title */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' } }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    // Main Container (like <body> or main wrapper)
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      
      {/* Header/Navigation Bar */}
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2, md: 3 } }}>
          {/* Logo/Title Section */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
              🐾 Pet Society Admin Dashboard
            </Typography>
          </Box>
          
          {/* Right Side Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            {/* Theme Toggle Button */}
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              {mode === 'light' ? <DarkMode /> : <LightMode />}
            </IconButton>
            
            {/* User Role Badge */}
            <Chip
              label={user?.is_superuser ? 'Super Admin' : 'Admin'}
              color={user?.is_superuser ? 'error' : 'primary'}
              size="small"
              sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            />
            
            {/* User Menu Button */}
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
            >
              <Avatar sx={{ width: { xs: 32, sm: 36 }, height: { xs: 32, sm: 36 }, bgcolor: 'primary.main' }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
            
            {/* User Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled>
                <Typography variant="body2">
                  {user?.username}
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box sx={{ px: { xs: 1, sm: 2, md: 3, lg: 4 }, py: { xs: 2, sm: 3, md: 4 } }}>
        
        {/* Welcome Banner Section */}
        <Box 
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            mb: { xs: 2, sm: 3, md: 4 }, 
            textAlign: 'center',
            background: mode === 'light'
              ? 'linear-gradient(135deg, #1976d2, #42a5f5)'
              : 'linear-gradient(135deg, #1a1a2e, #16213e)',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
            Welcome back, {user?.username}! 👋
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' } }}>
            Manage your Pet Society platform from here
          </Typography>
        </Box>

        {/* Statistics Section */}
        {stats && (
          <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 }, borderRadius: 3, backgroundColor: theme.palette.background.paper }}>
            {/* Section Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TrendingUp sx={{ mr: 2, color: 'primary.main', fontSize: { xs: 24, sm: 28, md: 32 } }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }}>
                Platform Statistics
              </Typography>
            </Box>
            
            {/* Divider Line */}
            <Divider sx={{ mb: 3 }} />
            
            {/* Statistics Grid (like Bootstrap row/col) */}
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {/* Total Users Card */}
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Users"
                  value={stats.total_users}
                  icon={<PeopleIcon sx={{ color: 'white', fontSize: { xs: 20, sm: 24, md: 28 } }} />}
                  color="#1976d2"
                  subtitle="Registered users"
                />
              </Grid>
              
              {/* Total Posts Card */}
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Posts"
                  value={stats.total_posts}
                  icon={<ArticleIcon sx={{ color: 'white', fontSize: { xs: 20, sm: 24, md: 28 } }} />}
                  color="#2e7d32"
                  subtitle="Animal listings"
                />
              </Grid>
              
              {/* Categories Card */}
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Categories"
                  value={stats.total_categories}
                  icon={<CategoryIcon sx={{ color: 'white', fontSize: { xs: 20, sm: 24, md: 28 } }} />}
                  color="#ed6c02"
                  subtitle="Animal types"
                />
              </Grid>
              
              {/* Blocked Users Card */}
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Blocked Users"
                  value={stats.blocked_users}
                  icon={<PeopleIcon sx={{ color: 'white', fontSize: { xs: 20, sm: 24, md: 28 } }} />}
                  color="#d32f2f"
                  subtitle="Suspended accounts"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Quick Actions Section */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 3, backgroundColor: theme.palette.background.paper }}>
          {/* Section Header */}
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.text.primary, fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }}>
            Quick Actions
          </Typography>
          
          {/* Divider Line */}
          <Divider sx={{ mb: 3 }} />
          
          {/* Navigation Grid */}
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {/* Categories Navigation Card */}
            <Grid item xs={12} sm={6} md={3}>
              <NavigationCard
                title="Categories"
                icon={<CategoryIcon />}
                onClick={() => navigate('/categories')}
                color="#1976d2"
              />
            </Grid>
            
            {/* Users Navigation Card */}
            <Grid item xs={12} sm={6} md={3}>
              <NavigationCard
                title="Users"
                icon={<PeopleIcon />}
                onClick={() => navigate('/users')}
                color="#2e7d32"
              />
            </Grid>
            
            {/* Posts Navigation Card */}
            <Grid item xs={12} sm={6} md={3}>
              <NavigationCard
                title="Posts"
                icon={<ArticleIcon />}
                onClick={() => navigate('/posts')}
                color="#ed6c02"
              />
            </Grid>
            
            {/* Overview Navigation Card */}
            <Grid item xs={12} sm={6} md={3}>
              <NavigationCard
                title="Overview"
                icon={<DashboardIcon />}
                onClick={() => navigate('/')}
                color="#9c27b0"
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard; 