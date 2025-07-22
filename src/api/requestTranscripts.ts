import { apiClient } from './client';

export const requestTranscriptsAPI = {
  requestTranscript: async (data: any) => {
    const response = await apiClient.post('/request-transcripts/request', data);
    return response.data;
  },
  getStudentRequests: async (studentId: string) => {
    const response = await apiClient.get(`/request-transcripts/student/${studentId}`);
    return response.data;
  },
};