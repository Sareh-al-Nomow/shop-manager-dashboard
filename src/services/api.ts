import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:3250/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (401, 403, etc.)
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Extract error message from response if available
    if (error.response && error.response.data) {
      // If the error response has a message property, use it
      if (error.response.data.message) {
        error.message = error.response.data.message;
      } 
      // If the error response has an error property, use it
      else if (error.response.data.error) {
        error.message = error.response.data.error;
      }
      // If the error response is a string, use it directly
      else if (typeof error.response.data === 'string') {
        error.message = error.response.data;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
