import { apiClient } from './client';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'student' | 'staff' | 'admin' | 'system-admin';
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
  };
  permissions: {
    canManageUsers: boolean;
    canManageStudents: boolean;
    canManageStaff: boolean;
    canGenerateReports: boolean;
    canManageFiles: boolean;
    canViewReports: boolean;
    canApproveLeave: boolean;
    canPromoteStaff: boolean;
  };
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export const usersAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};