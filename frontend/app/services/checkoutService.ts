
import { api } from '@/lib/api';
import { CheckoutRequest, CheckoutResponse } from '../types/checkout';


export const checkoutService = {
  async createCheckout(data: CheckoutRequest): Promise<CheckoutResponse> {
    try {
      const response = await api.post<CheckoutResponse>('/checkout', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Erro de conexão com o servidor',
        },
      };
    }
  }
};
