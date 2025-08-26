// components/common/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = ({ size = 'large' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div
          className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizeClasses[size]}`}
        ></div>
        <p className="mt-4 text-gray-600">Loading Pet Society...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;