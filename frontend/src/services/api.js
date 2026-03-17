import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Skip adding token for login and register endpoints
    if (config.url.includes('/auth/login/') || 
        config.url.includes('/auth/register/') || 
        config.url.includes('/universities/')) {
      return config;
    }
    
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

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Do not force a full-page redirect here; let the app handle unauthenticated state
      // (e.g., AuthContext or ProtectedRoute can redirect when appropriate).
    }
    return Promise.reject(error);
  }
);

export default api;