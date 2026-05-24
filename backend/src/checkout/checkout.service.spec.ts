import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

// Mock da importação do db usando factory function
jest.mock('../drizzle', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    run: jest.fn(),
  },
}));

describe('CheckoutService', () => {
  let service: CheckoutService;
  let mockDb: any;

  beforeEach(async () => {
    // Resetar todos os mocks antes de cada teste
    jest.clearAllMocks();

    // Importar o mock do db
    const { db } = require('../drizzle');
    mockDb = db;

    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckoutService],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCheckout', () => {
    it('deve realizar compra com sucesso quando payload é válido', async () => {
      // Arrange
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Capa iPhone 15',
          price: 50.0,
          stock: 10,
          color: 'black',
          category: 'case',
          description: 'Capa de proteção',
          image: 'image.jpg',
          created_at: new Date().toISOString(),
        },
        {
          id: 'product-2',
          name: 'Película iPhone 15',
          price: 25.0,
          stock: 20,
          color: 'transparent',
          category: 'screen',
          description: 'Película de vidro',
          image: 'image2.jpg',
          created_at: new Date().toISOString(),
        },
      ];

      const mockOrder = {
        id: 'order-1',
        orderNumber: 'ORD-123456',
        customerId: 'customer-1',
        totalAmount: 100.0,
        status: 'processing',
        paymentMethod: 'credit_card',
        shippingAddress: JSON.stringify({
          street: 'Rua das Flores, 123',
          city: 'Porto Alegre',
          state: 'RS',
          zipCode: '90120-000',
        }),
        createdAt: new Date().toISOString(),
      };

      const dto: CreateCheckoutDto = {
        customerId: 'customer-1',
        items: [
          { productId: 'product-1', quantity: 1 },
          { productId: 'product-2', quantity: 2 },
        ],
        totalAmount: 100.0,
        paymentMethod: 'credit_card',
        shippingAddress: {
          street: 'Rua das Flores, 123',
          city: 'Porto Alegre',
          state: 'RS',
          zipCode: '90120-000',
        },
      };

      // Mock do select para buscar produtos
      const mockQueryBuilder = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockProducts),
      };
      mockDb.select.mockReturnValue(mockQueryBuilder as any);

      // Mock do insert para criar pedido
      const mockInsertBuilder = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockOrder]),
      };

      // Mock do update para atualizar estoque
      const mockUpdateBuilder = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(undefined),
      };

      // Mock do run para transações
      mockDb.run.mockResolvedValue(undefined);

      // Sobrescrever o comportamento do insert
      let insertCallCount = 0;
      mockDb.insert.mockImplementation(() => {
        insertCallCount++;
        if (insertCallCount === 1) {
          // Primeira chamada: insert orders
          return mockInsertBuilder;
        } else {
          // Chamadas subsequentes: insert orderItems
          return {
            values: jest.fn().mockResolvedValue(undefined),
          };
        }
      });

      // Mock do update
      mockDb.update.mockReturnValue(mockUpdateBuilder as any);

      // Act
      const result = await service.createCheckout(dto);

      // Assert
      expect(result).toBeDefined();
      expect(result.orderId).toBe(mockOrder.id);
      expect(result.orderNumber).toBe(mockOrder.orderNumber);
      expect(result.status).toBe('processing');
      expect(result.message).toBe('Pagamento realizado com sucesso');
      expect(result.totalAmount).toBe(100.0);

      // Verificar se o select foi chamado para buscar produtos
      expect(mockDb.select).toHaveBeenCalled();

      // Verificar se a transação foi iniciada
      expect(mockDb.run).toHaveBeenCalledWith('BEGIN TRANSACTION');

      // Verificar se o commit foi chamado
      expect(mockDb.run).toHaveBeenCalledWith('COMMIT');
    });
  });
});
