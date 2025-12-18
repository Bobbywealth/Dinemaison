import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '../lib/logger';

describe('Logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log info messages', () => {
    logger.info('Test message');
    expect(console.log).toHaveBeenCalled();
  });

  it('should log error messages', () => {
    const error = new Error('Test error');
    logger.error('Error occurred', error);
    expect(console.error).toHaveBeenCalled();
  });

  it('should log with context', () => {
    logger.info('Test message', { userId: '123', action: 'test' });
    expect(console.log).toHaveBeenCalled();
  });

  it('should log HTTP requests', () => {
    logger.http('GET', '/api/test', 200, 150);
    expect(console.log).toHaveBeenCalled();
  });

  it('should create child logger with context', () => {
    const childLogger = logger.child({ requestId: 'abc123' });
    childLogger.info('Test message');
    expect(console.log).toHaveBeenCalled();
  });

  it('should log errors with stack trace', () => {
    const error = new Error('Test error');
    logger.error('Something failed', error, { extra: 'data' });
    expect(console.error).toHaveBeenCalled();
  });
});

