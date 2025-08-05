
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PetSocietyChat from './components/Chat/PetSocietyChat';
import ChatContainer from './components/Chat/ChatContainer';
import Login from './components/Auth/Login';
import './App.css';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

// Main App Content Component
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Enable authentication flow with integrated chat
  return (
    <PetSocietyChat>
      <Box sx={{ height: '100vh', backgroundColor: 'background.default' }}>
        {isAuthenticated ? <ChatContainer /> : <Login />}
      </Box>
    </PetSocietyChat>
  );

  // Test components (uncomment for debugging if needed)
  // return (
  //   <Box sx={{ height: '100vh', backgroundColor: 'background.default' }}>
  //     <ChatTest />
  //   </Box>
  // );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
