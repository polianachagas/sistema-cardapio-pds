import { BaseRepository } from './BaseRepository';
import { Order, OrderStatus, OrderChannel } from '../models/types';
import { OrderQueryInput } from '../models/schemas';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Order Repository
 * Handles all order-related database operations
 */
export class OrderRepository extends BaseRepository<Order> {
  constructor(restaurantId: string) {
    super('orders', restaurantId);
  }

  /**
   * Create a new order with calculated amounts
   */
  async createOrder(orderData: {
    items: Order['items'];
    channel: OrderChannel;
    tableId?: string;
    customer?: Order['customer'];
  }): Promise<string> {
    try {
      // Generate order number
      const orderNumber = Math.floor(1000 + Math.random() * 9000);
      
      // Calculate amounts
      const subtotal = orderData.items.reduce((sum, item) => {
        const optionsPrice = item.options.reduce((optSum, opt) => optSum + opt.price, 0);
        return sum + (item.unitPrice + optionsPrice) * item.qty;
      }, 0);

      // Calculate fees based on channel
      const serviceFee = orderData.channel === 'dine_in' ? Math.round(subtotal * 0.1) : 0;
      const deliveryFee = orderData.channel === 'delivery' ? 500 : 0; // 5.00 in cents
      
      const total = subtotal + serviceFee + deliveryFee;

      const order = {
        restaurantId: this.restaurantId,
        ...orderData,
        orderNumber,
        status: 'placed' as OrderStatus,
        amounts: {
          subtotal,
          discounts: 0,
          fees: {
            service: serviceFee || undefined,
            delivery: deliveryFee || undefined
          },
          total
        }
      };

      return this.create(order);
    } catch (error) {
      throw new Error(`Failed to create order: ${error}`);
    }
  }

  /**
   * Update order status
   */
  async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    const updates: any = { status };
    
    if (status === 'closed') {
      updates.closedAt = new Date();
    }

