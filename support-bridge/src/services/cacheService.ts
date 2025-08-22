import Redis from 'ioredis';
import { config } from '@/config';
import { logger } from '@/utils/logger';

class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });

    this.redis.on('connect', () => {
      logger.info('Redis connected');
    });

    this.redis.on('error', (error) => {
      logger.error('Redis error:', error);
    });
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
      logger.error('Cache set error:', error);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.redis.incr(key);
    } catch (error) {
      logger.error('Cache incr error:', error);
      throw error;
    }
  }

  async decr(key: string): Promise<number> {
    try {
      return await this.redis.decr(key);
    } catch (error) {
      logger.error('Cache decr error:', error);
      throw error;
    }
  }

  async lpush(key: string, value: any): Promise<number> {
    try {
      const serialized = JSON.stringify(value);
      return await this.redis.lpush(key, serialized);
    } catch (error) {
      logger.error('Cache lpush error:', error);
      throw error;
    }
  }

  async rpop(key: string): Promise<any> {
    try {
      const value = await this.redis.rpop(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache rpop error:', error);
      return null;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<any[]> {
    try {
      const values = await this.redis.lrange(key, start, stop);
      return values.map(value => JSON.parse(value));
    } catch (error) {
      logger.error('Cache lrange error:', error);
      return [];
    }
  }

  async llen(key: string): Promise<number> {
    try {
      return await this.redis.llen(key);
    } catch (error) {
      logger.error('Cache llen error:', error);
      return 0;
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.redis.expire(key, seconds);
    } catch (error) {
      logger.error('Cache expire error:', error);
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      logger.error('Cache keys error:', error);
      return [];
    }
  }

  async flushdb(): Promise<void> {
    try {
      await this.redis.flushdb();
      logger.info('Cache flushed');
    } catch (error) {
      logger.error('Cache flush error:', error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.redis.quit();
      logger.info('Redis disconnected');
    } catch (error) {
      logger.error('Redis disconnect error:', error);
    }
  }
}

export const cacheService = new CacheService();