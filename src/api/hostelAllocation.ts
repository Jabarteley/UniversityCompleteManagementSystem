
import { apiClient } from './client';

export const hostelAllocationAPI = {
  getAll: async () => {
    const response = await apiClient.get('/hostel-allocations');
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/hostel-allocations', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/hostel-allocations/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/hostel-allocations/${id}`);
    return response.data;
  },

  checkIn: async (id: string) => {
    const response = await apiClient.put(`/hostel-allocations/${id}`, { status: 'checked-in' });
    return response.data;
  },

  checkOut: async (id: string) => {
    const response = await apiClient.put(`/hostel-allocations/${id}`, { status: 'checked-out' });
    return response.data;
  },
};
