import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const path = req.path;

  // Skip logging for health checks and static assets
  if (path === '/health' || path.startsWith('/assets')) {
    return next();
  }

  // Capture the original json method to log response data
  let capturedJsonResponse: Record<string, any> | undefined = undefined;
  const originalResJson = res.json;
  
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Only log API calls
    if (path.startsWith('/api')) {
      const context: any = {
        method: req.method,
        path,
        statusCode: res.statusCode,
        duration,
      };

      // Add user context if authenticated
      const user = req.user as any;
      if (user?.claims?.sub) {
        context.userId = user.claims.sub;
      }

      // Add response data in development
      if (process.env.NODE_ENV === 'development' && capturedJsonResponse) {
        context.response = capturedJsonResponse;
      }

      logger.http(req.method, path, res.statusCode, duration, context);
    }
  });

  next();
}

