import { apiClient } from './client';

export const wrongCourseAPI = {
  getWrongCourses: async (userId: string) => {
    const response = await apiClient.get(`/wrong-course/${userId}`);
    return response.data;
  },
};