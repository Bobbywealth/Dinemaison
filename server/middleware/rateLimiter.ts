import type { Request, Response, NextFunction } from 'express';
import { config } from '../config';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  private getKey(req: Request): string {
    // Use IP address or user ID if authenticated
    const userId = (req.user as any)?.claims?.sub;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return userId || ip;
  }

  public middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.getKey(req);
      const now = Date.now();
      const windowMs = config.rateLimit.windowMs;
      const maxRequests = config.rateLimit.max;

      // Initialize or get existing rate limit data
      if (!this.store[key] || this.store[key].resetTime < now) {
        this.store[key] = {
          count: 0,
          resetTime: now + windowMs,
        };
      }

      const data = this.store[key];
      data.count++;

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - data.count).toString());
      res.setHeader('X-RateLimit-Reset', new Date(data.resetTime).toISOString());

      // Check if rate limit exceeded
      if (data.count > maxRequests) {
        res.status(429).json({
          message: 'Too many requests, please try again later.',
          retryAfter: Math.ceil((data.resetTime - now) / 1000),
        });
        return;
      }

      next();
    };
  }

  public destroy() {
    clearInterval(this.cleanupInterval);
    this.store = {};
  }
}

// Create singleton instance
export const rateLimiter = new RateLimiter();

// Export middleware
export const rateLimitMiddleware = rateLimiter.middleware();

// Stricter rate limit for auth endpoints
export function authRateLimitMiddleware() {
  const authStore: RateLimitStore = {};
  
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 10; // Only 10 auth attempts per 15 minutes

    if (!authStore[ip] || authStore[ip].resetTime < now) {
      authStore[ip] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    const data = authStore[ip];
    data.count++;

    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - data.count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(data.resetTime).toISOString());

    if (data.count > maxRequests) {
      res.status(429).json({
        message: 'Too many authentication attempts, please try again later.',
        retryAfter: Math.ceil((data.resetTime - now) / 1000),
      });
      return;
    }

    next();
  };
}
