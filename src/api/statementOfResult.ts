import { apiClient } from './client';

export const statementOfResultAPI = {
  downloadStatement: async (studentId: string) => {
    const response = await apiClient.get(`/statement-of-result/download/${studentId}`);
    return response.data;
  },
};