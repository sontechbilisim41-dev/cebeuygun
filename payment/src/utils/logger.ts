import winston from 'winston';
import { config } from '@/config';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'payment' },
  transports: [
    new winston.transports.Console({
      format: config.nodeEnv === 'production' 
        ? logFormat 
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
    }),
  ],
});

if (config.nodeEnv === 'production') {
  logger.add(new winston.transports.File({ 
    filename: 'logs/error.log', 
    level: 'error' 
  }));
  logger.add(new winston.transports.File({ 
    filename: 'logs/combined.log' 
  }));
}

// Security logging for PCI compliance
export const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'payment-security' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/security.log',
      level: 'info'
    }),
  ],
});

// Fraud detection logging
export const fraudLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'payment-fraud' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/fraud.log',
      level: 'info'
    }),
  ],
});

// Performance logging helper
export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  const level = duration > 1000 ? 'warn' : 'info';
  logger.log(level, `Performance: ${operation}`, {
    duration_ms: duration,
    ...metadata,
  });
};

// Fastify-compatible logger
export const fastifyLogger = {
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  debug: logger.debug.bind(logger),
  fatal: logger.error.bind(logger),
  trace: logger.debug.bind(logger),
  child: () => fastifyLogger,
};