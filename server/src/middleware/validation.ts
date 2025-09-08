import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from './errorHandler';

/**
 * Validation middleware factory
 * Creates middleware to validate request data against Zod schemas
 */
export const validate = (schemas: {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      // Validate URL parameters
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      // Validate query parameters
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Transform Zod error into our custom ValidationError
        const message = 'Request validation failed';
        const validationError = new ValidationError(message);
        return next(validationError);
      }
      next(error);
    }
  };
};

/**
 * Validate request body only
 */
export const validateBody = (schema: ZodSchema) => {
  return validate({ body: schema });
};

/**
 * Validate URL parameters only
 */
export const validateParams = (schema: ZodSchema) => {
  return validate({ params: schema });
};

/**
 * Validate query parameters only
 */
export const validateQuery = (schema: ZodSchema) => {
  return validate({ query: schema });
};

/**
 * Validate file upload
 */
export const validateFile = (options: {
  required?: boolean;
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
} = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const {
      required = false,
      maxSizeBytes = 10 * 1024 * 1024, // 10MB default
      allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']
    } = options;

    const file = req.file;

    // Check if file is required
    if (required && !file) {
      return next(new ValidationError('File is required'));
    }

    // If no file and not required, continue
    if (!file && !required) {
      return next();
    }

    // Validate file if present
    if (file) {
      // Check file size
      if (file.size > maxSizeBytes) {
        return next(new ValidationError(
          `File size exceeds maximum allowed size of ${maxSizeBytes / (1024 * 1024)}MB`
        ));
      }

      // Check MIME type
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return next(new ValidationError(
          `File type ${file.mimetype} is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`
        ));
      }
    }

    next();
  };
};

/**
 * Sanitize input data
 * Removes potentially dangerous characters and trims whitespace
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeString = (str: string): string => {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim(); // Trim whitespace
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * Rate limiting validation
 */
export const rateLimitValidation = (options: {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
}) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - options.windowMs;

    // Get or create request record
    let requestRecord = requests.get(identifier);
    
    // Reset if window has passed
    if (!requestRecord || requestRecord.resetTime < now) {
      requestRecord = {
        count: 0,
        resetTime: now + options.windowMs
      };
      requests.set(identifier, requestRecord);
    }

    // Clean up old entries
    for (const [key, record] of requests.entries()) {
      if (record.resetTime < now) {
        requests.delete(key);
      }
    }

    // Check if rate limit exceeded
    if (requestRecord.count >= options.maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          message: options.message || 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((requestRecord.resetTime - now) / 1000)
        },
        timestamp: new Date().toISOString()
      });
    }

    // Increment request count
    requestRecord.count++;

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': options.maxRequests.toString(),
      'X-RateLimit-Remaining': (options.maxRequests - requestRecord.count).toString(),
      'X-RateLimit-Reset': Math.ceil(requestRecord.resetTime / 1000).toString()
    });

    next();
  };
};

/**
 * Restaurant ID validation middleware
 * Ensures restaurantId exists in params and is valid
 */
export const validateRestaurantId = (req: Request, res: Response, next: NextFunction) => {
  const restaurantId = req.params.restaurantId;

  if (!restaurantId) {
    return next(new ValidationError('Restaurant ID is required'));
  }

  if (typeof restaurantId !== 'string' || restaurantId.trim().length === 0) {
    return next(new ValidationError('Invalid restaurant ID format'));
  }

  // Add restaurantId to request context for easy access
  (req as any).restaurantId = restaurantId;

  next();
};

/**
 * Pagination validation and parsing
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  const { page = '1', limit = '20' } = req.query;

  try {
    const parsedPage = Math.max(1, parseInt(page as string) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit as string) || 20)); // Max 100 items per page

    // Add parsed pagination to query
    req.query.page = parsedPage.toString();
    req.query.limit = parsedLimit.toString();

    next();
  } catch (error) {
    next(new ValidationError('Invalid pagination parameters'));
  }
};

/**
 * Content-Type validation
 */
export const validateContentType = (expectedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.get('Content-Type');

    if (!contentType) {
      return next(new ValidationError('Content-Type header is required'));
    }

    const matches = expectedTypes.some(type => 
      contentType.includes(type)
    );

    if (!matches) {
      return next(new ValidationError(
        `Invalid Content-Type. Expected: ${expectedTypes.join(' or ')}`
      ));
    }

    next();
  };
};

/**
 * JSON body validation
 */
export const validateJsonBody = validateContentType(['application/json']);

/**
 * Multipart form validation (for file uploads)
 */
export const validateMultipartForm = validateContentType(['multipart/form-data']);