    return this.update(orderId, updates);
  }

  /**
   * Find orders by status
   */
  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return this.findWhere(
      'status',
      '==',
      status,
      { field: 'createdAt', direction: 'desc' }
    );
  }

  /**
   * Find orders by channel
   */
  async findByChannel(channel: OrderChannel): Promise<Order[]> {
    return this.findWhere(
      'channel',
      '==',
      channel,
      { field: 'createdAt', direction: 'desc' }
    );
  }

  /**
   * Find orders by table
   */
  async findByTable(tableId: string): Promise<Order[]> {
    return this.findWhere(
      'tableId',
      '==',
      tableId,
      { field: 'createdAt', direction: 'desc' }
    );
  }

  /**
   * Find active orders (not closed or canceled)
   */
  async findActive(): Promise<Order[]> {
    try {
      const query = this.getCollection()
        .where('status', 'not-in', ['closed', 'canceled'])
        .orderBy('createdAt', 'desc');
      
      return this.executeQuery(query);
    } catch (error) {
      throw new Error(`Failed to find active orders: ${error}`);
    }
  }

  /**
   * Find orders by date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    try {
      const query = this.getCollection()
        .where('createdAt', '>=', startDate)
        .where('createdAt', '<=', endDate)
        .orderBy('createdAt', 'desc');
      
      return this.executeQuery(query);
    } catch (error) {
      throw new Error(`Failed to find orders by date range: ${error}`);
    }
  }

  /**
   * Find orders with complex query
   */
  async findWithQuery(queryParams: OrderQueryInput): Promise<{
    orders: Order[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      let query = this.getCollection();

      // Apply filters
      if (queryParams.status) {
        query = query.where('status', '==', queryParams.status);
      }

      if (queryParams.channel) {
        query = query.where('channel', '==', queryParams.channel);
      }

      if (queryParams.tableId) {
        query = query.where('tableId', '==', queryParams.tableId);
      }

      if (queryParams.dateFrom) {
        query = query.where('createdAt', '>=', new Date(queryParams.dateFrom));
      }

      if (queryParams.dateTo) {
        query = query.where('createdAt', '<=', new Date(queryParams.dateTo));
      }

      // Apply sorting
      const sortField = queryParams.sortBy || 'createdAt';
      query = query.orderBy(sortField, queryParams.sortOrder);

      // Get total count for pagination
      const countSnapshot = await query.count().get();
      const total = countSnapshot.data().count;

      // Apply pagination
      const offset = (queryParams.page - 1) * queryParams.limit;
      if (offset > 0) {
        query = query.limit(offset + queryParams.limit);
        const snapshot = await query.get();
        const allDocs = this.transformSnapshot(snapshot);
        const orders = allDocs.slice(offset);

        const totalPages = Math.ceil(total / queryParams.limit);

        return {
          orders,
          total,
          totalPages,
          currentPage: queryParams.page
        };
      } else {
        query = query.limit(queryParams.limit);
        const snapshot = await query.get();
        const orders = this.transformSnapshot(snapshot);

        const totalPages = Math.ceil(total / queryParams.limit);

        return {
          orders,
          total,
          totalPages,
          currentPage: queryParams.page
        };
      }
    } catch (error) {
      throw new Error(`Failed to query orders: ${error}`);
    }
  }

  /**
   * Get order analytics
   */
  async getAnalytics(startDate?: Date, endDate?: Date): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<OrderStatus, number>;
    ordersByChannel: Record<OrderChannel, number>;
    topProducts: Array<{ productId: string; name: string; quantity: number; revenue: number }>;
  }> {
    try {
      let query = this.getCollection();

      if (startDate) {
        query = query.where('createdAt', '>=', startDate);
      }

      if (endDate) {
        query = query.where('createdAt', '<=', endDate);
      }

      const orders = await this.executeQuery(query);

      // Calculate basic metrics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.amounts.total, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Orders by status
      const ordersByStatus: Record<OrderStatus, number> = {
        draft: 0,
        placed: 0,
        confirmed: 0,
        in_preparation: 0,
        ready: 0,
        served: 0,
        closed: 0,
        canceled: 0
      };

      // Orders by channel
      const ordersByChannel: Record<OrderChannel, number> = {
        dine_in: 0,
        takeaway: 0,
        delivery: 0
      };

      // Product analytics
      const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};

      orders.forEach(order => {
        // Count by status
        ordersByStatus[order.status]++;

        // Count by channel
        ordersByChannel[order.channel]++;

        // Product stats
        order.items.forEach(item => {
          if (!productStats[item.productId]) {
            productStats[item.productId] = {
              name: item.name,
              quantity: 0,
              revenue: 0
            };
          }

          productStats[item.productId].quantity += item.qty;
          productStats[item.productId].revenue += item.unitPrice * item.qty;
        });
      });

      // Get top products
      const topProducts = Object.entries(productStats)
        .map(([productId, stats]) => ({
          productId,
          ...stats
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        ordersByStatus,
        ordersByChannel,
        topProducts
      };
    } catch (error) {
      throw new Error(`Failed to get order analytics: ${error}`);
    }
  }

  /**
   * Get recent orders
   */
  async getRecent(limit: number = 20): Promise<Order[]> {
    return this.findAll(
      { field: 'createdAt', direction: 'desc' },
      limit
    );
  }

  /**
   * Cancel order
   */
  async cancel(orderId: string, reason?: string): Promise<void> {
    const updates: any = {
      status: 'canceled',
      closedAt: new Date()
    };

    if (reason) {
      updates.cancelReason = reason;
    }

    return this.update(orderId, updates);
  }

  /**
   * Add payment to order
   */
  async addPayment(orderId: string, payment: Order['payments'][0]): Promise<void> {
    try {
      const order = await this.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const payments = order.payments || [];
      payments.push(payment);

      return this.update(orderId, { payments });
    } catch (error) {
      throw new Error(`Failed to add payment: ${error}`);
    }
  }

  /**
   * Get orders requiring attention (old pending orders)
   */
  async getOrdersRequiringAttention(minutesThreshold: number = 30): Promise<Order[]> {
    try {
      const thresholdTime = new Date();
      thresholdTime.setMinutes(thresholdTime.getMinutes() - minutesThreshold);

      const query = this.getCollection()
        .where('status', 'in', ['placed', 'confirmed'])
        .where('createdAt', '<', thresholdTime)
        .orderBy('createdAt', 'asc');

      return this.executeQuery(query);
    } catch (error) {
      throw new Error(`Failed to get orders requiring attention: ${error}`);
    }
  }
}
