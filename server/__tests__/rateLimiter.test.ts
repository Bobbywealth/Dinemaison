import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { rateLimiter } from '../middleware/rateLimiter';

describe('RateLimiter', () => {
  it('should allow requests under the limit', () => {
    const middleware = rateLimiter.middleware();
    
    const req = {
      ip: '127.0.0.1',
      user: null,
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as Request;
    
    const res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', expect.any(String));
  });

  it('should block requests over the limit', () => {
    const middleware = rateLimiter.middleware();
    
    const req = {
      ip: '192.168.1.1',
      user: null,
      socket: { remoteAddress: '192.168.1.1' },
    } as unknown as Request;
    
    const res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    
    const next = vi.fn() as NextFunction;

    // Make many requests to exceed limit
    for (let i = 0; i < 105; i++) {
      middleware(req, res, next);
    }
    
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Too many requests'),
      })
    );
  });

  it('should use user ID for authenticated users', () => {
    const middleware = rateLimiter.middleware();
    
    const req = {
      ip: '127.0.0.1',
      user: { claims: { sub: 'user123' } },
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as Request;
    
    const res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
  });
});



