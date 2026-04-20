import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // DEBUG: Log token attachment in development
    if (import.meta.env.DEV) {
      console.log(`[Axios Debug] Token attached to request: ${config.url}`);
    }
  } else {
    // DEBUG: Log missing token
    if (import.meta.env.DEV) {
      console.warn(`[Axios Debug] No token found in localStorage for request: ${config.url}`);
    }
  }
  return config;
});

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('[Axios] 401 Unauthorized - clearing auth session');
      
      // Clear auth data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // DEBUG: Check what was cleared
      if (import.meta.env.DEV) {
        console.log('[Axios] LocalStorage cleaned. Remaining token:', localStorage.getItem('token'));
      }
      
      // Small delay to ensure event listeners are ready
      setTimeout(() => {
        window.location.href = '/login';
      }, 200);
    }
    
    if (error.response?.status === 403) {
      console.log('[Axios] 403 Forbidden - Access denied');
      if (import.meta.env.DEV && error.response?.data?.debug) {
        console.log('[Axios Debug] Authorization details:', error.response.data.debug);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
