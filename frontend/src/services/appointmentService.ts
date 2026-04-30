import api from './api';

export const appointmentService = {
  getAll: async (params?: { status?: string; from?: string; to?: string }) => {
    const res = await api.get('/appointments', { params });
    return res.data.appointments;
  },

  book: async (data: {
    doctorId: string; date: string; timeSlot: string;
    type?: string; symptoms?: string; notes?: string;
  }) => {
    const res = await api.post('/appointments', data);
    return res.data.appointment;
  },

  update: async (id: string, data: { status?: string; notes?: string; prescription?: string }) => {
    const res = await api.put(`/appointments/${id}`, data);
    return res.data.appointment;
  },

  cancel: async (id: string) => {
    await api.delete(`/appointments/${id}`);
  },

  getSlots: async (doctorId: string, date: string) => {
    const res = await api.get(`/appointments/doctor/${doctorId}/slots`, { params: { date } });
    return res.data;
  },
};
