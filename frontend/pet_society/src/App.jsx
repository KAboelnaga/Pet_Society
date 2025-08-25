import React from 'react';
import HomePage from './pages/HomePage';
import PostDetail from './components/PostDetail';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/auth/Login'
import Register from './components/auth/Register';
import LoadingSpinner from './components/LoadingSpinner';
import Dashboard from './pages/Dashboard';
import CategoriesPage from './pages/CategoriesPage';
import PostsPage from './pages/PostsPage';
import UsersPage from './pages/UsersPage';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';



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
function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/posts/:id" element={<PrivateRoute><PostDetail /></PrivateRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        {/* Add more routes as needed */}

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
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
