import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { validate, validateRestaurantId } from '../middleware/validation';
import { uploadProductImage } from '../middleware/upload';
import { 
  CreateProductSchema, 
  UpdateProductSchema,
  ProductParamsSchema,
  ProductQuerySchema
} from '../models/schemas';

const router = Router();

// Apply restaurant ID validation to all routes
router.use('/:restaurantId/*', validateRestaurantId);

// Product routes
router.get('/:restaurantId/products', 
  validate({ query: ProductQuerySchema }),
  ProductController.getAllProducts
);

router.get('/:restaurantId/products/categories', ProductController.getCategories);
router.get('/:restaurantId/products/available', ProductController.getAvailableProducts);
router.get('/:restaurantId/products/highlighted', ProductController.getHighlightedProducts);
router.get('/:restaurantId/products/specials', ProductController.getDaySpecials);
router.get('/:restaurantId/products/search', ProductController.searchProducts);

router.get('/:restaurantId/products/category/:category', ProductController.getProductsByCategory);

router.get('/:restaurantId/products/:productId',
  validate({ params: ProductParamsSchema }),
  ProductController.getProductById
);

router.post('/:restaurantId/products',
  validate({ body: CreateProductSchema }),
  ProductController.createProduct
);

router.put('/:restaurantId/products/:productId',
  validate({ params: ProductParamsSchema, body: UpdateProductSchema }),
  ProductController.updateProduct
);

router.delete('/:restaurantId/products/:productId',
  validate({ params: ProductParamsSchema }),
  ProductController.deleteProduct
);

router.patch('/:restaurantId/products/:productId/availability',
  validate({ params: ProductParamsSchema }),
  ProductController.updateAvailability
);

router.patch('/:restaurantId/products/:productId/highlight',
  validate({ params: ProductParamsSchema }),
  ProductController.toggleHighlight
);

router.patch('/:restaurantId/products/:productId/special',
  validate({ params: ProductParamsSchema }),
  ProductController.toggleDaySpecial
);

router.patch('/:restaurantId/products/positions',
  ProductController.updatePositions
);

router.post('/:restaurantId/products/:productId/image',
  validate({ params: ProductParamsSchema }),
  uploadProductImage,
  ProductController.uploadImage
);

export default router;
