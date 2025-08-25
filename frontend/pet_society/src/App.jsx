
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import PetSocietyChat from './components/Chat/PetSocietyChat';
import ChatContainer from './components/Chat/ChatContainer';
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

// Main App Content Component - Pure Chat App
const AppContent = () => {
  return (
    <PetSocietyChat>
      <Box sx={{ height: '100vh', backgroundColor: 'background.default' }}>
        <ChatContainer />
      </Box>
    </PetSocietyChat>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
