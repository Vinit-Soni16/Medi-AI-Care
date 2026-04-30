import api from './api';

export const chatService = {
  sendMessage: async (message: string, sessionId?: string) => {
    const res = await api.post('/chat/analyze', { message, sessionId });
    return res.data;
  },

  getHistory: async () => {
    const res = await api.get('/chat/history');
    return res.data.sessions;
  },

  getSession: async (sessionId: string) => {
    const res = await api.get(`/chat/${sessionId}`);
    return res.data.session;
  },

  deleteSession: async (sessionId: string) => {
    await api.delete(`/chat/${sessionId}`);
  },
};
