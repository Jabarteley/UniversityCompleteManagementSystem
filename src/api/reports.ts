import { apiClient } from './client';

export interface Report {
  _id: string;
  title: string;
  type: 'student-academic' | 'staff-administrative' | 'staff-academic' | 'departmental' | 'financial' | 'custom';
  description?: string;
  generatedBy: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  parameters: {
    dateRange?: {
      startDate: string;
      endDate: string;
    };
    department?: string;
    faculty?: string;
    semester?: string;
    academicYear?: string;
  };
  data: any;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'generating' | 'completed' | 'failed';
  accessLevel: 'public' | 'restricted' | 'confidential';
  createdAt: string;
  updatedAt: string;
}

export const reportsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    search?: string;
  }) => {
    const response = await apiClient.get('/reports', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/reports/${id}`);
    return response.data;
  },

  generateStudentReport: async (data: any) => {
    const response = await apiClient.post('/reports/student-academic', data);
    return response.data;
  },

  generateStaffReport: async (data: any) => {
    const response = await apiClient.post('/reports/staff-administrative', data);
    return response.data;
  },

  download: async (id: string) => {
    const response = await apiClient.get(`/reports/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/reports/${id}`);
    return response.data;
  },
};