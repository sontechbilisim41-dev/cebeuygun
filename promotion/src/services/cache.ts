import { createClient, RedisClientType } from 'redis';
import { config } from '@/config';
import { logger } from '@/utils/logger';

export class CacheService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({ url: config.redis.url });
    this.client.on('error', (err) => logger.error('Redis Client Error', err));
  }

  async initialize(): Promise<void> {
    try {
      await this.client.connect();
      logger.info('Redis cache connection established');
    } catch (error) {
      logger.error('Failed to connect to Redis cache:', error);
      throw error;
    }
  }

  /**
   * Get value from cache
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(`${config.redis.keyPrefix}${key}`);
    } catch (error) {
      logger.warn('Cache get failed:', error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async setEx(key: string, ttl: number, value: string): Promise<void> {
    try {
      await this.client.setEx(`${config.redis.keyPrefix}${key}`, ttl, value);
    } catch (error) {
      logger.warn('Cache set failed:', error);
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: string): Promise<void> {
    try {
      await this.client.set(`${config.redis.keyPrefix}${key}`, value);
    } catch (error) {
      logger.warn('Cache set failed:', error);
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.client.del(`${config.redis.keyPrefix}${key}`);
    } catch (error) {
      logger.warn('Cache delete failed:', error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(`${config.redis.keyPrefix}${key}`);
      return result === 1;
    } catch (error) {
      logger.warn('Cache exists check failed:', error);
      return false;
    }
  }

  /**
   * Increment counter
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(`${config.redis.keyPrefix}${key}`);
    } catch (error) {
      logger.warn('Cache increment failed:', error);
      return 0;
    }
  }

  /**
   * Set expiry for key
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(`${config.redis.keyPrefix}${key}`, seconds);
    } catch (error) {
      logger.warn('Cache expire failed:', error);
    }
  }

  /**
   * Get multiple keys
   */
  async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      const prefixedKeys = keys.map(key => `${config.redis.keyPrefix}${key}`);
      return await this.client.mGet(prefixedKeys);
    } catch (error) {
      logger.warn('Cache mget failed:', error);
      return new Array(keys.length).fill(null);
    }
  }

  /**
   * Cache campaign eligibility result
   */
  async cacheCampaignEligibility(customerId: string, cartHash: string, result: any): Promise<void> {
    const key = `eligibility:${customerId}:${cartHash}`;
    await this.setEx(key, 60, JSON.stringify(result)); // Cache for 1 minute
  }

  /**
   * Get cached campaign eligibility
   */
  async getCachedCampaignEligibility(customerId: string, cartHash: string): Promise<any | null> {
    const key = `eligibility:${customerId}:${cartHash}`;
    const cached = await this.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Cache coupon validation result
   */
  async cacheCouponValidation(code: string, customerId: string, result: boolean): Promise<void> {
    const key = `coupon_valid:${code}:${customerId}`;
    await this.setEx(key, 300, JSON.stringify(result)); // Cache for 5 minutes
  }

  /**
   * Get cached coupon validation
   */
  async getCachedCouponValidation(code: string, customerId: string): Promise<boolean | null> {
    const key = `coupon_valid:${code}:${customerId}`;
    const cached = await this.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}