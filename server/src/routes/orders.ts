import { Router } from 'express';
import { Request, Response } from 'express';
import { createServiceFactory } from '../services';
import { validate, validateRestaurantId } from '../middleware/validation';
import { asyncHandler, successResponse, paginatedResponse } from '../middleware/errorHandler';
import { CreateOrderSchema, UpdateOrderStatusSchema, OrderQuerySchema } from '../models/schemas';

const router = Router();

// Apply restaurant ID validation to all routes
router.use('/:restaurantId/*', validateRestaurantId);

// Get all orders
router.get('/:restaurantId/orders',
  validate({ query: OrderQuerySchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;
    const queryParams = req.query as any;
    
    const serviceFactory = createServiceFactory(restaurantId);
    const orderRepository = serviceFactory.createOrderRepository();
    
    const result = await orderRepository.findWithQuery(queryParams);
    
    return paginatedResponse(res, result.orders, {
      page: result.currentPage,
      limit: queryParams.limit,
      total: result.total,
      totalPages: result.totalPages
    }, 'Orders retrieved successfully');
  })
);

// Create order
router.post('/:restaurantId/orders',
  validate({ body: CreateOrderSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;
    const orderData = req.body;
    
    const serviceFactory = createServiceFactory(restaurantId);
    const orderRepository = serviceFactory.createOrderRepository();
    
    const orderId = await orderRepository.createOrder(orderData);
    const order = await orderRepository.findById(orderId);
    
    return successResponse(res, order, 'Order created successfully', 201);
  })
);

// Update order status
router.patch('/:restaurantId/orders/:orderId/status',
  validate({ body: UpdateOrderStatusSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId, orderId } = req.params;
    const { status } = req.body;
    
    const serviceFactory = createServiceFactory(restaurantId);
    const orderRepository = serviceFactory.createOrderRepository();
    
    await orderRepository.updateStatus(orderId, status);
    const order = await orderRepository.findById(orderId);
    
    return successResponse(res, order, 'Order status updated successfully');
  })
);

export default router;
