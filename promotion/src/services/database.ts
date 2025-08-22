import { Pool, PoolClient } from 'pg';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { Campaign, Coupon, CampaignUsage, CampaignAudit } from '@/types';

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.username,
      password: config.database.password,
      ssl: config.database.ssl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async initialize(): Promise<void> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      logger.info('Database connection established');
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  /**
   * Get all active campaigns
   */
  async getActiveCampaigns(): Promise<Campaign[]> {
    const query = `
      SELECT id, name, description, type, status, rules, is_active, valid_from, valid_until,
             budget, spent_budget, max_usage, current_usage, max_usage_per_user, priority, is_exclusive,
             created_at, updated_at
      FROM campaigns 
      WHERE is_active = true 
        AND status = 'active' 
        AND valid_from <= NOW() 
        AND valid_until >= NOW()
      ORDER BY priority DESC, created_at ASC`;

    try {
      const result = await this.pool.query(query);
      return result.rows.map(row => this.mapCampaignRow(row));
    } catch (error) {
      logger.error('Failed to get active campaigns:', error);
      throw error;
    }
  }

  /**
   * Get campaign by ID
   */
  async getCampaignById(id: string): Promise<Campaign | null> {
    const query = `
      SELECT id, name, description, type, status, rules, is_active, valid_from, valid_until,
             budget, spent_budget, max_usage, current_usage, max_usage_per_user, priority, is_exclusive,
             created_at, updated_at
      FROM campaigns 
      WHERE id = $1`;

    try {
      const result = await this.pool.query(query, [id]);
      return result.rows.length > 0 ? this.mapCampaignRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Failed to get campaign by ID:', error);
      throw error;
    }
  }

  /**
   * Create new campaign
   */
  async createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
    const query = `
      INSERT INTO campaigns (id, name, description, type, status, rules, is_active, valid_from, valid_until,
                            budget, spent_budget, max_usage, current_usage, max_usage_per_user, priority, is_exclusive)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id, created_at, updated_at`;

    try {
      const result = await this.pool.query(query, [
        campaign.id,
        campaign.name,
        campaign.description,
        campaign.type,
        campaign.status || 'draft',
        JSON.stringify(campaign.rules),
        campaign.isActive || false,
        campaign.validFrom,
        campaign.validUntil,
        campaign.budget ? JSON.stringify(campaign.budget) : null,
        JSON.stringify({ amount: 0, currency: 'TRY' }),
        campaign.maxUsage,
        0,
        campaign.maxUsagePerUser,
        campaign.priority || 100,
        campaign.isExclusive || false,
      ]);

      return { ...campaign, ...result.rows[0] } as Campaign;
    } catch (error) {
      logger.error('Failed to create campaign:', error);
      throw error;
    }
  }

  /**
   * Get coupon by code
   */
  async getCouponByCode(code: string): Promise<Coupon | null> {
    const query = `
      SELECT id, code, campaign_id, discount_type, discount_value, min_order_amount, max_discount_amount,
             usage_limit, usage_count, valid_from, valid_until, is_active, applicable_products,
             applicable_categories, excluded_products, user_restrictions, created_at, updated_at
      FROM coupons 
      WHERE code = $1 AND is_active = true`;

    try {
      const result = await this.pool.query(query, [code]);
      return result.rows.length > 0 ? this.mapCouponRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Failed to get coupon by code:', error);
      throw error;
    }
  }

  /**
   * Record campaign usage
   */
  async recordCampaignUsage(usage: Partial<CampaignUsage>): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert usage record
      await client.query(`
        INSERT INTO campaign_usage (id, campaign_id, customer_id, order_id, discount_amount, applied_at, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          usage.id || require('uuid').v4(),
          usage.campaignId,
          usage.customerId,
          usage.orderId,
          JSON.stringify(usage.discountAmount),
          usage.appliedAt,
          JSON.stringify(usage.metadata || {}),
        ]
      );
      
      // Update campaign usage count and spent budget
      await client.query(`
        UPDATE campaigns 
        SET current_usage = current_usage + 1,
            spent_budget = jsonb_set(spent_budget, '{amount}', 
              (COALESCE((spent_budget->>'amount')::int, 0) + $2)::text::jsonb)
        WHERE id = $1`,
        [usage.campaignId, usage.discountAmount?.amount || 0]
      );
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to record campaign usage:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Record coupon usage
   */
  async recordCouponUsage(couponId: string, customerId: string): Promise<void> {
    const query = `
      UPDATE coupons 
      SET usage_count = usage_count + 1,
          updated_at = NOW()
      WHERE id = $1`;

    try {
      await this.pool.query(query, [couponId]);
      
      // Log audit trail
      await this.logAudit({
        campaignId: couponId,
        customerId,
        action: 'applied',
        details: { type: 'coupon_usage' },
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Failed to record coupon usage:', error);
      throw error;
    }
  }

  /**
   * Get campaign usage count by customer
   */
  async getCampaignUsageByCustomer(campaignId: string, customerId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as usage_count
      FROM campaign_usage 
      WHERE campaign_id = $1 AND customer_id = $2`;

    try {
      const result = await this.pool.query(query, [campaignId, customerId]);
      return parseInt(result.rows[0].usage_count);
    } catch (error) {
      logger.error('Failed to get campaign usage by customer:', error);
      return 0;
    }
  }

  /**
   * Log audit trail
   */
  async logAudit(audit: Partial<CampaignAudit>): Promise<void> {
    const query = `
      INSERT INTO campaign_audit (id, campaign_id, customer_id, action, details, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6)`;

    try {
      await this.pool.query(query, [
        audit.id || require('uuid').v4(),
        audit.campaignId,
        audit.customerId,
        audit.action,
        JSON.stringify(audit.details),
        audit.timestamp,
      ]);
    } catch (error) {
      logger.error('Failed to log audit:', error);
    }
  }

  /**
   * Map database row to Campaign object
   */
  private mapCampaignRow(row: any): Campaign {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      status: row.status,
      rules: JSON.parse(row.rules || '[]'),
      isActive: row.is_active,
      validFrom: row.valid_from,
      validUntil: row.valid_until,
      budget: row.budget ? JSON.parse(row.budget) : undefined,
      spentBudget: JSON.parse(row.spent_budget || '{"amount": 0, "currency": "TRY"}'),
      maxUsage: row.max_usage,
      currentUsage: row.current_usage,
      maxUsagePerUser: row.max_usage_per_user,
      priority: row.priority,
      isExclusive: row.is_exclusive,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Map database row to Coupon object
   */
  private mapCouponRow(row: any): Coupon {
    return {
      id: row.id,
      code: row.code,
      campaignId: row.campaign_id,
      discountType: row.discount_type,
      discountValue: row.discount_value,
      minOrderAmount: row.min_order_amount ? JSON.parse(row.min_order_amount) : undefined,
      maxDiscountAmount: row.max_discount_amount ? JSON.parse(row.max_discount_amount) : undefined,
      usageLimit: row.usage_limit,
      usageCount: row.usage_count,
      validFrom: row.valid_from,
      validUntil: row.valid_until,
      isActive: row.is_active,
      applicableProducts: row.applicable_products,
      applicableCategories: row.applicable_categories,
      excludedProducts: row.excluded_products,
      userRestrictions: row.user_restrictions ? JSON.parse(row.user_restrictions) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }
}