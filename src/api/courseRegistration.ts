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
  fetchRegisteredCourses: async (studentId: string) => {
    const response = await apiClient.get(`/course-registration/registered/${studentId}`);
    return response.data;
  },
  unregisterCourse: async (studentId: string, courseId: string) => {
    const response = await apiClient.delete(`/course-registration/unregister/${studentId}/${courseId}`);
    return response.data;
  },
};