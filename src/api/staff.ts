
import { apiClient } from './client';

export const staffAPI = {
  getAll: async () => {
    const response = await apiClient.get('/staff');
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/staff', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/staff/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/staff/${id}`);
    return response.data;
  },
};
