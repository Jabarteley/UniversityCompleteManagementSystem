import { apiClient } from './client';

export interface AdmissionStatus {
  registrationNumber: string;
  status: 'active' | 'graduated' | 'suspended' | 'withdrawn' | 'deferred';
  faculty: string;
  department: string;
  program: string;
  level: string;
  yearOfAdmission: number;
  studentName: string;
}

export const admissionsAPI = {
  checkStatus: async (regNumber: string) => {
    const response = await apiClient.get(`/admissions/check/${regNumber}`);
    return response.data;
  },

  updateStatus: async (id: string, data: { status: string; remarks?: string }) => {
    const response = await apiClient.put(`/admissions/status/${id}`, data);
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/admissions/stats');
    return response.data;
  },
};