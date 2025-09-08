import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { envConfig } from '../config/env';

/**
 * Custom Error Classes
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    isOperational: boolean = true
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'TOO_MANY_REQUESTS');
    this.name = 'TooManyRequestsError';
  }
}

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err;

  // Log error
  console.error('Error:', {
    name: error.name,
    message: error.message,
    stack: envConfig.isDevelopment ? error.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const message = 'Validation failed';
    const details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));

    return res.status(400).json({
      success: false,
      error: {
        message,
        code: 'VALIDATION_ERROR',
        details
      },
      timestamp: new Date().toISOString()
    });
  }

  // Handle Firebase errors
  if (error.message.includes('Firebase')) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      error: {
        message: envConfig.isProduction 
          ? 'Database operation failed' 
          : error.message,
        code: 'DATABASE_ERROR'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Handle custom application errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.code
      },
      timestamp: new Date().toISOString()
    });
  }

  // Handle specific Node.js errors
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid ID format',
        code: 'INVALID_ID'
      },
      timestamp: new Date().toISOString()
    });
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      },
      timestamp: new Date().toISOString()
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Handle multer errors (file upload)
  if (error.name === 'MulterError') {
    let message = 'File upload error';
    let code = 'FILE_UPLOAD_ERROR';

    switch ((error as any).code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large';
        code = 'FILE_TOO_LARGE';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files';
        code = 'TOO_MANY_FILES';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        code = 'UNEXPECTED_FILE';
        break;
    }

    return res.status(400).json({
      success: false,
      error: {
        message,
        code
      },
      timestamp: new Date().toISOString()
    });
  }

  // Default server error
  const statusCode = (error as any).statusCode || 500;
  const message = envConfig.isProduction 
    ? 'Internal server error' 
    : error.message;

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: 'INTERNAL_SERVER_ERROR',
      ...(envConfig.isDevelopment && { stack: error.stack })
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND'
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass them to error handler
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Success response helper
 */
export const successResponse = (
  res: Response,
  data?: any,
  message?: string,
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Paginated response helper
 */
export const paginatedResponse = (
  res: Response,
  data: any[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  message?: string
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      ...pagination,
      hasNext: pagination.page < pagination.totalPages,
      hasPrev: pagination.page > 1
    },
    timestamp: new Date().toISOString()
  });
};
