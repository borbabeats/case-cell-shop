import { Injectable, Logger } from '@nestjs/common';
import { eq, and, gte, lte, like, sql, desc, SQL } from 'drizzle-orm';
import { db } from '../drizzle';
import { products } from '../drizzle/schema';
import { FindProductsDto } from './dto/find-products.dto';
import { PaginatedResponse } from './dto/paginated-response.dto';
import { ProductNotFoundException } from '../common/exceptions/checkout.exceptions';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  async getAllProducts(
    filters: FindProductsDto,
  ): Promise<PaginatedResponse<any>> {
    this.logger.log(
      `Buscando produtos com filtros: ${JSON.stringify(filters)}`,
      'ProductsService.getAllProducts',
    );

    const {
      page = 1,
      limit = 10,
      name,
      minPrice,
      maxPrice,
      category,
      color,
    } = filters;

    const offset = (page - 1) * limit;

    // Construir condições where
    const conditions: SQL[] = [];

    // Apenas produtos com stock > 0
    conditions.push(gte(products.stock, 1));

    // Filtro por nome
    if (name) {
      conditions.push(like(products.name, `%${name}%`));
    }

    // Filtro por preço mínimo
    if (minPrice !== undefined) {
      conditions.push(gte(products.price, minPrice));
    }

    // Filtro por preço máximo
    if (maxPrice !== undefined) {
      conditions.push(lte(products.price, maxPrice));
    }

    // Filtro por categoria
    if (category) {
      conditions.push(eq(products.category, category));
    }

    // Filtro por cor
    if (color) {
      conditions.push(eq(products.color, color));
    }

    try {
      // Query para buscar produtos com filtros e paginação
      const query = db
        .select()
        .from(products)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(products.created_at))
        .limit(limit)
        .offset(offset);

      const data = await query;

      // Query para contar total de produtos (sem paginação)
      const countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const [{ count: total }] = await countQuery;

      const result = {
        data,
        total,
        page,
        limit,
      };

      this.logger.log(
        `Encontrados ${total} produtos na página ${page}`,
        'ProductsService.getAllProducts',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar produtos: ${error.message}`,
        error.stack,
        'ProductsService.getAllProducts',
      );
      throw error;
    }
  }

  async getProductById(id: string) {
    this.logger.log(
      `Buscando produto por ID: ${id}`,
      'ProductsService.getProductById',
    );

    try {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1);

      if (!product) {
        this.logger.warn(
          `Produto não encontrado: ${id}`,
          'ProductsService.getProductById',
        );
        throw new ProductNotFoundException(id);
      }

      this.logger.log(
        `Produto encontrado: ${product.name}`,
        'ProductsService.getProductById',
      );
      return product;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar produto ${id}: ${error.message}`,
        error.stack,
        'ProductsService.getProductById',
      );
      throw error;
    }
  }
}
