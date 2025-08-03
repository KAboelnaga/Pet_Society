import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { LockOutlined, LightMode, DarkMode } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const { mode, toggleTheme, theme } = useTheme();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  // Show loading if checking authentication
  if (authLoading) {
    return null; // This will be handled by the App component
  }

  // Don't render login page if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: theme.palette.background.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 1, sm: 2, md: 4 },
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* Theme Toggle Button */}
      <IconButton
        onClick={toggleTheme}
        sx={{
          position: 'absolute',
          top: { xs: 10, sm: 20 },
          right: { xs: 10, sm: 20 },
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        {mode === 'light' ? <DarkMode /> : <LightMode />}
      </IconButton>

      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 500, md: 600, lg: 700 },
          mx: 'auto',
        }}
      >
        <Card
          elevation={24}
          sx={{
            borderRadius: { xs: 2, sm: 4 },
            overflow: 'hidden',
            background: theme.palette.background.card,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
            width: '100%',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: mode === 'light' 
                ? 'linear-gradient(135deg, #1976d2, #42a5f5)'
                : 'linear-gradient(135deg, #1a1a2e, #16213e)',
              color: 'white',
              p: { xs: 2, sm: 3, md: 4 },
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: { xs: 50, sm: 60, md: 80 },
                height: { xs: 50, sm: 60, md: 80 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography sx={{ fontSize: { xs: 24, sm: 30, md: 40 } }}>
                🐾
              </Typography>
            </Box>
            
            <Typography 
              component="h1" 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem', lg: '2.125rem' }
              }}
            >
              Pet Society
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                opacity: 0.9,
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' }
              }}
            >
              Admin Dashboard
            </Typography>
          </Box>

          {/* Login Form */}
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Box
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '50%',
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <LockOutlined sx={{ color: 'white', fontSize: { xs: 24, sm: 28 } }} />
              </Box>
              
              <Typography 
                component="h2" 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                  color: theme.palette.text.primary,
                }}
              >
                Admin Login
              </Typography>
              
              <Typography 
                variant="body2" 
                color="text.secondary" 
                align="center"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}
              >
                Sign in to access the admin dashboard
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  height: { xs: 44, sm: 48, md: 56 },
                  borderRadius: 2,
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.1rem' },
                  fontWeight: 'bold',
                  background: mode === 'light'
                    ? 'linear-gradient(135deg, #1976d2, #42a5f5)'
                    : 'linear-gradient(135deg, #90caf9, #42a5f5)',
                  '&:hover': {
                    background: mode === 'light'
                      ? 'linear-gradient(135deg, #1565c0, #1976d2)'
                      : 'linear-gradient(135deg, #42a5f5, #1976d2)',
                  },
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Box>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' } }}
              >
                Secure access to Pet Society administration
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default LoginPage; 