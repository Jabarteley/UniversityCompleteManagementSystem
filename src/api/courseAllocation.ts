
import { apiClient } from './client';

export const courseAllocationAPI = {
  getAll: async () => {
    const response = await apiClient.get('/course-allocations');
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/course-allocations', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/course-allocations/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/course-allocations/${id}`);
    return response.data;
  },
  reconcile: async (data: any) => {
    const response = await apiClient.post('/course-reconciliation', data);
    return response.data;
  },
};
