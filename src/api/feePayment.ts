import { apiClient } from './client';

export const feePaymentAPI = {
  makePayment: async (amount: number, description: string) => {
    const response = await apiClient.post('/fee-payment/pay', { amount, description });
    return response.data;
  },
};