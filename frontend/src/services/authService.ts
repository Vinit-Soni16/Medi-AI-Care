import api from './api';
import { useAuthStore } from '@/store/authStore';

export const authService = {
  register: async (data: {
    name: string; email: string; password: string;
    role: string; specialization?: string; qualification?: string; experience?: number;
  }) => {
    const res = await api.post('/auth/register', data);
    const { user, token } = res.data;
    useAuthStore.getState().setAuth(user, token);
    return res.data;
  },

  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { user, token } = res.data;
    useAuthStore.getState().setAuth(user, token);
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data.user;
  },

  updateProfile: async (data: Record<string, unknown>) => {
    const res = await api.put('/auth/profile', data);
    useAuthStore.getState().updateUser(res.data.user);
    return res.data.user;
  },

  logout: () => {
    useAuthStore.getState().logout();
    window.location.href = '/login';
  },
};
