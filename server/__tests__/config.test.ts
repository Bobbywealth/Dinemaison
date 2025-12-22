import { describe, it, expect, beforeEach } from 'vitest';

describe('Config', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.PORT;
    delete process.env.NODE_ENV;
  });

  it('should have default values', async () => {
    const { config } = await import('../config');
    
    expect(config.server.port).toBeDefined();
    expect(config.server.host).toBe('0.0.0.0');
  });

  it('should parse PORT from environment', async () => {
    process.env.PORT = '3000';
    
    // Re-import to get fresh config
    delete require.cache[require.resolve('../config')];
    const { config } = await import('../config');
    
    expect(config.server.port).toBe(3000);
  });

  it('should have correct rate limit defaults', async () => {
    const { config } = await import('../config');
    
    expect(config.rateLimit.max).toBe(100);
    expect(config.rateLimit.windowMs).toBe(15 * 60 * 1000);
  });

  it('should have upload file size limits', async () => {
    const { config } = await import('../config');
    
    expect(config.uploads.maxFileSize).toBe(10 * 1024 * 1024); // 10MB
    expect(config.uploads.allowedImageTypes).toContain('image/jpeg');
  });
});



