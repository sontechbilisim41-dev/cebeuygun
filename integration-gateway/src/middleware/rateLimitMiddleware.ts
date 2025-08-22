import { Request, Response, NextFunction } from 'express';
import { RateLimitConfig } from '@/types';
import { logger } from '@/utils/logger';

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
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, data] of Object.entries(this.store)) {
      if (now > data.resetTime) {
        delete this.store[key];
      }
    }
  }

  checkLimit(
    key: string,
    windowMs: number,
    maxRequests: number
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const resetTime = now + windowMs;
    
    if (!this.store[key] || now > this.store[key].resetTime) {
      this.store[key] = {
        count: 1,
        resetTime,
      };
      
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime,
      };
    }

    this.store[key].count++;
    
    const allowed = this.store[key].count <= maxRequests;
    const remaining = Math.max(0, maxRequests - this.store[key].count);
    
    return {
      allowed,
      remaining,
      resetTime: this.store[key].resetTime,
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

const rateLimiter = new RateLimiter();

export const rateLimitMiddleware = (config: RateLimitConfig) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const key = config.keyGenerator ? 
        config.keyGenerator(req) : 
        `${req.ip}:${req.route?.path || req.path}`;

      const result = rateLimiter.checkLimit(
        key,
        config.windowMs,
        config.maxRequests
      );

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
      });

      if (!result.allowed) {
        logger.warn('Rate limit exceeded', {
          key,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          path: req.path,
        });

        res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          timestamp: new Date().toISOString(),
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Rate limit middleware error:', error);
      next(); // Continue on error to avoid blocking requests
    }
  };
};

// Predefined rate limit configurations
export const rateLimits = {
  strict: rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
  }),
  
  moderate: rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50,
  }),
  
  lenient: rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200,
  }),
  
  webhook: rateLimitMiddleware({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 100,
    keyGenerator: (req) => `webhook:${req.params.integrationId}:${req.ip}`,
  }),
};