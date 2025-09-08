import { ProductRepository } from './ProductRepository';
import { OrderRepository } from './OrderRepository';
import { BaseRepository } from './BaseRepository';
import { StorageService } from './StorageService';
import { Table, Coupon, Settings, Restaurant } from '../models/types';

/**
 * Table Repository
 */
export class TableRepository extends BaseRepository<Table> {
  constructor(restaurantId: string) {
    super('tables', restaurantId);
  }

  async findByNumber(number: string): Promise<Table | null> {
    const tables = await this.findWhere('number', '==', number);
    return tables[0] || null;
  }

  async findActive(): Promise<Table[]> {
    return this.findWhere('active', '==', true, { field: 'number', direction: 'asc' });
  }

  async updateSessionId(tableId: string, sessionId?: string): Promise<void> {
    return this.update(tableId, { currentSessionId: sessionId });
  }
}

/**
 * Coupon Repository
 */
export class CouponRepository extends BaseRepository<Coupon> {
  constructor(restaurantId: string) {
    super('coupons', restaurantId);
  }

  async findByCode(code: string): Promise<Coupon | null> {
    const coupons = await this.findWhere('code', '==', code.toUpperCase());
    return coupons[0] || null;
  }

  async findActive(): Promise<Coupon[]> {
    return this.findWhere('active', '==', true, { field: 'validTo', direction: 'asc' });
  }

  async validateCoupon(code: string, subtotal: number): Promise<{
    valid: boolean;
    coupon?: Coupon;
    error?: string;
  }> {
    try {
      const coupon = await this.findByCode(code);
      
      if (!coupon) {
        return { valid: false, error: 'Coupon not found' };
      }

      if (!coupon.active) {
        return { valid: false, error: 'Coupon is not active' };
      }

      const now = new Date();
      if (now < coupon.validFrom) {
        return { valid: false, error: 'Coupon is not yet valid' };
      }

      if (now > coupon.validTo) {
        return { valid: false, error: 'Coupon has expired' };
      }

      if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
        return { 
          valid: false, 
          error: `Minimum order value of $${coupon.minSubtotal / 100} required` 
        };
      }

      return { valid: true, coupon };
    } catch (error) {
      return { valid: false, error: 'Error validating coupon' };
    }
  }
}

/**
 * Restaurant Repository
 */
export class RestaurantRepository extends BaseRepository<Restaurant> {
  constructor() {
    // Note: Restaurant collection is at root level, not under a restaurant ID
    super('', ''); // Will be overridden in constructor
    this.collection = require('../config/firebase').db.collection('restaurants');
  }

  async findBySlug(slug: string): Promise<Restaurant | null> {
    const restaurants = await this.findWhere('slug', '==', slug);
    return restaurants[0] || null;
  }

  async findActive(): Promise<Restaurant[]> {
    return this.findWhere('active', '==', true, { field: 'name', direction: 'asc' });
  }
}

/**
 * Settings Repository
 */
export class SettingsRepository extends BaseRepository<Settings> {
  constructor(restaurantId: string) {
    super('settings', restaurantId);
  }

  async getSettings(): Promise<Settings | null> {
    const settings = await this.findAll();
    return settings[0] || null;
  }

  async updateSettings(updates: Partial<Settings>): Promise<void> {
    const existing = await this.getSettings();
    
    if (existing) {
      return this.update(existing.id, updates);
    } else {
      // Create default settings if none exist
      const defaultSettings = {
        restaurantId: this.restaurantId,
        delivery: {
          enabled: false,
          feeType: 'fixed' as const,
          feeValue: 500 // $5.00 in cents
        },
        dineIn: {
          serviceFeePercent: 10
        },
        pickup: {
          enabled: true
        },
        whatsapp: {
          enabled: false
        },
        ...updates
      };
      
      await this.create(defaultSettings);
    }
  }
}

/**
 * Service Factory
 * Creates repository instances for a given restaurant
 */
export class ServiceFactory {
  constructor(private restaurantId: string) {}

  createProductRepository(): ProductRepository {
    return new ProductRepository(this.restaurantId);
  }

  createOrderRepository(): OrderRepository {
    return new OrderRepository(this.restaurantId);
  }

  createTableRepository(): TableRepository {
    return new TableRepository(this.restaurantId);
  }

  createCouponRepository(): CouponRepository {
    return new CouponRepository(this.restaurantId);
  }

  createSettingsRepository(): SettingsRepository {
    return new SettingsRepository(this.restaurantId);
  }

  createStorageService(): StorageService {
    return new StorageService(this.restaurantId);
  }

  // Static method to create restaurant repository (doesn't need restaurant ID)
  static createRestaurantRepository(): RestaurantRepository {
    return new RestaurantRepository();
  }
}

// Export repository classes
export { 
  ProductRepository, 
  OrderRepository, 
  StorageService,
  BaseRepository
};

// Export convenience function
export const createServiceFactory = (restaurantId: string) => new ServiceFactory(restaurantId);
