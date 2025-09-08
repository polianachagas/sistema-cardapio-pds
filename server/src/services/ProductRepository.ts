import { BaseRepository } from './BaseRepository';
import { Product } from '../models/types';
import { ProductQueryInput } from '../models/schemas';

/**
 * Product Repository
 * Handles all product-related database operations
 */
export class ProductRepository extends BaseRepository<Product> {
  constructor(restaurantId: string) {
    super('products', restaurantId);
  }

  /**
   * Find products by category
   */
  async findByCategory(category: string): Promise<Product[]> {
    return this.findWhere(
      'category', 
      '==', 
      category,
      { field: 'position', direction: 'asc' }
    );
  }

  /**
   * Find available products
   */
  async findAvailable(): Promise<Product[]> {
    return this.findWhere(
      'available', 
      '==', 
      true,
      { field: 'position', direction: 'asc' }
    );
  }

  /**
   * Find highlighted products
   */
  async findHighlighted(): Promise<Product[]> {
    return this.findWhere(
      'isHighlighted', 
      '==', 
      true,
      { field: 'position', direction: 'asc' }
    );
  }

  /**
   * Find day specials
   */
  async findDaySpecials(): Promise<Product[]> {
    return this.findWhere(
      'isDaySpecial', 
      '==', 
      true,
      { field: 'position', direction: 'asc' }
    );
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const products = await this.findAll();
      const categories = [...new Set(products.map(p => p.category))];
      return categories.sort();
    } catch (error) {
      throw new Error(`Failed to get categories: ${error}`);
    }
  }

  /**
   * Search products by name or description
   */
  async search(searchTerm: string): Promise<Product[]> {
    try {
      const allProducts = await this.findAll();
      const searchLower = searchTerm.toLowerCase();
      
      return allProducts.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      throw new Error(`Failed to search products: ${error}`);
    }
  }

  /**
   * Find products with complex query
   */
  async findWithQuery(queryParams: ProductQueryInput): Promise<{
    products: Product[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      let query = this.getCollection();

      // Apply filters
      if (queryParams.category) {
        query = query.where('category', '==', queryParams.category);
      }

      if (queryParams.available !== undefined) {
        query = query.where('available', '==', queryParams.available);
      }

      // Apply sorting
      const sortField = queryParams.sortBy || 'position';
      query = query.orderBy(sortField, queryParams.sortOrder);

      // Get total count for pagination
      const countSnapshot = await query.count().get();
      const total = countSnapshot.data().count;

      // Apply pagination
      const offset = (queryParams.page - 1) * queryParams.limit;
      if (offset > 0) {
        // For pagination with offset, we need to get all docs up to the offset + limit
        // This is not the most efficient for large datasets, consider using cursor-based pagination
        query = query.limit(offset + queryParams.limit);
        const snapshot = await query.get();
        const allDocs = this.transformSnapshot(snapshot);
        const products = allDocs.slice(offset);

        const totalPages = Math.ceil(total / queryParams.limit);

        let filteredProducts = products;
        
        // Apply search filter in memory (since Firestore has limited text search)
        if (queryParams.search) {
          const searchLower = queryParams.search.toLowerCase();
          filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower)
          );
        }

        return {
          products: filteredProducts,
          total,
          totalPages,
          currentPage: queryParams.page
        };
      } else {
        query = query.limit(queryParams.limit);
        const snapshot = await query.get();
        let products = this.transformSnapshot(snapshot);

        // Apply search filter in memory
        if (queryParams.search) {
          const searchLower = queryParams.search.toLowerCase();
          products = products.filter(product =>
            product.name.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower)
          );
        }

        const totalPages = Math.ceil(total / queryParams.limit);

        return {
          products,
          total,
          totalPages,
          currentPage: queryParams.page
        };
      }
    } catch (error) {
      throw new Error(`Failed to query products: ${error}`);
    }
  }

  /**
   * Update product availability
   */
  async updateAvailability(productId: string, available: boolean): Promise<void> {
    return this.update(productId, { available });
  }

  /**
   * Update product position
   */
  async updatePosition(productId: string, position: number): Promise<void> {
    return this.update(productId, { position });
  }

  /**
   * Toggle product highlight
   */
  async toggleHighlight(productId: string): Promise<void> {
    try {
      const product = await this.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }
      
      return this.update(productId, { 
        isHighlighted: !product.isHighlighted 
      });
    } catch (error) {
      throw new Error(`Failed to toggle product highlight: ${error}`);
    }
  }

  /**
   * Toggle day special
   */
  async toggleDaySpecial(productId: string): Promise<void> {
    try {
      const product = await this.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }
      
      return this.update(productId, { 
        isDaySpecial: !product.isDaySpecial 
      });
    } catch (error) {
      throw new Error(`Failed to toggle day special: ${error}`);
    }
  }

  /**
   * Update multiple products positions
   */
  async updatePositions(updates: { id: string; position: number }[]): Promise<void> {
    const batchUpdates = updates.map(({ id, position }) => ({
      id,
      data: { position }
    }));
    
    return this.batchUpdate(batchUpdates);
  }

  /**
   * Get products by price range
   */
  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    try {
      const products = await this.findAll();
      return products.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
      );
    } catch (error) {
      throw new Error(`Failed to find products by price range: ${error}`);
    }
  }
}
