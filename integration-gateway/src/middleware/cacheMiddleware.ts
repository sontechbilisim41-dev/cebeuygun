import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import { logger } from '@/utils/logger';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  set(key: string, data: any, ttlSeconds: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would track hits/misses in production
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

const cache = new MemoryCache();

export const cacheMiddleware = (ttlSeconds: number = 300) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Only cache GET requests
      if (req.method !== 'GET') {
        next();
        return;
      }

      // Generate cache key
      const cacheKey = generateCacheKey(req);
      
      // Check cache
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        logger.debug('Cache hit', { cacheKey, path: req.path });
        
        res.set('X-Cache', 'HIT');
        res.json(cachedData);
        return;
      }

      // Cache miss - intercept response
      const originalJson = res.json;
      res.json = function(data: any) {
        // Only cache successful responses
        if (res.statusCode === 200 && data.success) {
          cache.set(cacheKey, data, ttlSeconds);
          logger.debug('Response cached', { cacheKey, ttlSeconds });
        }
        
        res.set('X-Cache', 'MISS');
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next(); // Continue on error
    }
  };
};

function generateCacheKey(req: Request): string {
  const keyData = {
    path: req.path,
    query: req.query,
    user: req.user?.id,
  };
  
  const keyString = JSON.stringify(keyData);
  return createHash('md5').update(keyString).digest('hex');
}

export const invalidateCache = (pattern?: string): void => {
  if (pattern) {
    // In production, implement pattern-based invalidation
    logger.info(`Cache invalidation requested: ${pattern}`);
  } else {
    cache.clear();
    logger.info('Cache cleared completely');
  }
};

export const getCacheStats = () => cache.getStats();