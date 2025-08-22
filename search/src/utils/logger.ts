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
  defaultMeta: { service: 'search' },
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

// Performance logging helper
export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  const level = duration > config.performance.slowQueryThreshold ? 'warn' : 'info';
  logger.log(level, `Performance: ${operation}`, {
    duration_ms: duration,
    performance_target_met: duration <= config.performance.targetP95,
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