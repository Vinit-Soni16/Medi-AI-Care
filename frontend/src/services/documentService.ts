import api from './api';

export const documentService = {
  upload: async (file: File, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
    return res.data.document;
  },

  getAll: async () => {
    const res = await api.get('/documents');
    return res.data.documents;
  },

  getById: async (id: string) => {
    const res = await api.get(`/documents/${id}`);
    return res.data.document;
  },

  update: async (id: string, data: Record<string, unknown>) => {
    const res = await api.put(`/documents/${id}`, data);
    return res.data.document;
  },

  remove: async (id: string) => {
    await api.delete(`/documents/${id}`);
  },
};
