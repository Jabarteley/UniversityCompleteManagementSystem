import { apiClient } from './client';

export const coursesAPI = {
  getAll: async () => {
    const response = await apiClient.get('/courses');
    return response.data;
  },
};