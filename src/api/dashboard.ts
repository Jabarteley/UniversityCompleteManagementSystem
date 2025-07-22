import { apiClient } from './client';

export const dashboardAPI = {
  getStats: async () => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },
  getStudentStats: async () => {
    const response = await apiClient.get('/dashboard/student-stats');
    return response.data;
  },
  getStaffStats: async () => {
    const response = await apiClient.get('/dashboard/staff-stats');
    return response.data;
  },
};