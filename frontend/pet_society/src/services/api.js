import axios from 'axios';
import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to add CSRF token
api.interceptors.request.use(
  async (config) => {
    let csrfToken = getCookie('csrftoken');

    // If no CSRF token and not already requesting CSRF, try to get one
    if (!csrfToken && !config.url.includes('/users/csrf/')) {
      try {
        await axios.get('http://localhost:8000/api/users/csrf/', {
          withCredentials: true
        });
        csrfToken = getCookie('csrftoken');
      } catch (error) {
        console.warn('Could not get CSRF token:', error);
      }
    }

    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to get CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Chat API functions
export const chatAPI = {
  // Get all chat groups for the current user
  getChatGroups: () => api.get('/chats/groups/'),
  
  // Get a specific chat group with messages
  getChatGroup: (groupId) => api.get(`/chats/groups/${groupId}/`),
  
  // Create a new chat group
  createChatGroup: (data) => api.post('/chats/groups/', data),
  
  // Join a chat group
  joinChatGroup: (groupId) => api.post(`/chats/groups/${groupId}/join/`),
  
  // Leave a chat group
  leaveChatGroup: (groupId) => api.post(`/chats/groups/${groupId}/leave/`),
  
  // Get messages for a chat group
  getMessages: (groupId, options = {}) => {
    const { page = 1, pageSize = 50, beforeMessageId } = options;
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    
    if (beforeMessageId) {
      params.append('before_message_id', beforeMessageId.toString());
    }
    
    return api.get(`/chats/groups/${groupId}/messages/?${params.toString()}`);
  },
  
  // Send a message (fallback for non-WebSocket)
  sendMessage: (groupId, message) =>
    api.post(`/chats/groups/${groupId}/send_message/`, { body: message }),

  // Send an image message
  sendImageMessage: (groupId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return api.post(`/chats/groups/${groupId}/send_message/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Mark messages as read
  markAsRead: (groupId) =>
    api.post(`/chats/groups/${groupId}/mark_as_read/`),

  // Invite user to group
  inviteUser: (groupId, username) =>
    api.post(`/chats/groups/${groupId}/invite_user/`, { username: username }),
};

// User API functions
export const userAPI = {
  // Get current user info
  getCurrentUser: () => api.get('/users/me/'),

  // Login
  login: (credentials) => api.post('/users/login/', credentials),

  // Logout
  logout: () => api.post('/users/logout/'),

  // Register
  register: (userData) => api.post('/users/register/', userData),

  // Get CSRF token
  getCSRFToken: () => api.get('/users/csrf/'),
};

export default api;
