// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',
  BACKEND_URL: 'http://localhost:8000',
  WEBSOCKET_URL: 'ws://localhost:8000/ws',
};

// Helper function to convert relative media URLs to absolute URLs
export const getAbsoluteImageUrl = (relativeUrl) => {
  if (!relativeUrl) return null;
  
  // If it's already an absolute URL, return as is
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  
  // Convert relative URL to absolute URL pointing to Django backend
  return `${API_CONFIG.BACKEND_URL}${relativeUrl}`;
};
