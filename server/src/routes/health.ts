import { Router } from 'express';
import { successResponse, asyncHandler } from '../middleware/errorHandler';
import { db } from '../config/firebase';

const router = Router();

// Health check endpoint
router.get('/', asyncHandler(async (req, res) => {
  // Try to fetch something trivial from Firestore to verify connection
  let firebaseStatus = 'connected';
  let firebaseMessage = 'OK';

  try {
    await db.collection('_health').doc('ping').set({ timestamp: new Date() });
  } catch (error: any) {
    firebaseStatus = 'error';
    firebaseMessage = error?.message || 'Unknown error';
  }

  const memoryUsage = process.memoryUsage();
  
  return successResponse(res, {
    status: 'healthy',
    services: {
      firebase: { status: firebaseStatus, message: firebaseMessage },
      database: { status: firebaseStatus, message: firebaseMessage }
    },
    uptime: process.uptime(),
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100
    }
  }, 'API is healthy');
}));

export default router;
