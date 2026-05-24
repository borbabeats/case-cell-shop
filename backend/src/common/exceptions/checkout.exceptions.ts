import { HttpException, HttpStatus } from '@nestjs/common';

export class ProductNotFoundException extends HttpException {
  constructor(productId: string) {
    super(
      {
        error: 'PRODUCT_NOT_FOUND',
        message: 'Produto não encontrado',
        details: { productId },
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class InsufficientStockException extends HttpException {
  constructor(productId: string, productName: string, availableStock: number) {
    super(
      {
        error: 'INSUFFICIENT_STOCK',
        message: 'Produto sem estoque suficiente',
        details: {
          productId,
          productName,
          availableStock,
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidPayloadException extends HttpException {
  constructor(message: string = 'Dados incompletos') {
    super(
      {
        error: 'INVALID_PAYLOAD',
        message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidTotalAmountException extends HttpException {
  constructor(calculatedTotal: number, providedTotal: number) {
    const message =
      providedTotal < calculatedTotal
        ? 'Valor do pagamento informado é menor que o valor total do pedido'
        : 'Valor do pagamento informado é maior que o valor total do pedido';

    super(
      {
        error: 'INVALID_TOTAL_AMOUNT',
        message,
        details: {
          calculatedTotal,
          providedTotal,
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
