// Enums para produtos
export enum ProductColor {
  BLACK = 'preto',
  WHITE = 'branco',
  BLUE = 'azul',
  RED = 'vermelho',
  GREEN = 'verde',
  PINK = 'rosa',
  GRAY = 'cinza',
  ORANGE = 'laranja',
  PURPLE = 'roxo',
  GOLD = 'dourado',
  TITANIUM = 'titânio',
  MINT = 'mint',
}

export enum ProductCategory {
  SILICONE = 'silicone',
  PLASTIC = 'plástico',
  LEATHER = 'couro',
  METAL = 'metal',
  BAMBOO = 'bambu',
}

// Enums para pedidos
export enum OrderStatus {
  PROCESSING = 'processing',
  PAID = 'paid',
  SHIPPED = 'shipped',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  PIX = 'pix',
  DEBIT_CARD = 'debit_card',
}
