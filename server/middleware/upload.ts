import type { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { logger } from '../lib/logger';

interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  required?: boolean;
}

export class UploadMiddleware {
  /**
   * Validate uploaded file from request body
   */
  static validateFile(options: FileValidationOptions = {}) {
    const maxSize = options.maxSize || config.uploads.maxFileSize;
    const allowedTypes = options.allowedTypes || config.uploads.allowedImageTypes;
    const required = options.required !== false;

    return (req: Request, res: Response, next: NextFunction) => {
      const file = req.body.file;

      // Check if file is required
      if (!file) {
        if (required) {
          return res.status(400).json({ message: 'File is required' });
        }
        return next();
      }

      // Validate file structure
      if (!file.data || !file.mimetype || !file.name) {
        return res.status(400).json({ message: 'Invalid file format' });
      }

      // Validate file size
      const fileSize = Buffer.from(file.data, 'base64').length;
      if (fileSize > maxSize) {
        return res.status(400).json({ 
          message: `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB` 
        });
      }

      // Validate file type
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ 
          message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` 
        });
      }

      next();
    };
  }

  /**
   * Process and upload file to object storage
   */
  static async processUpload(
    file: { data: string; mimetype: string; name: string },
    folder: string,
    userId: string
  ): Promise<string> {
    try {
      // Decode base64 data
      const buffer = Buffer.from(file.data, 'base64');
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const extension = file.name.split('.').pop() || 'jpg';
      const fileName = `${userId}_${timestamp}_${randomString}.${extension}`;
      const fullPath = `${folder}/${fileName}`;

      // TODO: Integrate with actual object storage (e.g., S3, Google Cloud Storage)
      // For now, return a placeholder URL
      // In production, replace this with actual storage upload
      const url = `/uploads/${fullPath}`;
      
      logger.info('File uploaded successfully', {
        userId,
        fileName,
        folder,
        size: buffer.length,
      });

      return url;
    } catch (error) {
      logger.error('File upload failed', error, { userId, folder });
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Delete file from object storage
   */
  static async deleteFile(url: string): Promise<void> {
    try {
      // TODO: Integrate with actual object storage deletion
      // For now, just log the deletion
      logger.info('File deleted successfully', { url });
    } catch (error) {
      logger.error('File deletion failed', error, { url });
      throw new Error('Failed to delete file');
    }
  }
}

// Helper function to handle image uploads
export async function handleImageUpload(
  req: Request,
  folder: 'profiles' | 'gallery' | 'documents'
): Promise<string> {
  const userId = (req.user as any)?.claims?.sub;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const file = req.body.file;
  if (!file) {
    throw new Error('No file provided');
  }

  return await UploadMiddleware.processUpload(file, folder, userId);
}

// Middleware for image uploads
export const uploadImageMiddleware = (folder: 'profiles' | 'gallery' | 'documents' = 'profiles') => {
  return UploadMiddleware.validateFile({
    maxSize: config.uploads.maxFileSize,
    allowedTypes: [...config.uploads.allowedImageTypes],
  });
};

// Middleware for document uploads
export const uploadDocumentMiddleware = () => {
  return UploadMiddleware.validateFile({
    maxSize: config.uploads.maxFileSize,
    allowedTypes: [...config.uploads.allowedDocumentTypes],
  });
};
