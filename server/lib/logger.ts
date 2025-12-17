import { config } from '../config';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogContext {
  [key: string]: any;
}

class Logger {
  private level: LogLevel;
  private isPretty: boolean;

  constructor() {
    this.level = this.parseLevel(config.logging.level);
    this.isPretty = config.logging.format === 'pretty';
  }

  private parseLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
        return LogLevel.INFO;
      case 'warn':
        return LogLevel.WARN;
      case 'error':
        return LogLevel.ERROR;
      default:
        return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private formatTime(): string {
    return new Date().toISOString();
  }

  private formatPretty(level: string, message: string, context?: LogContext): string {
    const time = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    
    const emoji = {
      DEBUG: '🔍',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌',
    }[level] || '';

    let output = `${time} ${emoji} [${level}] ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      output += '\n' + JSON.stringify(context, null, 2);
    }
    
    return output;
  }

  private formatJSON(level: string, message: string, context?: LogContext): string {
    const logEntry = {
      timestamp: this.formatTime(),
      level,
      message,
      ...context,
      environment: config.server.env,
    };
    
    return JSON.stringify(logEntry);
  }

  private log(level: LogLevel, levelName: string, message: string, context?: LogContext) {
    if (!this.shouldLog(level)) {
      return;
    }

    const formatted = this.isPretty
      ? this.formatPretty(levelName, message, context)
      : this.formatJSON(levelName, message, context);

    const output = level >= LogLevel.ERROR ? console.error : console.log;
    output(formatted);
  }

  public debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, 'DEBUG', message, context);
  }

  public info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, 'INFO', message, context);
  }

  public warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, 'WARN', message, context);
  }

  public error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext: LogContext = {
      ...context,
    };

    if (error instanceof Error) {
      errorContext.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      errorContext.error = error;
    }

    this.log(LogLevel.ERROR, 'ERROR', message, errorContext);
  }

  public http(method: string, path: string, statusCode: number, duration: number, context?: LogContext) {
    const message = `${method} ${path} ${statusCode} ${duration}ms`;
    const level = statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    
    this.log(level, 'HTTP', message, {
      ...context,
      method,
      path,
      statusCode,
      duration,
    });
  }

  public child(context: LogContext): ChildLogger {
    return new ChildLogger(this, context);
  }
}

class ChildLogger {
  constructor(
    private parent: Logger,
    private context: LogContext
  ) {}

  public debug(message: string, context?: LogContext) {
    this.parent.debug(message, { ...this.context, ...context });
  }

  public info(message: string, context?: LogContext) {
    this.parent.info(message, { ...this.context, ...context });
  }

  public warn(message: string, context?: LogContext) {
    this.parent.warn(message, { ...this.context, ...context });
  }

  public error(message: string, error?: Error | unknown, context?: LogContext) {
    this.parent.error(message, error, { ...this.context, ...context });
  }

  public http(method: string, path: string, statusCode: number, duration: number, context?: LogContext) {
    this.parent.http(method, path, statusCode, duration, { ...this.context, ...context });
  }
}

// Create and export singleton instance
export const logger = new Logger();

// Helper function to create request logger
export function createRequestLogger(req: any) {
  return logger.child({
    requestId: req.id || Math.random().toString(36).substring(7),
    userId: req.user?.claims?.sub,
    ip: req.ip || req.socket.remoteAddress,
  });
}
