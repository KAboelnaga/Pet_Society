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
import Dashboard from './pages/Dashboard';
import CategoriesPage from './pages/CategoriesPage';
import PostsPage from './pages/PostsPage';
import UsersPage from './pages/UsersPage';

// Chat components (global feature)
import PetSocietyChat from './components/Chat/PetSocietyChat';
import './App.css';

// Bootstrap imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

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
        
        {/* Admin routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/categories" element={<PrivateRoute><CategoriesPage /></PrivateRoute>} />
        <Route path="/posts" element={<PrivateRoute><PostsPage /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
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
