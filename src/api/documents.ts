import { apiClient } from './client';

export interface Document {
  _id: string;
  title: string;
  description?: string;
  category: 'academic' | 'administrative' | 'personal' | 'financial' | 'legal' | 'medical' | 'research';
  originalName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  accessLevel: 'public' | 'restricted' | 'confidential' | 'classified';
  tags: string[];
  status: 'draft' | 'pending-review' | 'approved' | 'rejected' | 'archived';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const documentsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }) => {
    const response = await apiClient.get('/documents', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data;
  },

  create: async (data: Partial<Document>) => {
    const response = await apiClient.post('/documents', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Document>) => {
    const response = await apiClient.put(`/documents/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
  },
};