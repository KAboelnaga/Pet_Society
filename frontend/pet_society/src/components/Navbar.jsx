import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../contexts/ChatContext";
import { useTheme } from "../context/ThemeContext";
import { BsSun, BsMoon } from "react-icons/bs";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadCount, toggleMessenger } = useChat();
  const { mode, toggleTheme, theme } = useTheme();

  const handleLogout = async () => {
    await logout();
  };


  if (!isAuthenticated) {
    return null; // Don't show navbar if not authenticated
  }

  return (
    <nav
      className="border-b shadow-sm transition-all duration-300"
      style={{
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.textSecondary + '30',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-bold transition-all duration-200 hover:scale-105 no-underline"
              style={{
                color: theme.colors.text,
                textDecoration: 'none',
              }}
            >
              🐾 Pet Society
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {/* Chat Button */}
            <button
              onClick={toggleMessenger}
              className="relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              style={{
                color: theme.colors.text,
                backgroundColor: 'transparent',
              }}
            >
              {/* Chat Icon */}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>Chat</span>
              {/* Unread Badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* User info and logout */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <Link
                  to={`/profile/${user.username}`}
                  className="transition-all duration-200 hover:scale-105 no-underline"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="flex items-center space-x-2">
                    {user.image && (
                      <img
                        src={user.image}
                        alt={user.first_name}
                        className="w-8 h-8 rounded-full object-cover transition-all duration-200 hover:ring-2 hover:ring-blue-300"
                      />
                    )}
                    <span
                      className="text-sm font-medium transition-colors duration-200"
                      style={{ color: theme.colors.text }}
                    >
                      {user.first_name} {user.last_name}
                    </span>
                  </div>
                 </Link>
                  {/* i need to make it appear if the user is admin or super admin not only super admin */}
                  {(user?.is_superuser || user?.is_admin) && (
                    <div className="flex items-center">
                      <Link
                        to="/dashboard"
                        className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg no-underline"
                        style={{
                          background: theme.gradients.primary,
                          color: 'white',
                          textDecoration: 'none',
                        }}
                      >
                        Admin Panel
                      </Link>
                    </div>
                  )}

                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md transition-all duration-200 hover:scale-110"
                  style={{
                    color: theme.colors.text,
                    backgroundColor: theme.colors.surface,
                    border: `1px solid ${theme.colors.textSecondary}30`,
                  }}
                  title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
                >
                  {mode === 'light' ? <BsMoon size={18} /> : <BsSun size={18} />}
                </button>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: theme.colors.danger,
                    color: 'white',
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
