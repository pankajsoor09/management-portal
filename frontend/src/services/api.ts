import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export const authAPI = {
  signup: (data: { email: string; password: string; fullName: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: { email?: string; fullName?: string }) =>
    api.put('/user/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/user/change-password', data),
};

export const adminAPI = {
  getUsers: (page: number = 1, limit: number = 10) =>
    api.get(`/admin/users?page=${page}&limit=${limit}`),
  activateUser: (userId: string) =>
    api.put(`/admin/users/${userId}/activate`),
  deactivateUser: (userId: string) =>
    api.put(`/admin/users/${userId}/deactivate`),
};

export default api;
