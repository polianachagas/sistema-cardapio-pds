import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { envConfig } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { sanitizeInput } from './middleware/validation';

// Import routes
import healthRoutes from './routes/health';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import uploadRoutes from './routes/upload';

/**
 * Express application setup
 */
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
app.use(cors({
  origin: envConfig.cors.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression
app.use(compression());

// Logging
if (!envConfig.isProduction) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// API routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/restaurants', productRoutes);
app.use('/api/v1/restaurants', orderRoutes);
app.use('/api/v1/restaurants', uploadRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Digital Menu API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: envConfig.nodeEnv
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
