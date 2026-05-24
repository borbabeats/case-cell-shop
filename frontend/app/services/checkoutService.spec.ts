import { checkoutService } from './checkoutService';
import { CheckoutRequest } from '../types/checkout';

// Mock da API
jest.mock('@/lib/api', () => ({
  api: {
    post: jest.fn(),
  },
}));

import { api } from '@/lib/api';

describe('checkoutService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCheckout', () => {
    it('deve realizar compra com sucesso', async () => {
      // Arrange
      const mockCheckoutData: CheckoutRequest = {
        customerId: 'customer-123',
        items: [
          { productId: 'product-1', quantity: 2 },
          { productId: 'product-2', quantity: 1 },
        ],
        shippingAddress: {
          street: 'Rua das Flores, 123',
          city: 'Porto Alegre',
          state: 'RS',
          zipCode: '90120-000',
        },
        paymentMethod: 'credit_card',
        totalAmount: 150.00,
      };

      const mockSuccessResponse = {
        statusCode: 200,
        orderId: 'order-123',
        orderNumber: 'ORD-123456',
        status: 'processing',
        message: 'Pagamento realizado com sucesso',
        totalAmount: 150.00,
      };

      (api.post as jest.Mock).mockResolvedValue({ data: mockSuccessResponse });

      // Act
      const result = await checkoutService.createCheckout(mockCheckoutData);

      // Assert
      expect(api.post).toHaveBeenCalledWith('/checkout', mockCheckoutData);
      expect(result).toEqual(mockSuccessResponse);
      expect(result.status).toBe('processing');
      expect(result.message).toBe('Pagamento realizado com sucesso');
    });

    it('deve lançar erro quando estoque é insuficiente', async () => {
      // Arrange
      const mockCheckoutData: CheckoutRequest = {
        customerId: 'customer-123',
        items: [
          { productId: 'product-1', quantity: 100 },
        ],
        shippingAddress: {
          street: 'Rua das Flores, 123',
          city: 'Porto Alegre',
          state: 'RS',
          zipCode: '90120-000',
        },
        paymentMethod: 'credit_card',
        totalAmount: 5000.00,
      };

      const mockErrorResponse = {
        response: {
          data: {
            error: {
              code: 'INSUFFICIENT_STOCK',
              message: 'Produto sem estoque suficiente',
              productId: 'product-1',
              availableStock: 10,
              requestedQuantity: 100,
            },
          },
        },
      };

      (api.post as jest.Mock).mockRejectedValue(mockErrorResponse);

      // Act & Assert
      await expect(checkoutService.createCheckout(mockCheckoutData)).rejects.toEqual(
        mockErrorResponse.response.data
      );
    });

    it('deve lançar erro quando API está indisponível/timeout', async () => {
      // Arrange
      const mockCheckoutData: CheckoutRequest = {
        customerId: 'customer-123',
        items: [
          { productId: 'product-1', quantity: 1 },
        ],
        shippingAddress: {
          street: 'Rua das Flores, 123',
          city: 'Porto Alegre',
          state: 'RS',
          zipCode: '90120-000',
        },
        paymentMethod: 'credit_card',
        totalAmount: 50.00,
      };

      const mockNetworkError = new Error('Network Error');
      (mockNetworkError as any).code = 'ECONNABORTED';
      (mockNetworkError as any).message = 'timeout of 5000ms exceeded';

      (api.post as jest.Mock).mockRejectedValue(mockNetworkError);

      // Act & Assert
      await expect(checkoutService.createCheckout(mockCheckoutData)).rejects.toEqual({
        error: {
          code: 'NETWORK_ERROR',
          message: 'Erro de conexão com o servidor',
        },
      });
    });

    it('deve lançar erro genérico quando API retorna erro sem response data', async () => {
      // Arrange
      const mockCheckoutData: CheckoutRequest = {
        customerId: 'customer-123',
        items: [
          { productId: 'product-1', quantity: 1 },
        ],
        shippingAddress: {
          street: 'Rua das Flores, 123',
          city: 'Porto Alegre',
          state: 'RS',
          zipCode: '90120-000',
        },
        paymentMethod: 'credit_card',
        totalAmount: 50.00,
      };

      const mockError = new Error('Internal Server Error');
      (api.post as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(checkoutService.createCheckout(mockCheckoutData)).rejects.toEqual({
        error: {
          code: 'NETWORK_ERROR',
          message: 'Erro de conexão com o servidor',
        },
      });
    });
  });
});
