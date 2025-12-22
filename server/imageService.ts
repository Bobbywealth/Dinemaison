import sharp from 'sharp';
import path from 'path';
import { logger } from './lib/logger';

interface ProcessedImage {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
}

interface ImageSize {
  width: number;
  height: number;
  suffix: string;
}

// Standard sizes for different use cases
const IMAGE_SIZES: Record<string, ImageSize[]> = {
  profile: [
    { width: 150, height: 150, suffix: 'thumb' },
    { width: 300, height: 300, suffix: 'medium' },
    { width: 600, height: 600, suffix: 'large' },
  ],
  gallery: [
    { width: 400, height: 300, suffix: 'thumb' },
    { width: 800, height: 600, suffix: 'medium' },
    { width: 1200, height: 900, suffix: 'large' },
  ],
  hero: [
    { width: 1920, height: 1080, suffix: 'full' },
    { width: 1280, height: 720, suffix: 'medium' },
  ],
};

class ImageService {
  private quality = 85;
  private format: 'webp' | 'jpeg' = 'webp'; // WebP for better compression

  /**
   * Process an uploaded image - resize, optimize, and convert to WebP
   */
  async processImage(
    inputBuffer: Buffer,
    type: keyof typeof IMAGE_SIZES = 'profile'
  ): Promise<Map<string, ProcessedImage>> {
    const results = new Map<string, ProcessedImage>();
    const sizes = IMAGE_SIZES[type] || IMAGE_SIZES.profile;

    try {
      // Get original image metadata
      const metadata = await sharp(inputBuffer).metadata();
      logger.info('Processing image', { 
        originalWidth: metadata.width, 
        originalHeight: metadata.height,
        type 
      });

      // Process each size
      for (const size of sizes) {
        const processed = await sharp(inputBuffer)
          .resize(size.width, size.height, {
            fit: type === 'profile' ? 'cover' : 'inside',
            position: 'center',
            withoutEnlargement: true,
          })
          .webp({ quality: this.quality })
          .toBuffer({ resolveWithObject: true });

        results.set(size.suffix, {
          buffer: processed.data,
          format: 'webp',
          width: processed.info.width,
          height: processed.info.height,
        });
      }

      logger.info('Image processed successfully', { 
        type, 
        variants: sizes.map(s => s.suffix) 
      });
      return results;
    } catch (error) {
      logger.error('Failed to process image', error);
      throw new Error('Image processing failed');
    }
  }

  /**
   * Process a single image to a specific size
   */
  async resizeImage(
    inputBuffer: Buffer,
    width: number,
    height: number,
    options: { fit?: 'cover' | 'contain' | 'fill' | 'inside'; format?: 'webp' | 'jpeg' | 'png' } = {}
  ): Promise<ProcessedImage> {
    try {
      const { fit = 'cover', format = 'webp' } = options;
      
      let pipeline = sharp(inputBuffer)
        .resize(width, height, {
          fit,
          position: 'center',
          withoutEnlargement: true,
        });

      // Apply format
      switch (format) {
        case 'jpeg':
          pipeline = pipeline.jpeg({ quality: this.quality });
          break;
        case 'png':
          pipeline = pipeline.png({ quality: this.quality });
          break;
        default:
          pipeline = pipeline.webp({ quality: this.quality });
      }

      const result = await pipeline.toBuffer({ resolveWithObject: true });
      
      return {
        buffer: result.data,
        format,
        width: result.info.width,
        height: result.info.height,
      };
    } catch (error) {
      logger.error('Failed to resize image', error);
      throw new Error('Image resize failed');
    }
  }

  /**
   * Optimize an image without resizing
   */
  async optimizeImage(inputBuffer: Buffer): Promise<ProcessedImage> {
    try {
      const result = await sharp(inputBuffer)
        .webp({ quality: this.quality })
        .toBuffer({ resolveWithObject: true });

      return {
        buffer: result.data,
        format: 'webp',
        width: result.info.width,
        height: result.info.height,
      };
    } catch (error) {
      logger.error('Failed to optimize image', error);
      throw new Error('Image optimization failed');
    }
  }

  /**
   * Get image metadata
   */
  async getMetadata(inputBuffer: Buffer) {
    try {
      return await sharp(inputBuffer).metadata();
    } catch (error) {
      logger.error('Failed to get image metadata', error);
      throw new Error('Failed to read image');
    }
  }

  /**
   * Validate image - check size, format, and dimensions
   */
  async validateImage(
    inputBuffer: Buffer,
    options: { maxSizeBytes?: number; allowedFormats?: string[]; minWidth?: number; minHeight?: number } = {}
  ): Promise<{ valid: boolean; error?: string }> {
    const {
      maxSizeBytes = 10 * 1024 * 1024, // 10MB default
      allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif'],
      minWidth = 200,
      minHeight = 200,
    } = options;

    try {
      // Check file size
      if (inputBuffer.length > maxSizeBytes) {
        return { valid: false, error: `Image too large. Maximum size is ${maxSizeBytes / 1024 / 1024}MB` };
      }

      const metadata = await sharp(inputBuffer).metadata();

      // Check format
      if (!metadata.format || !allowedFormats.includes(metadata.format)) {
        return { valid: false, error: `Invalid format. Allowed formats: ${allowedFormats.join(', ')}` };
      }

      // Check dimensions
      if ((metadata.width || 0) < minWidth || (metadata.height || 0) < minHeight) {
        return { valid: false, error: `Image too small. Minimum dimensions: ${minWidth}x${minHeight}px` };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Invalid or corrupted image file' };
    }
  }

  /**
   * Create a placeholder/blur image for lazy loading
   */
  async createPlaceholder(inputBuffer: Buffer): Promise<string> {
    try {
      const placeholder = await sharp(inputBuffer)
        .resize(20, 20, { fit: 'inside' })
        .blur(5)
        .webp({ quality: 20 })
        .toBuffer();

      return `data:image/webp;base64,${placeholder.toString('base64')}`;
    } catch (error) {
      logger.error('Failed to create placeholder', error);
      return '';
    }
  }
}

export const imageService = new ImageService();



