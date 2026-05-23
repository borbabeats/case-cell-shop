import { api } from '@/lib/api';
import { ProductFilter, PaginatedProducts, Product } from '../types/product';

export const productService = {
  async getProducts(filter?: ProductFilter): Promise<PaginatedProducts> {
    const params = new URLSearchParams();
    
    if (filter?.page) params.append('page', filter.page.toString());
    if (filter?.limit) params.append('limit', filter.limit.toString());
    if (filter?.name) params.append('name', filter.name);
    if (filter?.minPrice) params.append('minPrice', filter.minPrice.toString());
    if (filter?.maxPrice) params.append('maxPrice', filter.maxPrice.toString());
    if (filter?.category) params.append('category', filter.category);
    if (filter?.color) params.append('color', filter.color);

    const response = await api.get<PaginatedProducts>('/products', {
      params,
    });
    return response.data;
  },

  async getProductById(id: string): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  }
};
