import axios from "axios";
import { API_CONFIG } from "../config/api";

const API_BASE_URL = API_CONFIG.BASE_URL;

// Main API instance with authentication
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls (these use the full base URL since they're not under /api/)
const authApi = axios.create({
  baseURL: API_CONFIG.BASE_URL.replace('/api', ''),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token interceptor to auth API as well
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  getAllUsers: () => authApi.get('/users/'),
  getSearchedUsers: (searchTerm) => authApi.get(`/users/?search=${searchTerm}`),
  getSearchedPosts: (searchTerm) => authApi.get(`/posts/?search=${searchTerm}`),
  updateUser: (userId, data) => authApi.patch(`/users/${userId}/`, data),
  register: (userData) => authApi.post('/users/register/', userData),
  login: (credentials) => authApi.post('/users/login/', credentials),
  logout: () => authApi.post('/users/logout/'),
  getProfile: () => authApi.get('/users/profile/'),
  updateProfile: (username, data) => authApi.patch(`/users/profile/${username}/update/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  getUserProfile: (username) => authApi.get(`/users/profile/${username}/`),
  followUser: (username) => authApi.post(`/users/profile/${username}/follow/`),
  unfollowUser: (username) => authApi.post(`/users/profile/${username}/unfollow/`),
};

// Chat API functions - Pure chat functionality
export const chatAPI = {
  // Get all chat groups for the current user
  getChatGroups: () => api.get("/chats/groups/"),
  
  // Get a specific chat group with messages
  getChatGroup: (groupId) => api.get(`/chats/groups/${groupId}/`),
  
  // Create a new chat group
  createChatGroup: (data) => api.post("/chats/groups/", data),
  
  // Join a chat group
  joinChatGroup: (groupId) => api.post(`/chats/groups/${groupId}/join/`),
  
  // Leave a chat group
  leaveChatGroup: (groupId) => api.post(`/chats/groups/${groupId}/leave/`),
  
  // Get messages for a chat group
  getMessages: (groupId, options = {}) => {
    const { page = 1, pageSize = 50, beforeMessageId } = options;
    const params = new URLSearchParams();
    
    params.append("page", page.toString());
    params.append("page_size", pageSize.toString());
    
    if (beforeMessageId) {
      params.append("before_message_id", beforeMessageId.toString());
    }
    
    return api.get(`/chats/groups/${groupId}/messages/?${params.toString()}`);
  },
  
  // Send a message (fallback for non-WebSocket)
  sendMessage: (groupId, message) =>
    api.post(`/chats/groups/${groupId}/send_message/`, { body: message }),

  // Send an image message
  sendImageMessage: (groupId, imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    return api.post(`/chats/groups/${groupId}/send_message/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Mark messages as read
  markAsRead: (groupId) =>
    api.post(`/chats/groups/${groupId}/mark_as_read/`),

  // Get total unread message count
  getUnreadCount: () =>
    api.get("/chats/groups/unread_count/"),

  // Invite user to group
  inviteUser: (groupId, username) =>
    api.post(`/chats/groups/${groupId}/invite_user/`, { username: username }),
};

// Posts API calls
export const postsAPI = {
  getUserPosts: (username, page = 1) => api.get(`/posts/?author=${username}&page=${page}`),
  getAllPosts: (page = 1, category = null) => {
    let url = `/posts/?page=${page}`;
    if (category) url += `&category=${category}`;
    return api.get(url);
  },
};

// Helper functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export default api;
