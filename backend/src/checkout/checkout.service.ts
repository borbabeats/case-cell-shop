import { Injectable, Logger } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../drizzle';
import { products, orders, orderItems } from '../drizzle/schema';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import {
  ProductNotFoundException,
  InsufficientStockException,
  InvalidPayloadException,
  InvalidTotalAmountException,
} from '../common/exceptions/checkout.exceptions';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  async createCheckout(dto: CreateCheckoutDto) {
    this.logger.log(
      `Iniciando checkout para ${dto.items.length} itens`,
      'CheckoutService.createCheckout',
    );

    try {
      const { items, totalAmount, paymentMethod, shippingAddress, customerId } =
        dto;

      // Validação inicial do payload
      if (!items || items.length === 0) {
        this.logger.warn('Payload sem itens', 'CheckoutService.createCheckout');
        throw new InvalidPayloadException('Items são obrigatórios');
      }

      if (!totalAmount || totalAmount <= 0) {
        this.logger.warn(
          'Total amount inválido',
          'CheckoutService.createCheckout',
        );
        throw new InvalidPayloadException(
          'Total amount é obrigatório e deve ser maior que 0',
        );
      }

      if (!paymentMethod) {
        this.logger.warn(
          'Payment method não informado',
          'CheckoutService.createCheckout',
        );
        throw new InvalidPayloadException('Payment method é obrigatório');
      }

      // 1. Buscar todos os produtos
      const productIds = items.map((item) => item.productId);
      this.logger.log(
        `Buscando produtos: ${productIds.join(', ')}`,
        'CheckoutService.createCheckout',
      );

      const foundProducts = await db
        .select()
        .from(products)
        .where(inArray(products.id, productIds));

      // 2. Validação de estoque e existência
      const productMap = new Map(foundProducts.map((p) => [p.id, p]));

      for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) {
          this.logger.warn(
            `Produto não encontrado: ${item.productId}`,
            'CheckoutService.createCheckout',
          );
          throw new ProductNotFoundException(item.productId);
        }
        if (product.stock < item.quantity) {
          this.logger.warn(
            `Estoque insuficiente para produto ${item.productId}. Disponível: ${product.stock}, Solicitado: ${item.quantity}`,
            'CheckoutService.createCheckout',
          );
          throw new InsufficientStockException(
            item.productId,
            product.name,
            product.stock,
          );
        }
      }

      // 3. Validar totalAmount
      let calculatedTotal = 0;
      for (const item of items) {
        const product = productMap.get(item.productId)!;
        calculatedTotal += product.price * item.quantity;
      }

      // Permitir uma pequena diferença devido a precisão de ponto flutuante
      if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
        this.logger.warn(
          `Total amount incorreto. Calculado: ${calculatedTotal}, Informado: ${totalAmount}`,
          'CheckoutService.createCheckout',
        );
        throw new InvalidTotalAmountException(calculatedTotal, totalAmount);
      }

      // 4. Criar Pedido e itens em uma transação
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
      this.logger.log(
        `Criando pedido ${orderNumber} com valor total ${totalAmount}`,
        'CheckoutService.createCheckout',
      );

      try {
        // Iniciar transação
        await db.run('BEGIN TRANSACTION');

        // Criar pedido
        const [newOrder] = await db
          .insert(orders)
          .values({
            orderNumber,
            customerId: customerId || null,
            totalAmount,
            paymentMethod,
            shippingAddress: JSON.stringify(shippingAddress),
          })
          .returning();

        // Criar itens do pedido e atualizar estoque
        for (const item of items) {
          const product = productMap.get(item.productId)!;

          await db.insert(orderItems).values({
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: product.price,
          });

          // Atualiza estoque
          await db
            .update(products)
            .set({ stock: product.stock - item.quantity })
            .where(eq(products.id, item.productId));

          this.logger.debug(
            `Item adicionado ao pedido: Produto ${item.productId}, Quantidade ${item.quantity}`,
            'CheckoutService.createCheckout',
          );
        }

        // Commit da transação
        await db.run('COMMIT');

        const result = {
          orderId: newOrder.id,
          orderNumber: newOrder.orderNumber,
          status: 'processing',
          message: 'Pagamento realizado com sucesso',
          totalAmount,
        };

        this.logger.log(
          `Pedido ${orderNumber} criado com sucesso. Order ID: ${newOrder.id}`,
          'CheckoutService.createCheckout',
        );
        return result;
      } catch (error) {
        // Rollback em caso de erro
        this.logger.error(
          `Erro na transação do pedido ${orderNumber}, fazendo rollback`,
          error.stack,
          'CheckoutService.createCheckout',
        );
        await db.run('ROLLBACK');
        throw error;
      }
    } catch (error) {
      // Tratamento genérico para evitar timeouts
      this.logger.error(
        `Erro no checkout: ${error.message}`,
        error.stack,
        'CheckoutService.createCheckout',
      );
      throw error;
    }
  }
}
