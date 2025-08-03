import { Box, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';

const LoadingScreen = () => {
  const { theme } = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: theme.palette.background.gradient,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
      }}
    >
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          width: 80,
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography sx={{ fontSize: 40 }}>
          🐾
        </Typography>
      </Box>
      
      <CircularProgress 
        size={60} 
        thickness={4}
        sx={{ 
          color: 'white',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      
      <Typography 
        variant="h6" 
        sx={{ 
          color: 'white', 
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        Loading Pet Society...
      </Typography>
      
      <Typography 
        variant="body2" 
        sx={{ 
          color: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
        }}
      >
        Please wait while we check your session
      </Typography>
    </Box>
  );
};

export default LoadingScreen; 