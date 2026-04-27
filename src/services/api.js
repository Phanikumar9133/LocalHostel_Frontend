// src/services/api.js
import axios from 'axios';

const API_URL = 'https://localhostel.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 240000,
});

// Request interceptor - add token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper to get full image URL
export const getImageUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/400x250?text=No+Image';
  if (path.startsWith('http')) return path;
  return `https://localhostel.onrender.com${path.startsWith('/') ? '' : '/'}${path}`;
};

export default api;