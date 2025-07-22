import { apiClient } from './client';

export const externalIntegrationAPI = {
  uploadToJAMB: async (data: { studentIds: string[]; examYear: string }) => {
    const response = await apiClient.post('/external/jamb/upload', data);
    return response.data;
  },

  uploadToNYSC: async (data: { studentIds: string[] }) => {
    const response = await apiClient.post('/external/nysc/upload', data);
    return response.data;
  },

  getUploadHistory: async () => {
    const response = await apiClient.get('/external/history');
    return response.data;
  },
};