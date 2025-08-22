import { DatabaseService } from './database';
import { CacheService } from './cache';
import { logger } from '@/utils/logger';
import { config } from '@/config';
import { v4 as uuidv4 } from 'uuid';

export class CouponPoolService {
  private database: DatabaseService;
  private cache: CacheService;

  constructor(database: DatabaseService, cache: CacheService) {
    this.database = database;
    this.cache = cache;
  }

  /**
   * Generate coupon pool for campaign
   */
  async generateCouponPool(campaignId: string, poolSize: number, template: {
    discountType: 'percentage' | 'flat_amount' | 'free_delivery';
    discountValue: number;
    validDays: number;
    prefix?: string;
  }): Promise<string[]> {
    const startTime = Date.now();
    
    try {
      logger.info('Generating coupon pool', {
        campaignId,
        poolSize,
        discountType: template.discountType,
        discountValue: template.discountValue,
      });

      const coupons: string[] = [];
      const batchSize = 100;
      
      for (let i = 0; i < poolSize; i += batchSize) {
        const batch = Math.min(batchSize, poolSize - i);
        const batchCoupons = await this.generateCouponBatch(campaignId, batch, template);
        coupons.push(...batchCoupons);
      }

      // Cache the pool for quick access
      await this.cache.setEx(
        `coupon_pool:${campaignId}`,
        3600, // 1 hour
        JSON.stringify(coupons)
      );

      logger.info('Coupon pool generated successfully', {
        campaignId,
        generatedCount: coupons.length,
        processingTime: Date.now() - startTime,
      });

      return coupons;
    } catch (error) {
      logger.error('Failed to generate coupon pool:', error);
      throw error;
    }
  }

  /**
   * Generate batch of coupons
   */
  private async generateCouponBatch(campaignId: string, count: number, template: any): Promise<string[]> {
    const coupons: any[] = [];
    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + template.validDays);

    for (let i = 0; i < count; i++) {
      const code = this.generateCouponCode(template.prefix);
      
      coupons.push({
        id: uuidv4(),
        code,
        campaignId,
        discountType: template.discountType,
        discountValue: template.discountValue,
        usageLimit: 1,
        usageCount: 0,
        validFrom,
        validUntil,
        isActive: true,
      });
    }

    // Bulk insert coupons
    await this.bulkInsertCoupons(coupons);
    
    return coupons.map(c => c.code);
  }

  /**
   * Bulk insert coupons to database
   */
  private async bulkInsertCoupons(coupons: any[]): Promise<void> {
    if (coupons.length === 0) return;

    const values = coupons.map((coupon, index) => {
      const baseIndex = index * 10;
      return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9}, $${baseIndex + 10})`;
    }).join(', ');

    const query = `
      INSERT INTO coupons (id, code, campaign_id, discount_type, discount_value, usage_limit, usage_count, valid_from, valid_until, is_active)
      VALUES ${values}`;

    const params = coupons.flatMap(coupon => [
      coupon.id,
      coupon.code,
      coupon.campaignId,
      coupon.discountType,
      coupon.discountValue,
      coupon.usageLimit,
      coupon.usageCount,
      coupon.validFrom,
      coupon.validUntil,
      coupon.isActive,
    ]);

    try {
      await this.database.pool.query(query, params);
    } catch (error) {
      logger.error('Failed to bulk insert coupons:', error);
      throw error;
    }
  }

  /**
   * Get available coupon from pool
   */
  async getAvailableCoupon(campaignId: string, customerId: string): Promise<string | null> {
    try {
      // Check cache first
      const poolKey = `coupon_pool:${campaignId}`;
      const usedKey = `used_coupons:${customerId}:${campaignId}`;
      
      const [poolData, usedCoupons] = await Promise.all([
        this.cache.get(poolKey),
        this.cache.get(usedKey),
      ]);

      if (!poolData) {
        // Regenerate pool from database
        const coupons = await this.getCouponsFromDatabase(campaignId);
        await this.cache.setEx(poolKey, 3600, JSON.stringify(coupons));
        return coupons[0] || null;
      }

      const pool: string[] = JSON.parse(poolData);
      const used: string[] = usedCoupons ? JSON.parse(usedCoupons) : [];
      
      // Find first unused coupon
      const availableCoupon = pool.find(code => !used.includes(code));
      
      if (availableCoupon) {
        // Mark as used
        used.push(availableCoupon);
        await this.cache.setEx(usedKey, 86400, JSON.stringify(used)); // 24 hours
      }

      return availableCoupon || null;
    } catch (error) {
      logger.error('Failed to get available coupon:', error);
      return null;
    }
  }

  /**
   * Get coupons from database
   */
  private async getCouponsFromDatabase(campaignId: string): Promise<string[]> {
    const query = `
      SELECT code 
      FROM coupons 
      WHERE campaign_id = $1 AND is_active = true AND usage_count < usage_limit
      ORDER BY created_at
      LIMIT 1000`;

    try {
      const result = await this.database.pool.query(query, [campaignId]);
      return result.rows.map(row => row.code);
    } catch (error) {
      logger.error('Failed to get coupons from database:', error);
      return [];
    }
  }

  /**
   * Generate unique coupon code
   */
  private generateCouponCode(prefix?: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = prefix || 'CB';
    
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
  }

  /**
   * Validate coupon pool integrity
   */
  async validatePoolIntegrity(campaignId: string): Promise<{
    totalCoupons: number;
    usedCoupons: number;
    availableCoupons: number;
    expiredCoupons: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_coupons,
        COUNT(CASE WHEN usage_count >= usage_limit THEN 1 END) as used_coupons,
        COUNT(CASE WHEN usage_count < usage_limit AND valid_until >= NOW() THEN 1 END) as available_coupons,
        COUNT(CASE WHEN valid_until < NOW() THEN 1 END) as expired_coupons
      FROM coupons 
      WHERE campaign_id = $1`;

    try {
      const result = await this.database.pool.query(query, [campaignId]);
      const stats = result.rows[0];
      
      return {
        totalCoupons: parseInt(stats.total_coupons),
        usedCoupons: parseInt(stats.used_coupons),
        availableCoupons: parseInt(stats.available_coupons),
        expiredCoupons: parseInt(stats.expired_coupons),
      };
    } catch (error) {
      logger.error('Failed to validate pool integrity:', error);
      throw error;
    }
  }

  /**
   * Cleanup expired coupons
   */
  async cleanupExpiredCoupons(): Promise<number> {
    const query = `
      UPDATE coupons 
      SET is_active = false 
      WHERE valid_until < NOW() AND is_active = true`;

    try {
      const result = await this.database.pool.query(query);
      const cleanedCount = result.rowCount || 0;
      
      if (cleanedCount > 0) {
        logger.info(`Cleaned up ${cleanedCount} expired coupons`);
      }
      
      return cleanedCount;
    } catch (error) {
      logger.error('Failed to cleanup expired coupons:', error);
      return 0;
    }
  }
}