import multer from 'multer';
import { Request } from 'express';
import { envConfig } from '../config/env';
import { ValidationError } from './errorHandler';

/**
 * File filter function for multer
 */
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allowed image types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError(
      `File type ${file.mimetype} is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`
    ));
  }
};

/**
 * Multer configuration for memory storage
 * Files are stored in memory as Buffer objects for direct upload to Firebase Storage
 */
const multerConfig = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: envConfig.upload.maxFileSizeBytes,
    files: 1, // Limit to 1 file per upload
    fields: 10, // Max number of non-file fields
    fieldNameSize: 100, // Max field name size
    fieldSize: 1024 * 1024 // 1MB max field size
  },
  fileFilter
});

/**
 * Single file upload middleware
 */
export const uploadSingle = (fieldName: string = 'image') => {
  return multerConfig.single(fieldName);
};

/**
 * Multiple files upload middleware
 */
export const uploadMultiple = (fieldName: string = 'images', maxCount: number = 5) => {
  return multerConfig.array(fieldName, maxCount);
};

/**
 * Upload fields middleware (for multiple different fields)
 */
export const uploadFields = (fields: Array<{ name: string; maxCount?: number }>) => {
  return multerConfig.fields(fields);
};

/**
 * Product image upload middleware
 */
export const uploadProductImage = uploadSingle('image');

/**
 * Restaurant logo upload middleware
 */
export const uploadRestaurantLogo = uploadSingle('logo');

/**
 * QR code upload middleware
 */
export const uploadQRCode = uploadSingle('qrcode');

/**
 * Generic image upload middleware
 */
export const uploadImage = uploadSingle('image');

/**
 * Error handling middleware specifically for multer errors
 */
export const handleMulterError = (
  error: any,
  req: Request,
  res: any,
  next: any
) => {
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';
    let code = 'FILE_UPLOAD_ERROR';

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = `File size exceeds maximum allowed size of ${envConfig.upload.maxFileSizeMB}MB`;
        code = 'FILE_TOO_LARGE';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files uploaded';
        code = 'TOO_MANY_FILES';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        code = 'UNEXPECTED_FILE';
        break;
      case 'LIMIT_PART_COUNT':
        message = 'Too many parts in multipart form';
        code = 'TOO_MANY_PARTS';
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Field name too long';
        code = 'FIELD_NAME_TOO_LONG';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value too long';
        code = 'FIELD_VALUE_TOO_LONG';
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many fields';
        code = 'TOO_MANY_FIELDS';
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

  next(error);
};
