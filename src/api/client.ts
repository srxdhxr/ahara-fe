import axios from 'axios';

// Axios instance + auth middleware, kept from v1. The endpoint helpers that
// targeted the old backend are gone — new endpoints for ahara-engine go in
// src/api/chat.ts behind the ChatApi interface.

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Remove Content-Type for FormData so axios can set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// Global error handler — expired/invalid token clears session and returns to /auth
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('access_token');
      if (!['/auth', '/verify-otp', '/welcome'].includes(window.location.pathname)) {
        sessionStorage.clear();
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
