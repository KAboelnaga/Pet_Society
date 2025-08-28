// components/auth/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BsMoon, BsSun } from 'react-icons/bs';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    bio: '',
    location: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const { mode, toggleTheme, theme } = useTheme();
  const navigate = useNavigate();

  // Helper function for input styling
  const getInputStyle = (hasError = false) => ({
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    borderColor: hasError ? '#ef4444' : theme.colors.textSecondary + '50',
  });

  const getLabelStyle = () => ({
    color: theme.colors.text,
  });

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

    const result = await register(formData);

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
            Join Pet Society
          </h2>
          <p
            className="mt-2 text-center text-sm"
            style={{ color: theme.colors.textSecondary }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium hover:underline"
              style={{ color: theme.colors.primary }}
            >
              Sign in
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium"
                  style={getLabelStyle()}
                >
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none sm:text-sm"
                  style={getInputStyle(!!errors.first_name)}
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name[0]}</p>
                )}
              </div>
              
              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium"
                  style={getLabelStyle()}
                >
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none sm:text-sm"
                  style={getInputStyle(!!errors.last_name)}
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name[0]}</p>
                )}
              </div>
            </div>
            
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium"
                style={getLabelStyle()}
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none sm:text-sm"
                style={getInputStyle(!!errors.username)}
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username[0]}</p>
              )}
            </div>
            
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium"
                style={getLabelStyle()}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none sm:text-sm"
                style={getInputStyle(!!errors.email)}
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
              )}
            </div>
            
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium"
                style={getLabelStyle()}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none sm:text-sm"
                style={getInputStyle(!!errors.password)}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>
              )}
            </div>
            
            <div>
              <label
                htmlFor="password_confirm"
                className="block text-sm font-medium"
                style={getLabelStyle()}
              >
                Confirm Password
              </label>
              <input
                id="password_confirm"
                name="password_confirm"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none sm:text-sm"
                style={getInputStyle(!!errors.password_confirm)}
                placeholder="Confirm Password"
                value={formData.password_confirm}
                onChange={handleChange}
              />
              {errors.password_confirm && (
                <p className="mt-1 text-sm text-red-600">{errors.password_confirm[0]}</p>
              )}
            </div>
            
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium"
                style={getLabelStyle()}
              >
                Location (Optional)
              </label>
              <input
                id="location"
                name="location"
                type="text"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none sm:text-sm"
                style={getInputStyle()}
                placeholder="Your location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium"
                style={getLabelStyle()}
              >
                Bio (Optional)
              </label>
              <textarea
                id="bio"
                name="bio"
                rows="3"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none sm:text-sm"
                style={getInputStyle()}
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={handleChange}
              />
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
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;