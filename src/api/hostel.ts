
import { apiClient } from './client';

export const hostelAPI = {
  getAll: async () => {
    const response = await apiClient.get('/hostels');
    return response.data;
  },
  create: async (data: { name: string; totalRooms: number }) => {
    const response = await apiClient.post('/hostels', data);
    return response.data;
  },
};
