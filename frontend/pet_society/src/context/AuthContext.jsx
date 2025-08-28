// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, setAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Set token in axios headers first
          setAuthToken(token);
          // Parse saved user data
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);

          // Optionally verify token is still valid by fetching fresh profile
          // But don't fail if this request fails - use cached user data
          try {
            const response = await authAPI.getProfile();
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          } catch (profileError) {
            console.warn('Profile refresh failed, using cached user data:', profileError);
            // Keep using cached user data, don't logout
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          // Only clear auth if we can't parse saved data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setAuthToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { user, token } = response.data;
      
      setAuthToken(token);
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data || { message: 'Login failed' }
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data;
      
      setAuthToken(token);
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data || { message: 'Registration failed' }
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};