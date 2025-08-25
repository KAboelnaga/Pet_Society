import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';

// Main app components
import HomePage from './pages/HomePage';
import PostDetail from './components/PostDetail';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import LoadingSpinner from './components/LoadingSpinner';

// Chat components (global feature)
import PetSocietyChat from './components/Chat/PetSocietyChat';
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

function AppRoutes() {
  // Route protection components - now inside AuthProvider
  const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) {
      return <LoadingSpinner size="large"/>;
    }
    return isAuthenticated ? children : <Navigate to="/login" />;
  }

  const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) {
      return <LoadingSpinner size="large" />;
    }
    return !isAuthenticated ? children : <Navigate to="/" />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/posts/:id" element={<PrivateRoute><PostDetail /></PrivateRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PetSocietyChat>
          <AppRoutes />
        </PetSocietyChat>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
