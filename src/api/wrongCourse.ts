import { apiClient } from './client';

export const wrongCourseAPI = {
  getWrongCourses: async (studentId: string) => {
    const response = await apiClient.get(`/wrong-course/${studentId}`);
    return response.data;
  },
};