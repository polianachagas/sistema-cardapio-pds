// Mock service for local development and testing
// This simulates the Firebase service using demo data
import type { 
  Product, 
  Order, 
  OrderItem, 
  Coupon,
  Table 
} from './types';
import { demoProducts, demoCoupons, demoTables } from './demo-data';

class MockService {
  private restaurantId: string;
  private orders: Order[] = [];
  private orderIdCounter = 1000;

  constructor(restaurantId: string) {
    this.restaurantId = restaurantId;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return demoProducts.filter(p => p.available);
  }

  async getProduct(productId: string): Promise<Product | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return demoProducts.find(p => p.id === productId) || null;
  }

  // Orders
  async createOrder(orderData: {
    items: OrderItem[];
    channel: string;
    tableId?: string;
    customer?: { name?: string; phone?: string };
  }): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const orderId = `order-${this.orderIdCounter++}`;
    
    // Calculate totals
    const subtotal = orderData.items.reduce((sum, item) => {
      const optionsPrice = item.options.reduce((optSum, opt) => optSum + opt.price, 0);
      return sum + (item.unitPrice + optionsPrice) * item.qty;
    }, 0);

    const serviceFee = orderData.channel === 'dine_in' ? Math.round(subtotal * 0.1) : 0;
    const deliveryFee = orderData.channel === 'delivery' ? 590 : 0;
    const total = subtotal + serviceFee + deliveryFee;

    const order: Order = {
      id: orderId,
      ...orderData,
      orderNumber,
      status: 'placed',
      channel: orderData.channel as any,
      amounts: {
        subtotal,
        discounts: 0,
        fees: { 
          service: serviceFee,
          delivery: deliveryFee 
        },
        total
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.orders.push(order);
    
    // Simulate order progression
    this.simulateOrderProgression(orderId);

    return orderId;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status as any;
      order.updatedAt = new Date();
      
      if (status === 'closed') {
        order.closedAt = new Date();
      }
    }
  }

  async getOrder(orderId: string): Promise<Order | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.orders.find(o => o.id === orderId) || null;
  }

  async getOrders(): Promise<Order[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.orders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Coupons
  async getCoupon(code: string): Promise<Coupon | null> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const coupon = demoCoupons.find(c => 
      c.code === code.toUpperCase() && 
      c.active &&
      new Date() >= c.validFrom &&
      new Date() <= c.validTo
    );
    
    return coupon || null;
  }

  // Tables
  async getTables(): Promise<Table[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return demoTables;
  }

  // Simulate order progression for demo
  private simulateOrderProgression(orderId: string) {
    const statuses = ['confirmed', 'in_preparation', 'ready', 'served'];
    let currentIndex = 0;

    const progressOrder = () => {
      if (currentIndex < statuses.length) {
        setTimeout(() => {
          this.updateOrderStatus(orderId, statuses[currentIndex]);
          currentIndex++;
          progressOrder();
        }, Math.random() * 30000 + 10000); // 10-40 seconds between status changes
      }
    };

    // Start progression after 5 seconds
    setTimeout(progressOrder, 5000);
  }

  // Real-time listeners (mock implementation)
  subscribeToOrders(callback: (orders: Order[]) => void) {
    const interval = setInterval(async () => {
      const orders = await this.getOrders();
      callback(orders);
    }, 2000);

    return () => clearInterval(interval);
  }

  subscribeToOrder(orderId: string, callback: (order: Order | null) => void) {
    const interval = setInterval(async () => {
      const order = await this.getOrder(orderId);
      callback(order);
    }, 2000);

    return () => clearInterval(interval);
  }
}

// Factory function to create mock service instances
export const createMockService = (restaurantId: string) => new MockService(restaurantId);