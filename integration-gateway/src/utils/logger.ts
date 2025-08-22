import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from '@/config';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      service: 'integration-gateway',
      ...meta,
    });
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: {
    service: 'integration-gateway',
    version: '1.0.0',
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    
    // File transport for all logs
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
      level: 'info',
    }),
    
    // Error file transport
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
      level: 'error',
    }),
    
    // Audit file transport
    new DailyRotateFile({
      filename: 'logs/audit-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: config.logging.maxSize,
      maxFiles: config.logging.auditRetention,
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
});

// Add request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id,
      requestId: req.headers['x-request-id'],
    });
  });
  
  next();
};

// Security event logger
export const securityLogger = {
  logAuthFailure: (req: any, reason: string) => {
    logger.warn('Authentication failure', {
      reason,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
      timestamp: new Date().toISOString(),
    });
  },
  
  logSuspiciousActivity: (req: any, activity: string, details?: any) => {
    logger.warn('Suspicious activity detected', {
      activity,
      details,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
    });
  },
  
  logRateLimitExceeded: (req: any, limit: number) => {
    logger.warn('Rate limit exceeded', {
      limit,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
      timestamp: new Date().toISOString(),
    });
  },
};

// Performance logger
export const performanceLogger = {
  logSlowQuery: (query: string, duration: number, threshold: number = 1000) => {
    if (duration > threshold) {
      logger.warn('Slow query detected', {
        query,
        duration,
        threshold,
        timestamp: new Date().toISOString(),
      });
    }
  },
  
  logHighMemoryUsage: (usage: NodeJS.MemoryUsage, threshold: number = 500) => {
    const heapUsedMB = usage.heapUsed / 1024 / 1024;
    
    if (heapUsedMB > threshold) {
      logger.warn('High memory usage detected', {
        heapUsedMB,
        threshold,
        memoryUsage: usage,
        timestamp: new Date().toISOString(),
      });
    }
  },
};

// Integration-specific logger
export const integrationLogger = {
  logSyncStart: (integrationId: string, type: string) => {
    logger.info('Sync started', {
      integrationId,
      type,
      timestamp: new Date().toISOString(),
    });
  },
  
  logSyncComplete: (integrationId: string, type: string, result: any) => {
    logger.info('Sync completed', {
      integrationId,
      type,
      result,
      timestamp: new Date().toISOString(),
    });
  },
  
  logSyncError: (integrationId: string, type: string, error: any) => {
    logger.error('Sync failed', {
      integrationId,
      type,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  },
  
  logConnectionEvent: (integrationId: string, event: 'connected' | 'disconnected' | 'failed', details?: any) => {
    logger.info('Connection event', {
      integrationId,
      event,
      details,
      timestamp: new Date().toISOString(),
    });
  },
};