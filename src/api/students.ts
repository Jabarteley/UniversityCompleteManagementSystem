
import { apiClient } from './client';

export const studentsAPI = {
  getAll: async () => {
    const response = await apiClient.get('/students');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/students/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/students', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/students/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/students/${id}`);
    return response.data;
  },
};
