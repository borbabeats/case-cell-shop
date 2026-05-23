import Database from 'better-sqlite3';
import { join } from 'path';
import { ProductColor, ProductCategory, OrderStatus, PaymentMethod } from '../drizzle/enums';

export function initializeDatabase() {
  const sqlite = new Database(join(__dirname, '../../database.db'));

  // Criar tabela products
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      stock INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      created_at TEXT NOT NULL
    )
  `);

  // Criar tabela orders
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      customer_id TEXT,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'processing',
      payment_method TEXT NOT NULL,
      shipping_address TEXT,
      created_at TEXT NOT NULL
    )
  `);

  // Criar tabela order_items
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price_at_purchase REAL NOT NULL
    )
  `);

  // Inserir dados de teste se a tabela products estiver vazia
  const productCount = sqlite.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  
  if (productCount.count === 0) {
    console.log('Inserindo dados de teste...');
    
    const insertProduct = sqlite.prepare(`
      INSERT INTO products (id, name, color, category, price, description, stock, image, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const products = [
      {
        id: crypto.randomUUID(),
        name: 'iPhone 15 Pro',
        color: ProductColor.BLACK,
        category: ProductCategory.SILICONE,
        price: 25.00,
        description: 'Capa de silicone premium para iPhone 15 Pro, proteção completa e design ergonômico',
        stock: 30,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'iPhone 15 Pro',
        color: ProductColor.WHITE,
        category: ProductCategory.LEATHER,
        price: 89.00,
        description: 'Capa de couro legítimo para iPhone 15 Pro, acabamento luxuoso e durabilidade superior',
        stock: 15,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Samsung Galaxy S24',
        color: ProductColor.BLUE,
        category: ProductCategory.PLASTIC,
        price: 19.00,
        description: 'Capa de plástico resistente para Samsung Galaxy S24, proteção básica e design leve',
        stock: 45,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Samsung Galaxy S24',
        color: ProductColor.BLACK,
        category: ProductCategory.SILICONE,
        price: 29.00,
        description: 'Capa de silicone antichoque para Samsung Galaxy S24, absorção de impacto superior',
        stock: 35,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Google Pixel 8',
        color: ProductColor.GREEN,
        category: ProductCategory.BAMBOO,
        price: 95.00,
        description: 'Capa de bambu ecológica para Google Pixel 8, material sustentável e design natural',
        stock: 12,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Google Pixel 8',
        color: ProductColor.PINK,
        category: ProductCategory.SILICONE,
        price: 35.00,
        description: 'Capa de silicone macia para Google Pixel 8, textura agradável e proteção diária',
        stock: 28,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Xiaomi 14',
        color: ProductColor.GRAY,
        category: ProductCategory.METAL,
        price: 75.00,
        description: 'Capa de metal premium para Xiaomi 14, proteção robusta e design industrial',
        stock: 20,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Xiaomi 14',
        color: ProductColor.WHITE,
        category: ProductCategory.PLASTIC,
        price: 15.00,
        description: 'Capa de plástico transparente para Xiaomi 14, mostra o design original do aparelho',
        stock: 50,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'iPhone 15',
        color: ProductColor.RED,
        category: ProductCategory.SILICONE,
        price: 28.00,
        description: 'Capa de silicone vermelha para iPhone 15, proteção completa com vibrante',
        stock: 40,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'iPhone 15',
        color: ProductColor.BLACK,
        category: ProductCategory.LEATHER,
        price: 85.00,
        description: 'Capa de couro preto para iPhone 15, elegância e proteção premium',
        stock: 18,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'iPhone 15 Plus',
        color: ProductColor.BLUE,
        category: ProductCategory.SILICONE,
        price: 32.00,
        description: 'Capa de silicone para iPhone 15 Plus, ajuste perfeito e proteção avançada',
        stock: 25,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Samsung Galaxy S24 Ultra',
        color: ProductColor.TITANIUM,
        category: ProductCategory.METAL,
        price: 99.00,
        description: 'Capa de metal titânio para Samsung Galaxy S24 Ultra, ultra resistente e premium',
        stock: 10,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Samsung Galaxy S24 Ultra',
        color: ProductColor.BLACK,
        category: ProductCategory.LEATHER,
        price: 92.00,
        description: 'Capa de couro para Samsung Galaxy S24 Ultra, luxo e proteção superior',
        stock: 14,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Google Pixel 8 Pro',
        color: ProductColor.GRAY,
        category: ProductCategory.SILICONE,
        price: 38.00,
        description: 'Capa de silicone para Google Pixel 8 Pro, proteção completa e design moderno',
        stock: 22,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Google Pixel 8a',
        color: ProductColor.MINT,
        category: ProductCategory.PLASTIC,
        price: 18.00,
        description: 'Capa de plástico para Google Pixel 8a, leve e colorida',
        stock: 55,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Xiaomi 14 Pro',
        color: ProductColor.GOLD,
        category: ProductCategory.METAL,
        price: 88.00,
        description: 'Capa de metal dourado para Xiaomi 14 Pro, design sofisticado e proteção robusta',
        stock: 16,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'OnePlus 12',
        color: ProductColor.GREEN,
        category: ProductCategory.SILICONE,
        price: 30.00,
        description: 'Capa de silicone para OnePlus 12, textura premium e proteção eficiente',
        stock: 33,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'OnePlus 12R',
        color: ProductColor.BLUE,
        category: ProductCategory.PLASTIC,
        price: 17.00,
        description: 'Capa de plástico para OnePlus 12R, proteção básica e custo benefício',
        stock: 48,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Motorola Edge 50 Pro',
        color: ProductColor.ORANGE,
        category: ProductCategory.SILICONE,
        price: 26.00,
        description: 'Capa de silicone para Motorola Edge 50 Pro, vibrante e protetora',
        stock: 38,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Vivo V30 Pro',
        color: ProductColor.PURPLE,
        category: ProductCategory.LEATHER,
        price: 79.00,
        description: 'Capa de couro para Vivo V30 Pro, elegância e durabilidade',
        stock: 19,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        created_at: new Date().toISOString()
      }
    ];

    const insertMany = sqlite.transaction((products) => {
      for (const product of products) {
        insertProduct.run(
          product.id,
          product.name,
          product.color,
          product.category,
          product.price,
          product.description,
          product.stock,
          product.image,
          product.created_at
        );
      }
    });

    insertMany(products);
    console.log(`${products.length} produtos inseridos com sucesso!`);
  }

  sqlite.close();
  console.log('Banco de dados inicializado com sucesso!');
}