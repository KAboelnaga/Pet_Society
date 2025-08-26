import React from 'react';
import HomePage from './pages/HomePage';
import PostDetail from './components/PostDetail';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login'
import Register from './components/auth/Register';
import LoadingSpinner from './components/LoadingSpinner';
import {UserProfile} from './components/profile/UserProfile';
import UserProfileEdit from './components/profile/UserProfileEdit';
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
        <Route path='/profile/:username' element={<PrivateRoute><UserProfile /></PrivateRoute>} />
        <Route path='/profile/:username/update' element={<PrivateRoute><UserProfileEdit /></PrivateRoute>} />
        <Route path="/posts/:id" element={<PrivateRoute><PostDetail /></PrivateRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>

  );
}
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
