import { storage } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Storage Service for Firebase Cloud Storage
 * Handles file uploads, downloads, and management
 */
export class StorageService {
  private bucket;
  private restaurantId: string;

  constructor(restaurantId: string) {
    this.restaurantId = restaurantId;
    this.bucket = storage.bucket();
  }

  /**
   * Upload an image file
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'images'
  ): Promise<{ url: string; filename: string }> {
    try {
      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
      const filename = `${folder}/${uuidv4()}.${fileExtension}`;
      const filePath = `restaurants/${this.restaurantId}/${filename}`;

      // Create file reference
      const fileRef = this.bucket.file(filePath);

      // Upload file with metadata
      await fileRef.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname,
            uploadedAt: new Date().toISOString(),
            restaurantId: this.restaurantId
          }
        },
        public: true // Make file publicly accessible
      });

      // Get public URL
      const url = `https://storage.googleapis.com/${this.bucket.name}/${filePath}`;

      return { url, filename };
    } catch (error) {
      throw new Error(`Failed to upload image: ${error}`);
    }
  }

  /**
   * Upload product image
   */
  async uploadProductImage(file: Express.Multer.File): Promise<{ url: string; filename: string }> {
    return this.uploadImage(file, 'products');
  }

  /**
   * Upload restaurant logo
   */
  async uploadRestaurantLogo(file: Express.Multer.File): Promise<{ url: string; filename: string }> {
    return this.uploadImage(file, 'logos');
  }

  /**
   * Upload QR code image
   */
  async uploadQRCode(file: Express.Multer.File): Promise<{ url: string; filename: string }> {
    return this.uploadImage(file, 'qrcodes');
  }

  /**
   * Delete a file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = `restaurants/${this.restaurantId}/${filePath}`;
      const fileRef = this.bucket.file(fullPath);
      
      const [exists] = await fileRef.exists();
      if (exists) {
        await fileRef.delete();
      }
    } catch (error) {
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  /**
   * Delete file by URL
   */
  async deleteFileByUrl(url: string): Promise<void> {
    try {
      // Extract file path from URL
      const bucketName = this.bucket.name;
      const baseUrl = `https://storage.googleapis.com/${bucketName}/`;
      
      if (!url.startsWith(baseUrl)) {
        throw new Error('Invalid storage URL');
      }

      const filePath = url.replace(baseUrl, '');
      const fileRef = this.bucket.file(filePath);
      
      const [exists] = await fileRef.exists();
      if (exists) {
        await fileRef.delete();
      }
    } catch (error) {
      throw new Error(`Failed to delete file by URL: ${error}`);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const fullPath = `restaurants/${this.restaurantId}/${filePath}`;
      const fileRef = this.bucket.file(fullPath);
      const [exists] = await fileRef.exists();
      return exists;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(filePath: string): Promise<any> {
    try {
      const fullPath = `restaurants/${this.restaurantId}/${filePath}`;
      const fileRef = this.bucket.file(fullPath);
      const [metadata] = await fileRef.getMetadata();
      return metadata;
    } catch (error) {
      throw new Error(`Failed to get file metadata: ${error}`);
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(folder: string = ''): Promise<Array<{
    name: string;
    url: string;
    size: number;
    contentType: string;
    created: Date;
  }>> {
    try {
      const prefix = `restaurants/${this.restaurantId}/${folder}`;
      const [files] = await this.bucket.getFiles({ prefix });

      return files.map(file => ({
        name: file.name.replace(`restaurants/${this.restaurantId}/`, ''),
        url: `https://storage.googleapis.com/${this.bucket.name}/${file.name}`,
        size: parseInt(file.metadata.size || '0'),
        contentType: file.metadata.contentType || 'unknown',
        created: new Date(file.metadata.timeCreated)
      }));
    } catch (error) {
      throw new Error(`Failed to list files: ${error}`);
    }
  }

  /**
   * Generate signed URL for private file access
   */
  async generateSignedUrl(
    filePath: string,
    expiresInMinutes: number = 60
  ): Promise<string> {
    try {
      const fullPath = `restaurants/${this.restaurantId}/${filePath}`;
      const fileRef = this.bucket.file(fullPath);

      const expires = Date.now() + (expiresInMinutes * 60 * 1000);
      
      const [url] = await fileRef.getSignedUrl({
        action: 'read',
        expires: new Date(expires)
      });

      return url;
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error}`);
    }
  }

  /**
   * Copy file to new location
   */
  async copyFile(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      const sourceFullPath = `restaurants/${this.restaurantId}/${sourcePath}`;
      const destFullPath = `restaurants/${this.restaurantId}/${destinationPath}`;
      
      const sourceFile = this.bucket.file(sourceFullPath);
      const destFile = this.bucket.file(destFullPath);

      await sourceFile.copy(destFile);
    } catch (error) {
      throw new Error(`Failed to copy file: ${error}`);
    }
  }

  /**
   * Move file to new location
   */
  async moveFile(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      await this.copyFile(sourcePath, destinationPath);
      await this.deleteFile(sourcePath);
    } catch (error) {
      throw new Error(`Failed to move file: ${error}`);
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageUsage(): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<string, number>;
  }> {
    try {
      const files = await this.listFiles();
      
      const totalFiles = files.length;
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      
      const filesByType: Record<string, number> = {};
      files.forEach(file => {
        const type = file.contentType.split('/')[0] || 'unknown';
        filesByType[type] = (filesByType[type] || 0) + 1;
      });

      return {
        totalFiles,
        totalSize,
        filesByType
      };
    } catch (error) {
      throw new Error(`Failed to get storage usage: ${error}`);
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file: Express.Multer.File, options: {
    maxSizeBytes?: number;
    allowedMimeTypes?: string[];
  } = {}): { valid: boolean; error?: string } {
    const {
      maxSizeBytes = 10 * 1024 * 1024, // 10MB default
      allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']
    } = options;

    // Check file size
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${maxSizeBytes / (1024 * 1024)}MB`
      };
    }

    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `File type ${file.mimetype} is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Cleanup old files (older than specified days)
   */
  async cleanupOldFiles(folderPath: string, daysOld: number): Promise<number> {
    try {
      const files = await this.listFiles(folderPath);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let deletedCount = 0;
      
      for (const file of files) {
        if (file.created < cutoffDate) {
          await this.deleteFile(file.name);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      throw new Error(`Failed to cleanup old files: ${error}`);
    }
  }
}
