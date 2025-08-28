// components/auth/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BsMoon, BsSun } from 'react-icons/bs';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { mode, toggleTheme, theme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = await login(formData);

    if (result.success) {
      navigate('/');
    } else {
      setErrors(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
      style={{ backgroundColor: theme.colors.surface }}
    >
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full transition-all duration-200 hover:scale-110"
        style={{
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          border: `1px solid ${theme.colors.textSecondary}30`,
        }}
        title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
      >
        {mode === 'light' ? <BsMoon size={20} /> : <BsSun size={20} />}
      </button>

      <div
        className="max-w-md w-full space-y-8 p-8 rounded-2xl shadow-2xl"
        style={{
          backgroundColor: theme.mode === 'dark' ? '#1a1a1a' : theme.colors.background,
          border: `1px solid ${theme.colors.textSecondary}20`,
        }}
      >
        <div>
          <h2
            className="mt-6 text-center text-3xl font-extrabold"
            style={{ color: theme.colors.text }}
          >
            Sign in to Pet Society
          </h2>
          <p
            className="mt-2 text-center text-sm"
            style={{ color: theme.colors.textSecondary }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium hover:underline"
              style={{ color: theme.colors.primary }}
            >
              Sign up
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border rounded-t-md focus:outline-none focus:z-10 sm:text-sm"
                style={{
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: errors.email ? '#ef4444' : theme.colors.textSecondary + '50',
                  '::placeholder': { color: theme.colors.textSecondary }
                }}
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border rounded-b-md focus:outline-none focus:z-10 sm:text-sm"
                style={{
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: errors.password ? '#ef4444' : theme.colors.textSecondary + '50',
                }}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>
              )}
            </div>
          </div>

          {errors.non_field_errors && (
            <div
              className="rounded-md p-4"
              style={{ backgroundColor: theme.mode === 'dark' ? '#7f1d1d' : '#fef2f2' }}
            >
              <div
                className="text-sm"
                style={{ color: theme.mode === 'dark' ? '#fca5a5' : '#dc2626' }}
              >
                {errors.non_field_errors[0]}
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-all duration-200 hover:scale-105"
              style={{
                background: loading ? theme.colors.textSecondary : theme.gradients.primary,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;