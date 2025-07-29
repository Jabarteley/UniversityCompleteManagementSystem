import { apiClient } from './client';

export const studentProfileAPI = {
  getProfile: async (userId: string) => {
    const response = await apiClient.get(`/student-profile/${userId}`);
    return response.data;
  },
  updateProfile: async (userId: string, data: any) => {
    const response = await apiClient.put(`/student-profile/${userId}`, data);
    return response.data;
  },
};