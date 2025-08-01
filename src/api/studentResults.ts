import { apiClient } from './client';

export interface StudentResult {
  studentId: string;
  courseCode: string;
  courseName: string;
  creditUnits: number;
  grade: string;
  gradePoint: number;
  semester: number;
  year: number;
}

export const studentResultsAPI = {
  upload: async (data: StudentResult) => {
    const response = await apiClient.post('/student-results/upload', data);
    return response.data;
  },

  getByRegistrationNumber: async (regNumber: string) => {
    const response = await apiClient.get(`/student-results/student/${regNumber}`);
    return response.data;
  },

  update: async (studentId: string, resultId: string, data: Partial<StudentResult>) => {
    const response = await apiClient.put(`/student-results/${studentId}/results/${resultId}`, data);
    return response.data;
  },

  delete: async (studentId: string, resultId: string) => {
    const response = await apiClient.delete(`/student-results/${studentId}/results/${resultId}`);
    return response.data;
  },
};