import { CampaignEngine } from './campaign-engine';
import { CouponPoolService } from './coupon-pool';
import { DatabaseService } from './database';
import { CacheService } from './cache';
import { 
  ApplyCampaignsRequest, 
  ApplyCampaignsResponse, 
  CreateCampaign,
  Campaign,
  Coupon,
  Customer,
  Cart 
} from '@/types';
import { logger, auditLogger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export class PromotionService {
  private campaignEngine: CampaignEngine;
  private couponPool: CouponPoolService;
  private database: DatabaseService;
  private cache: CacheService;

  constructor() {
    this.database = new DatabaseService();
    this.cache = new CacheService();
    this.campaignEngine = new CampaignEngine(this.database, this.cache);
    this.couponPool = new CouponPoolService(this.database, this.cache);
  }

  async initialize(): Promise<void> {
    await this.database.initialize();
    await this.cache.initialize();
    logger.info('Promotion service initialized');
  }

  /**
   * Apply campaigns and coupons to cart
   */
  async applyCampaigns(request: ApplyCampaignsRequest): Promise<ApplyCampaignsResponse> {
    const startTime = Date.now();
    
    try {
      logger.info('Processing campaign application', {
        customerId: request.customer.id,
        cartTotal: request.cart.totalAmount.amount,
        itemCount: request.cart.items.length,
        couponCodes: request.couponCodes?.length || 0,
      });

      // Generate cart hash for caching
      const cartHash = this.generateCartHash(request.cart);
      
      // Check cache for recent calculation
      const cached = await this.cache.getCachedCampaignEligibility(request.customer.id, cartHash);
      if (cached) {
        logger.debug('Returning cached campaign result');
        return cached;
      }

      // Apply campaigns
      const result = await this.campaignEngine.applyCampaigns(
        request.customer,
        request.cart,
        request.couponCodes
      );

      // Calculate final totals
      const originalTotal = request.cart.totalAmount;
      const totalDiscountAmount = result.totalDiscount.amount + result.deliveryDiscount.amount;
      const discountedTotal = {
        amount: Math.max(0, originalTotal.amount - totalDiscountAmount),
        currency: originalTotal.currency,
      };

      const response: ApplyCampaignsResponse = {
        success: true,
        message: 'Campaigns applied successfully',
        data: {
          originalTotal,
          discountedTotal,
          totalDiscount: { amount: totalDiscountAmount, currency: originalTotal.currency },
          deliveryFee: {
            amount: Math.max(0, request.cart.deliveryFee.amount - result.deliveryDiscount.amount),
            currency: request.cart.deliveryFee.currency,
          },
          appliedCampaigns: result.appliedCampaigns,
          generatedCoupons: result.generatedCoupons,
          conflictResolution: result.conflictResolution,
        },
      };

      // Cache result for 1 minute
      await this.cache.cacheCampaignEligibility(request.customer.id, cartHash, response);

      logger.info('Campaigns applied successfully', {
        customerId: request.customer.id,
        appliedCampaigns: result.appliedCampaigns.length,
        totalDiscount: totalDiscountAmount,
        processingTime: Date.now() - startTime,
      });

      return response;
    } catch (error) {
      logger.error('Failed to apply campaigns:', error);
      throw error;
    }
  }

  /**
   * Create new campaign
   */
  async createCampaign(campaignData: CreateCampaign): Promise<Campaign> {
    try {
      logger.info('Creating new campaign', {
        name: campaignData.name,
        type: campaignData.type,
        rulesCount: campaignData.rules.length,
      });

      const campaign: Partial<Campaign> = {
        id: uuidv4(),
        name: campaignData.name,
        description: campaignData.description,
        type: campaignData.type,
        status: campaignData.isActive ? 'active' : 'draft',
        rules: campaignData.rules,
        isActive: campaignData.isActive,
        validFrom: new Date(campaignData.validFrom),
        validUntil: new Date(campaignData.validUntil),
        budget: campaignData.budget,
        spentBudget: { amount: 0, currency: 'TRY' },
        maxUsage: campaignData.maxUsage,
        currentUsage: 0,
        maxUsagePerUser: campaignData.maxUsagePerUser,
        priority: campaignData.rules[0]?.priority || 100,
        isExclusive: campaignData.rules.some(rule => rule.isExclusive),
      };

      const createdCampaign = await this.database.createCampaign(campaign);

      // Generate coupon pool if needed
      if (campaignData.type === 'loyalty_reward' || 
          campaignData.rules.some(rule => rule.effects.some(effect => effect.type === 'generate_coupon'))) {
        await this.couponPool.generateCouponPool(createdCampaign.id, config.coupons.poolSize, {
          discountType: 'percentage',
          discountValue: 10,
          validDays: config.coupons.defaultExpiryDays,
          prefix: 'CB',
        });
      }

      // Clear cache
      await this.cache.del('active_campaigns');

      auditLogger.info('Campaign created', {
        campaignId: createdCampaign.id,
        name: campaignData.name,
        type: campaignData.type,
        createdBy: 'system', // Would come from auth context
        timestamp: new Date().toISOString(),
      });

      return createdCampaign;
    } catch (error) {
      logger.error('Failed to create campaign:', error);
      throw error;
    }
  }

  /**
   * Validate coupon code
   */
  async validateCoupon(code: string, customer: Customer, cart: Cart): Promise<{
    isValid: boolean;
    coupon?: Coupon;
    reason?: string;
  }> {
    try {
      // Check cache first
      const cached = await this.cache.getCachedCouponValidation(code, customer.id);
      if (cached !== null) {
        return { isValid: cached };
      }

      const coupon = await this.database.getCouponByCode(code);
      
      if (!coupon) {
        return { isValid: false, reason: 'Coupon not found' };
      }

      // Validate coupon
      const validation = this.validateCouponRules(coupon, customer, cart);
      
      // Cache result
      await this.cache.cacheCouponValidation(code, customer.id, validation.isValid);

      return validation;
    } catch (error) {
      logger.error('Failed to validate coupon:', error);
      return { isValid: false, reason: 'Validation error' };
    }
  }

  /**
   * Validate coupon rules
   */
  private validateCouponRules(coupon: Coupon, customer: Customer, cart: Cart): {
    isValid: boolean;
    coupon?: Coupon;
    reason?: string;
  } {
    const now = new Date();

    // Basic validity
    if (!coupon.isActive) {
      return { isValid: false, reason: 'Coupon is inactive' };
    }

    if (now < coupon.validFrom || now > coupon.validUntil) {
      return { isValid: false, reason: 'Coupon has expired' };
    }

    // Usage limit
    if (coupon.usageCount >= coupon.usageLimit) {
      return { isValid: false, reason: 'Coupon usage limit exceeded' };
    }

    // Minimum order amount
    if (coupon.minOrderAmount && cart.subtotal.amount < coupon.minOrderAmount.amount) {
      return { 
        isValid: false, 
        reason: `Minimum order amount is ${coupon.minOrderAmount.amount / 100} ${coupon.minOrderAmount.currency}` 
      };
    }

    // User restrictions
    if (coupon.userRestrictions) {
      const restrictions = coupon.userRestrictions;
      
      if (restrictions.roles && !restrictions.roles.includes(customer.role)) {
        return { isValid: false, reason: 'Coupon not valid for your user role' };
      }
      
      if (restrictions.segments && !restrictions.segments.includes(customer.segment)) {
        return { isValid: false, reason: 'Coupon not valid for your customer segment' };
      }
      
      if (restrictions.cities && customer.location?.city && !restrictions.cities.includes(customer.location.city)) {
        return { isValid: false, reason: 'Coupon not valid in your city' };
      }
    }

    // Product restrictions
    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      const hasApplicableProduct = cart.items.some(item => 
        coupon.applicableProducts!.includes(item.productId)
      );
      if (!hasApplicableProduct) {
        return { isValid: false, reason: 'Coupon not applicable to cart items' };
      }
    }

    // Category restrictions
    if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      const hasApplicableCategory = cart.items.some(item => 
        coupon.applicableCategories!.includes(item.categoryId)
      );
      if (!hasApplicableCategory) {
        return { isValid: false, reason: 'Coupon not applicable to cart categories' };
      }
    }

    // Excluded products
    if (coupon.excludedProducts && coupon.excludedProducts.length > 0) {
      const hasExcludedProduct = cart.items.some(item => 
        coupon.excludedProducts!.includes(item.productId)
      );
      if (hasExcludedProduct) {
        return { isValid: false, reason: 'Cart contains excluded products' };
      }
    }

    return { isValid: true, coupon };
  }

  /**
   * Generate cart hash for caching
   */
  private generateCartHash(cart: Cart): string {
    const cartData = {
      items: cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice.amount,
      })),
      subtotal: cart.subtotal.amount,
      deliveryFee: cart.deliveryFee.amount,
    };
    
    return crypto.createHash('md5').update(JSON.stringify(cartData)).digest('hex');
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(campaignId: string): Promise<{
    totalUsage: number;
    totalDiscount: number;
    uniqueCustomers: number;
    conversionRate: number;
    averageDiscount: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_usage,
        SUM((discount_amount->>'amount')::int) as total_discount,
        COUNT(DISTINCT customer_id) as unique_customers,
        AVG((discount_amount->>'amount')::int) as average_discount
      FROM campaign_usage 
      WHERE campaign_id = $1`;

    try {
      const result = await this.database.pool.query(query, [campaignId]);
      const stats = result.rows[0];
      
      return {
        totalUsage: parseInt(stats.total_usage || '0'),
        totalDiscount: parseInt(stats.total_discount || '0'),
        uniqueCustomers: parseInt(stats.unique_customers || '0'),
        conversionRate: 0, // Would need additional data to calculate
        averageDiscount: parseFloat(stats.average_discount || '0'),
      };
    } catch (error) {
      logger.error('Failed to get campaign stats:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.database.disconnect();
    await this.cache.disconnect();
  }
}