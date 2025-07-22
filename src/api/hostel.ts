
import { apiClient } from './client';

export const hostelAPI = {
  getAll: async () => {
    const response = await apiClient.get('/hostels');
    return response.data;
  },
};
