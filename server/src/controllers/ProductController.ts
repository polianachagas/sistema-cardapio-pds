import { Request, Response, NextFunction } from 'express';
import { createServiceFactory } from '../services';
import { 
  CreateProductInput, 
  UpdateProductInput, 
  ProductQueryInput 
} from '../models/schemas';
import { 
  asyncHandler, 
  successResponse, 
  paginatedResponse 
} from '../middleware/errorHandler';
import { NotFoundError } from '../middleware/errorHandler';

/**
 * Product Controller
 * Handles all product-related HTTP requests
 */
export class ProductController {
  /**
   * Get all products for a restaurant
   * GET /api/v1/restaurants/:restaurantId/products
   */
  static getAllProducts = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;
    const queryParams = req.query as any as ProductQueryInput;

    const serviceFactory = createServiceFactory(restaurantId);
    const productRepository = serviceFactory.createProductRepository();

    const result = await productRepository.findWithQuery(queryParams);

    return paginatedResponse(
      res,
      result.products,
      {
        page: result.currentPage,
        limit: queryParams.limit,
        total: result.total,
        totalPages: result.totalPages
      },
      'Products retrieved successfully'
    );
  });

  /**
   * Get product by ID
   * GET /api/v1/restaurants/:restaurantId/products/:productId
   */
  static getProductById = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId, productId } = req.params;

    const serviceFactory = createServiceFactory(restaurantId);
    const productRepository = serviceFactory.createProductRepository();

    const product = await productRepository.findById(productId);

    if (!product) {
      throw new NotFoundError('Product');
    }

    return successResponse(res, product, 'Product retrieved successfully');
  });

  /**
   * Create new product
   * POST /api/v1/restaurants/:restaurantId/products
   */
  static createProduct = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;
    const productData: CreateProductInput = req.body;

    const serviceFactory = createServiceFactory(restaurantId);
    const productRepository = serviceFactory.createProductRepository();

    const productId = await productRepository.create(productData);
    const product = await productRepository.findById(productId);

    return successResponse(res, product, 'Product created successfully', 201);
  });

  /**
   * Update product
   * PUT /api/v1/restaurants/:restaurantId/products/:productId
   */
  static updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId, productId } = req.params;
    const updateData: UpdateProductInput = req.body;

    const serviceFactory = createServiceFactory(restaurantId);
    const productRepository = serviceFactory.createProductRepository();

    // Check if product exists
    const existingProduct = await productRepository.findById(productId);
    if (!existingProduct) {
      throw new NotFoundError('Product');
    }

    await productRepository.update(productId, updateData);
    const updatedProduct = await productRepository.findById(productId);

    return successResponse(res, updatedProduct, 'Product updated successfully');
  });

  /**
   * Delete product
   * DELETE /api/v1/restaurants/:restaurantId/products/:productId
   */
  static deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId, productId } = req.params;

    const serviceFactory = createServiceFactory(restaurantId);
    const productRepository = serviceFactory.createProductRepository();

    // Check if product exists
    const existingProduct = await productRepository.findById(productId);
    if (!existingProduct) {
      throw new NotFoundError('Product');
    }

    // Delete product image if exists
    if (existingProduct.imageUrl) {
      try {
        const storageService = serviceFactory.createStorageService();
        await storageService.deleteFileByUrl(existingProduct.imageUrl);
      } catch (error) {
        console.warn('Failed to delete product image:', error);
      }
    }

    await productRepository.delete(productId);

    return successResponse(res, null, 'Product deleted successfully');
  });

  /**
   * Get products by category
   * GET /api/v1/restaurants/:restaurantId/products/category/:category
   */
  static getProductsByCategory = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId, category } = req.params;

    const serviceFactory = createServiceFactory(restaurantId);
    const productRepository = serviceFactory.createProductRepository();

    const products = await productRepository.findByCategory(decodeURIComponent(category));

    return successResponse(res, products, 'Products retrieved successfully');
  });

  /**
   * Get available products
   * GET /api/v1/restaurants/:restaurantId/products/available
   */
  static getAvailableProducts = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;

    const serviceFactory = createServiceFactory(restaurantId);
    const productRepository = serviceFactory.createProductRepository();

    const products = await productRepository.findAvailable();

    return successResponse(res, products, 'Available products retrieved successfully');
  });

  /**
   * Get highlighted products
   * GET /api/v1/restaurants/:restaurantId/products/highlighted
   */
  static getHighlightedProducts = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;

    const serviceFactory = createServiceFactory(restaurantId);
    const productRepository = serviceFactory.createProductRepository();

    const products = await productRepository.findHighlighted();

    return successResponse(res, products, 'Highlighted products retrieved successfully');
  });

  /**
   * Get day specials
   * GET /api/v1/restaurants/:restaurantId/products/specials
   */
  static getDaySpecials = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;

    const serviceFactory = createServiceFactory(restaurantId);
    const productRepository = serviceFactory.createProductRepository();

    const products = await productRepository.findDaySpecials();

    return successResponse(res, products, 'Day specials retrieved successfully');
  });

  /**
   * Get product categories
   * GET /api/v1/restaurants/:restaurantId/products/categories
   */
  static getCategories = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;

    const serviceFactory = createServiceFactory(restaurantId);
    const productRepository = serviceFactory.createProductRepository();

    const categories = await productRepository.getCategories();

    return successResponse(res, categories, 'Categories retrieved successfully');
  });

  /**
   * Search products
   * GET /api/v1/restaurants/:restaurantId/products/search?q=:searchTerm
   */
  static searchProducts = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return successResponse(res, [], 'Search term is required');
    }

    const serviceFactory = createServiceFactory(restaurantId);
    const productRepository = serviceFactory.createProductRepository();

    const products = await productRepository.search(q);

    return successResponse(res, products, 'Search results retrieved successfully');
  });

  /**
   * Update product availability
   * PATCH /api/v1/restaurants/:restaurantId/products/:productId/availability
   */
  static updateAvailability = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId, productId } = req.params;
    const { available } = req.body;

    const serviceFactory = createServiceFactory(restaurantId);
    const productRepository = serviceFactory.createProductRepository();

    // Check if product exists
    const existingProduct = await productRepository.findById(productId);
    if (!existingProduct) {
      throw new NotFoundError('Product');
    }

    await productRepository.updateAvailability(productId, available);
    const updatedProduct = await productRepository.findById(productId);

    return successResponse(res, updatedProduct, 'Product availability updated successfully');
  });

  /**
   * Toggle product highlight
   * PATCH /api/v1/restaurants/:restaurantId/products/:productId/highlight
   */
  static toggleHighlight = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId, productId } = req.params;

    const serviceFactory = createServiceFactory(restaurantId);
    const productRepository = serviceFactory.createProductRepository();

    await productRepository.toggleHighlight(productId);
    const updatedProduct = await productRepository.findById(productId);

    return successResponse(res, updatedProduct, 'Product highlight toggled successfully');
  });

  /**
   * Toggle day special
   * PATCH /api/v1/restaurants/:restaurantId/products/:productId/special
   */
  static toggleDaySpecial = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId, productId } = req.params;

    const serviceFactory = createServiceFactory(restaurantId);
    const productRepository = serviceFactory.createProductRepository();

    await productRepository.toggleDaySpecial(productId);
    const updatedProduct = await productRepository.findById(productId);

    return successResponse(res, updatedProduct, 'Product day special toggled successfully');
  });

  /**
   * Update product positions (bulk update)
   * PATCH /api/v1/restaurants/:restaurantId/products/positions
   */
  static updatePositions = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;
    const { updates } = req.body; // Array of { id, position }

    const serviceFactory = createServiceFactory(restaurantId);
    const productRepository = serviceFactory.createProductRepository();

    await productRepository.updatePositions(updates);

    return successResponse(res, null, 'Product positions updated successfully');
  });

  /**
   * Upload product image
   * POST /api/v1/restaurants/:restaurantId/products/:productId/image
   */
  static uploadImage = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId, productId } = req.params;
    const file = req.file;

    if (!file) {
      return successResponse(res, null, 'No file uploaded');
    }

    const serviceFactory = createServiceFactory(restaurantId);
    const productRepository = serviceFactory.createProductRepository();
    const storageService = serviceFactory.createStorageService();

    // Check if product exists
    const existingProduct = await productRepository.findById(productId);
    if (!existingProduct) {
      throw new NotFoundError('Product');
    }

    // Delete old image if exists
    if (existingProduct.imageUrl) {
      try {
        await storageService.deleteFileByUrl(existingProduct.imageUrl);
      } catch (error) {
        console.warn('Failed to delete old product image:', error);
      }
    }

    // Upload new image
    const { url } = await storageService.uploadProductImage(file);

    // Update product with new image URL
    await productRepository.update(productId, { imageUrl: url });
    const updatedProduct = await productRepository.findById(productId);

    return successResponse(res, updatedProduct, 'Product image uploaded successfully');
  });
}
