import { Router } from 'express';
import { Request, Response } from 'express';
import { createServiceFactory } from '../services';
import { validateRestaurantId } from '../middleware/validation';
import { uploadImage } from '../middleware/upload';
import { asyncHandler, successResponse } from '../middleware/errorHandler';

const router = Router();

// Apply restaurant ID validation to all routes
router.use('/:restaurantId/*', validateRestaurantId);

// Generic image upload
router.post('/:restaurantId/upload/image',
  uploadImage,
  asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;
    const file = req.file;

    if (!file) {
      return successResponse(res, null, 'No file uploaded');
    }

    const serviceFactory = createServiceFactory(restaurantId);
    const storageService = serviceFactory.createStorageService();

    const { url, filename } = await storageService.uploadImage(file);

    return successResponse(res, { url, filename }, 'Image uploaded successfully');
  })
);

export default router;
