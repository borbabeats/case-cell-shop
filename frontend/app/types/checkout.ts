export interface CheckoutItem {
  productId: string;
  quantity: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface CheckoutRequest {
  customerId: string;
  items: CheckoutItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'boleto';
  totalAmount: number;
}

export interface CheckoutResponse {
  statusCode: number;
  orderId: string;
  orderNumber: string;
  status: string;
  message: string;
  totalAmount: number;
}
