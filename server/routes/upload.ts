import type { Express } from 'express';
import { isAuthenticated } from '../auth';
import { uploadImageMiddleware, uploadDocumentMiddleware, handleImageUpload, UploadMiddleware } from '../middleware/upload';
import { storage } from '../storage';
import { logger } from '../lib/logger';

export function registerUploadRoutes(app: Express) {
  // Upload chef profile image
  app.post('/api/upload/profile-image', 
    isAuthenticated, 
    uploadImageMiddleware('profiles'),
    async (req, res) => {
      try {
        const url = await handleImageUpload(req, 'profiles');
        res.json({ url });
      } catch (error) {
        logger.error('Profile image upload failed', error);
        res.status(500).json({ message: 'Failed to upload profile image' });
      }
    }
  );

  // Upload chef gallery image
  app.post('/api/upload/gallery-image',
    isAuthenticated,
    uploadImageMiddleware('gallery'),
    async (req, res) => {
      try {
        const userId = (req.user as any)?.id;
        if (!userId) {
          return res.status(401).json({ message: 'Not authenticated' });
        }

        const url = await handleImageUpload(req, 'gallery');
        
        // Get chef profile
        const chefProfile = await storage.getChefByUserId(userId);
        if (!chefProfile) {
          return res.status(404).json({ message: 'Chef profile not found' });
        }

        // Add to gallery
        const galleryItem = await storage.addChefGalleryItem({
          chefId: chefProfile.id,
          imageUrl: url,
          caption: req.body.caption || '',
          sortOrder: req.body.sortOrder || 0,
        });

        res.json(galleryItem);
      } catch (error) {
        logger.error('Gallery image upload failed', error);
        res.status(500).json({ message: 'Failed to upload gallery image' });
      }
    }
  );

  // Delete gallery image
  app.delete('/api/upload/gallery-image/:id',
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = (req.user as any)?.id;
        if (!userId) {
          return res.status(401).json({ message: 'Not authenticated' });
        }

        const chefProfile = await storage.getChefByUserId(userId);
        if (!chefProfile) {
          return res.status(404).json({ message: 'Chef profile not found' });
        }

        // Get gallery item to get URL
        const gallery = await storage.getChefGallery(chefProfile.id);
        const item = gallery.find(g => g.id === req.params.id);
        
        if (!item) {
          return res.status(404).json({ message: 'Gallery item not found' });
        }

        // Delete from storage
        await UploadMiddleware.deleteFile(item.imageUrl);
        
        // Delete from database
        await storage.deleteChefGalleryItem(req.params.id);

        res.json({ success: true });
      } catch (error) {
        logger.error('Gallery image deletion failed', error);
        res.status(500).json({ message: 'Failed to delete gallery image' });
      }
    }
  );

  // Upload verification document
  app.post('/api/upload/verification-document',
    isAuthenticated,
    uploadDocumentMiddleware(),
    async (req, res) => {
      try {
        const userId = (req.user as any)?.id;
        if (!userId) {
          return res.status(401).json({ message: 'Not authenticated' });
        }

        const chefProfile = await storage.getChefByUserId(userId);
        if (!chefProfile) {
          return res.status(404).json({ message: 'Chef profile not found' });
        }

        const url = await handleImageUpload(req, 'documents');

        // Create verification document record
        const document = await storage.submitVerificationDocument({
          chefId: chefProfile.id,
          documentType: req.body.documentType || 'other',
          documentUrl: url,
          status: 'pending',
        });

        res.json(document);
      } catch (error) {
        logger.error('Document upload failed', error);
        res.status(500).json({ message: 'Failed to upload document' });
      }
    }
  );

  // Get upload presigned URL (for direct browser uploads)
  app.post('/api/upload/presigned-url',
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = (req.user as any)?.id;
        if (!userId) {
          return res.status(401).json({ message: 'Not authenticated' });
        }

        const { fileName, fileType, folder } = req.body;

        if (!fileName || !fileType || !folder) {
          return res.status(400).json({ message: 'fileName, fileType, and folder are required' });
        }

        // Validate folder
        const allowedFolders = ['profiles', 'gallery', 'documents'];
        if (!allowedFolders.includes(folder)) {
          return res.status(400).json({ message: 'Invalid folder' });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const extension = fileName.split('.').pop();
        const uniqueFileName = `${userId}_${timestamp}_${randomString}.${extension}`;
        const path = `${folder}/${uniqueFileName}`;

        // In a real implementation, you would generate a presigned URL here
        // For now, we'll return the path where the file should be uploaded
        res.json({
          uploadUrl: `/api/upload/direct/${path}`,
          fileUrl: path,
          expiresIn: 3600, // 1 hour
        });
      } catch (error) {
        logger.error('Presigned URL generation failed', error);
        res.status(500).json({ message: 'Failed to generate upload URL' });
      }
    }
  );
}



