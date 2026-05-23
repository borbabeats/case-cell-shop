export interface Product {
  id: string;
  name: string;
  color: string;
  category: string;
  price: number;
  description: string;
  stock: number;
  image: string;
  created_at: string;
}

export interface ProductFilter {
  page?: number;
  limit?: number;
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  color?: string;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export enum ProductCategory {
  SILICONE = 'silicone',
  PLASTIC = 'plástico',
  LEATHER = 'couro',
  METAL = 'metal',
  BAMBOO = 'bambu'
}

export enum ProductColor {
  BLACK = 'Preto',
  WHITE = 'Branco',
  BLUE = 'Azul',
  RED = 'Vermelho',
  GREEN = 'Verde',
  PINK = 'Rosa',
  GRAY = 'Cinza',
  ORANGE = 'Laranja',
  PURPLE = 'Roxo',
  GOLD = 'Dourado',
  TITANIUM = 'Titânio',
  MINT = 'Mint'
}
