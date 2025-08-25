import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const ChatContainer = () => {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Pet Society Chat
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {user?.username || 'User'}
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3,
        textAlign: 'center'
      }}>
        <Typography variant="h4" gutterBottom color="primary">
          🐾 Pet Society Chat
        </Typography>
        <Typography variant="h6" gutterBottom color="textSecondary">
          Connect with fellow pet lovers
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 600, mb: 3 }}>
          Use the floating chat button in the bottom right corner to start conversations,
          create group chats, or message other users directly. Your chat experience is
          now integrated seamlessly into the Pet Society platform!
        </Typography>

        <Box sx={{
          mt: 2,
          p: 2,
          bgcolor: 'info.light',
          borderRadius: 2,
          maxWidth: 500
        }}>
          <Typography variant="body2" color="info.contrastText">
            💬 <strong>How to use:</strong><br/>
            • Click the blue chat button (bottom right) to see all conversations<br/>
            • Start new chats or join existing groups<br/>
            • Real-time messaging with notifications<br/>
            • Multiple chat windows like Messenger
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatContainer;
