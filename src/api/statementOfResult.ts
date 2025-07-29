import { apiClient } from './client';

export const statementOfResultAPI = {
  downloadStatement: async (userId: string) => {
    const response = await apiClient.get(`/statement-of-result/download/${userId}`);
    return response.data;
  },
};