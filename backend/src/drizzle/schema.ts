import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { ProductColor, ProductCategory, OrderStatus, PaymentMethod } from './enums';

const productColorValues = Object.values(ProductColor) as [string, ...string[]];
const productCategoryValues = Object.values(ProductCategory) as [string, ...string[]];
const orderStatusValues = Object.values(OrderStatus) as [string, ...string[]];
const paymentMethodValues = Object.values(PaymentMethod) as [string, ...string[]];

export const products = sqliteTable('products', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    color: text('color', { enum: productColorValues }).notNull(),
    category: text('category', { enum: productCategoryValues }).notNull(),
    price: real('price').notNull(),
    description: text('description'),
    stock: integer('stock').notNull().default(0),
    image: text('image'),
    created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderNumber: text('order_number').notNull().unique(), // ex: ORD-001
  customerId: text('customer_id'),
  totalAmount: real('total_amount').notNull(),
  status: text('status', { enum: orderStatusValues }).notNull().default('processing'),
  paymentMethod: text('payment_method', { enum: paymentMethodValues }).notNull(),
  shippingAddress: text('shipping_address'), // JSON string
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id').notNull(),
  productId: text('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  priceAtPurchase: real('price_at_purchase').notNull(), // snapshot do preço
});

