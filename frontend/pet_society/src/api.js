import axios from 'axios';

// Set the base URL for the Django backend API
const API_BASE_URL = 'http://localhost:8000/api/'; // Update if backend runs elsewhere

/**
 * Axios instance for Pet Society API
 * Automatically uses the base URL and can be extended with interceptors, auth, etc.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;