import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link

 } from 'react-router-dom';
const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (!isAuthenticated) {
    return null; // Don't show navbar if not authenticated
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link to='/'>
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Pet Society</h1>
            </div>
          </Link>
          {/* User info and logout */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <Link to={`/profile/${user.username}`}>
                <div className="flex items-center space-x-2">
                  {user.image && (
                    <img
                      src={user.image}
                      alt={user.first_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {user.first_name} {user.last_name}
                  </span>
                </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
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
