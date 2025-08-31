// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://petsociety-production.up.railway.app/api',
  BACKEND_URL: 'https://petsociety-production.up.railway.app',
  WEBSOCKET_URL: 'ws://https://petsociety-production.up.railway.app/ws',
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
