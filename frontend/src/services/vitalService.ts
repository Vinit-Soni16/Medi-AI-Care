import api from './api';

export const vitalService = {
  add: async (data: {
    type: string; value: number;
    valueSystolic?: number; valueDiastolic?: number;
    date?: string; notes?: string;
  }) => {
    const res = await api.post('/vitals', data);
    return res.data.vital;
  },

  getAll: async (params?: { type?: string; days?: number }) => {
    const res = await api.get('/vitals', { params });
    return res.data.vitals;
  },

  getTrends: async (days = 30) => {
    const res = await api.get('/vitals/trends', { params: { days } });
    return res.data.trends;
  },

  remove: async (id: string) => {
    await api.delete(`/vitals/${id}`);
  },
};

export const userService = {
  getDoctors: async (params?: { search?: string; specialization?: string }) => {
    const res = await api.get('/users/doctors', { params });
    return res.data.doctors;
  },

  getAllUsers: async (params?: { role?: string; page?: number; search?: string }) => {
    const res = await api.get('/users', { params });
    return res.data;
  },

  getStats: async () => {
    const res = await api.get('/users/stats');
    return res.data;
  },

  updateRole: async (id: string, role: string) => {
    const res = await api.put(`/users/${id}/role`, { role });
    return res.data.user;
  },

  updateStatus: async (id: string, isActive: boolean) => {
    const res = await api.put(`/users/${id}/status`, { isActive });
    return res.data.user;
  },
};
