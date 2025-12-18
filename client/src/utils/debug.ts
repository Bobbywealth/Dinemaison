// Debug utilities for production issues
export const debug = {
  log: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Always log to console
    console.log(`[DineMaison Debug ${timestamp}]`, message, data);

    // Store in sessionStorage for debugging
    try {
      const logs = JSON.parse(sessionStorage.getItem('debug-logs') || '[]');
      logs.push(logEntry);
      // Keep only last 50 entries
      if (logs.length > 50) {
        logs.shift();
      }
      sessionStorage.setItem('debug-logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to store debug log:', e);
    }
  },

  warn: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(`[DineMaison Warning ${timestamp}]`, message, data);
    
    // Store warning for debugging
    try {
      const logs = JSON.parse(sessionStorage.getItem('debug-logs') || '[]');
      logs.push({
        timestamp,
        type: 'warning',
        message,
        data,
        url: window.location.href
      });
      if (logs.length > 50) {
        logs.shift();
      }
      sessionStorage.setItem('debug-logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to store warning log:', e);
    }
  },

  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    console.error(`[DineMaison Error ${timestamp}]`, message, error);
    
    // Store error for debugging
    try {
      const errors = JSON.parse(sessionStorage.getItem('debug-errors') || '[]');
      errors.push({
        timestamp,
        message,
        error: error?.message || error,
        stack: error?.stack,
        url: window.location.href
      });
      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.shift();
      }
      sessionStorage.setItem('debug-errors', JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to store error log:', e);
    }
  },

  // Get all stored logs for debugging
  getLogs: () => {
    try {
      return {
        logs: JSON.parse(sessionStorage.getItem('debug-logs') || '[]'),
        errors: JSON.parse(sessionStorage.getItem('debug-errors') || '[]')
      };
    } catch (e) {
      return { logs: [], errors: [] };
    }
  },

  // Clear debug logs
  clear: () => {
    sessionStorage.removeItem('debug-logs');
    sessionStorage.removeItem('debug-errors');
  }
};

// Expose debug tools globally in development and production for troubleshooting
if (typeof window !== 'undefined') {
  (window as any).dineMaisonDebug = debug;
}
