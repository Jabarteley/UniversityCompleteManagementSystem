import { apiClient } from './client';

export const courseRegistrationAPI = {
  registerCourses: async (data: any) => {
    const response = await apiClient.post('/course-registration/register', data);
    return response.data;
  },
  fetchAvailableCourses: async () => {
    const response = await apiClient.get('/courses');
    return response.data;
  },
  fetchRegisteredCourses: async (userId: string) => {
    const response = await apiClient.get(`/course-registration/registered/${userId}`);
    return response.data;
  },
  unregisterCourse: async (userId: string, courseId: string) => {
    const response = await apiClient.delete(`/course-registration/unregister/${userId}/${courseId}`);
    return response.data;
  },
};