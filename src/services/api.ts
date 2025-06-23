import axios from 'axios';
import { Link, Pdf, News, Alert, Group } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Links API
export const linksApi = {
  getAll: () => api.get<Link[]>('/links'),
  create: (data: Omit<Link, 'id'>) => api.post<Link>('/links', data),
  update: (id: string, data: Partial<Link>) => api.put<Link>(`/links/${id}`, data),
  delete: (id: string) => api.delete(`/links/${id}`),
};

// PDFs API
export const pdfsApi = {
  getAll: () => api.get<Pdf[]>('/pdfs'),
  upload: (formData: FormData) => api.post<Pdf>('/pdfs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id: string) => api.delete(`/pdfs/${id}`),
};

// News API
export const newsApi = {
  getAll: () => api.get<News[]>('/news'),
  create: (formData: FormData) => api.post<News>('/news', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id: string, formData: FormData) => api.put<News>(`/news/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id: string) => api.delete(`/news/${id}`),
};

// Alerts API
export const alertsApi = {
  getAll: () => api.get<Alert[]>('/alerts'),
  create: (data: Omit<Alert, 'id'>) => api.post<Alert>('/alerts', data),
  update: (id: string, data: Partial<Alert>) => api.put<Alert>(`/alerts/${id}`, data),
  delete: (id: string) => api.delete(`/alerts/${id}`),
};

// Groups API
export const groupsApi = {
  getAll: () => api.get<Group[]>('/groups'),
  create: (data: Omit<Group, 'id'>) => api.post<Group>('/groups', data),
  update: (id: string, data: Partial<Group>) => api.put<Group>(`/groups/${id}`, data),
  delete: (id: string) => api.delete(`/groups/${id}`),
};

// Analytics API
export const analyticsApi = {
  get: () => api.get('/analytics'),
};

// Settings API
export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data: any) => api.put('/settings', data),
};

// Search API
export const searchApi = {
  search: (query: string, type: string = 'all') => 
    api.get('/search', { params: { q: query, type } }),
};

// General data API
export const dataApi = {
  getAll: () => api.get('/data'),
};

export default api;