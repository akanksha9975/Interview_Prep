import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const signup = (email, password) => api.post('/auth/signup', { email, password });
export const login = (email, password) => api.post('/auth/login', { email, password });

// Documents
export const uploadDocument = (formData) => {
  return api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const listDocuments = () => api.get('/documents/list');
export const deleteDocument = (id) => api.delete(`/documents/${id}`);

// Chat
export const startChat = () => api.post('/chat/start');
export const sendQuery = (message, question) => api.post('/chat/query', { message, question });
export const getChatHistory = () => api.get('/chat/history');

export default api;
