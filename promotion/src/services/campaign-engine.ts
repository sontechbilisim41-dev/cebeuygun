import { Campaign, CampaignRule, Customer, Cart, CampaignApplicationResult, Money } from '@/types';
import { RuleEngine } from './rule-engine';
import { logger, auditLogger } from '@/utils/logger';
import { DatabaseService } from './database';
import { CacheService } from './cache';

export class CampaignEngine {
  private ruleEngine: RuleEngine;
  private database: DatabaseService;
  private cache: CacheService;

  constructor(database: DatabaseService, cache: CacheService) {
    this.ruleEngine = new RuleEngine();
    this.database = database;
    this.cache = cache;
  }

  /**
   * Apply all eligible campaigns to a cart
   */
  async applyCampaigns(customer: Customer, cart: Cart, couponCodes?: string[]): Promise<{
    appliedCampaigns: CampaignApplicationResult[];
    totalDiscount: Money;
    deliveryDiscount: Money;
    generatedCoupons: any[];
    conflictResolution: any;
  }> {
    const startTime = Date.now();
    
    try {
      logger.info('Applying campaigns', {
        customerId: customer.id,
        cartTotal: cart.totalAmount.amount,
        couponCodes: couponCodes?.length || 0,
      });

      // Get active campaigns
      const campaigns = await this.getActiveCampaigns();
      
      // Apply coupons first
      const couponResults = await this.applyCoupons(couponCodes || [], customer, cart);
      
      // Evaluate campaign eligibility
      const eligibleCampaigns = await this.evaluateCampaignEligibility(campaigns, customer, cart);
      
      // Resolve conflicts and apply priority
      const { finalCampaigns, conflictResolution } = this.resolveConflicts(eligibleCampaigns);
      
      // Apply campaigns and calculate discounts
      const applicationResults = await this.applyCampaignRules(finalCampaigns, customer, cart);
      
      // Combine results
      const allResults = [...couponResults, ...applicationResults];
      
      // Calculate totals
      const totalDiscount = this.calculateTotalDiscount(allResults);
      const deliveryDiscount = this.calculateDeliveryDiscount(allResults);
      const generatedCoupons = this.extractGeneratedCoupons(allResults);
      
      // Log audit trail
      await this.logCampaignApplications(customer.id, allResults, conflictResolution);
      
      logger.info('Campaigns applied successfully', {
        customerId: customer.id,
        appliedCampaigns: allResults.length,
        totalDiscount: totalDiscount.amount,
        processingTime: Date.now() - startTime,
      });

      return {
        appliedCampaigns: allResults,
        totalDiscount,
        deliveryDiscount,
        generatedCoupons,
        conflictResolution,
      };
    } catch (error) {
      logger.error('Failed to apply campaigns:', error);
      throw error;
    }
  }

  /**
   * Get active campaigns with caching
   */
  private async getActiveCampaigns(): Promise<Campaign[]> {
    const cacheKey = 'active_campaigns';
    
    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Fetch from database
    const campaigns = await this.database.getActiveCampaigns();
    
    // Cache for 5 minutes
    await this.cache.setEx(cacheKey, 300, JSON.stringify(campaigns));
    
    return campaigns;
  }

  /**
   * Evaluate which campaigns are eligible
   */
  private async evaluateCampaignEligibility(
    campaigns: Campaign[], 
    customer: Customer, 
    cart: Cart
  ): Promise<{ campaign: Campaign; eligibleRules: CampaignRule[] }[]> {
    const eligible: { campaign: Campaign; eligibleRules: CampaignRule[] }[] = [];

    for (const campaign of campaigns) {
      // Check campaign validity
      if (!this.isCampaignValid(campaign)) {
        continue;
      }

      // Check usage limits
      if (!(await this.checkUsageLimits(campaign, customer))) {
        continue;
      }

      // Check budget
      if (!(await this.checkBudgetAvailability(campaign))) {
        continue;
      }

      // Evaluate rules
      const eligibleRules: CampaignRule[] = [];
      for (const rule of campaign.rules) {
        if (this.ruleEngine.evaluateConditions(rule.conditions, customer, cart)) {
          eligibleRules.push(rule);
        }
      }

      if (eligibleRules.length > 0) {
        eligible.push({ campaign, eligibleRules });
      }
    }

    return eligible;
  }

  /**
   * Resolve conflicts between campaigns
   */
  private resolveConflicts(eligibleCampaigns: { campaign: Campaign; eligibleRules: CampaignRule[] }[]): {
    finalCampaigns: { campaign: Campaign; eligibleRules: CampaignRule[] }[];
    conflictResolution: any;
  } {
    const excludedCampaigns: any[] = [];
    const priorityAdjustments: any[] = [];
    
    // Sort by priority (higher priority first)
    const sortedCampaigns = eligibleCampaigns.sort((a, b) => b.campaign.priority - a.campaign.priority);
    
    const finalCampaigns: { campaign: Campaign; eligibleRules: CampaignRule[] }[] = [];
    const exclusiveApplied = new Set<string>();

    for (const { campaign, eligibleRules } of sortedCampaigns) {
      // Check if an exclusive campaign has already been applied
      if (exclusiveApplied.size > 0 && campaign.isExclusive) {
        excludedCampaigns.push({
          campaignId: campaign.id,
          reason: 'Exclusive campaign already applied',
        });
        continue;
      }

      // Check if this campaign conflicts with already applied exclusive campaigns
      if (campaign.isExclusive && finalCampaigns.some(fc => fc.campaign.isExclusive)) {
        excludedCampaigns.push({
          campaignId: campaign.id,
          reason: 'Conflicts with higher priority exclusive campaign',
        });
        continue;
      }

      finalCampaigns.push({ campaign, eligibleRules });

      if (campaign.isExclusive) {
        exclusiveApplied.add(campaign.id);
      }
    }

    return {
      finalCampaigns,
      conflictResolution: {
        excludedCampaigns,
        priorityAdjustments,
      },
    };
  }

  /**
   * Apply campaign rules and calculate discounts
   */
  private async applyCampaignRules(
    campaigns: { campaign: Campaign; eligibleRules: CampaignRule[] }[],
    customer: Customer,
    cart: Cart
  ): Promise<CampaignApplicationResult[]> {
    const results: CampaignApplicationResult[] = [];

    for (const { campaign, eligibleRules } of campaigns) {
      for (const rule of eligibleRules) {
        const effectResults = this.ruleEngine.applyEffects(rule.effects, customer, cart);
        
        // Calculate applied discount amount
        const appliedAmount = {
          amount: effectResults.discountAmount.amount + effectResults.deliveryDiscount.amount,
          currency: cart.totalAmount.currency,
        };

        if (appliedAmount.amount > 0 || effectResults.generatedCoupons.length > 0) {
          results.push({
            campaignId: campaign.id,
            campaignName: campaign.name,
            ruleId: rule.id,
            discountType: this.getDiscountType(rule.effects),
            discountValue: this.getDiscountValue(rule.effects),
            appliedAmount,
            priority: campaign.priority,
            metadata: {
              generatedCoupons: effectResults.generatedCoupons,
              loyaltyPoints: effectResults.loyaltyPoints,
            },
          });

          // Record usage
          await this.recordCampaignUsage(campaign.id, customer.id, appliedAmount);
        }
      }
    }

    return results;
  }

  /**
   * Apply coupon codes
   */
  private async applyCoupons(
    couponCodes: string[], 
    customer: Customer, 
    cart: Cart
  ): Promise<CampaignApplicationResult[]> {
    const results: CampaignApplicationResult[] = [];

    for (const code of couponCodes) {
      try {
        const coupon = await this.database.getCouponByCode(code);
        
        if (!coupon || !this.isCouponValid(coupon, customer, cart)) {
          continue;
        }

        const discount = this.calculateCouponDiscount(coupon, cart);
        
        if (discount.amount > 0) {
          results.push({
            campaignId: coupon.campaignId || 'coupon',
            campaignName: `Coupon: ${code}`,
            ruleId: coupon.id,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            appliedAmount: discount,
            priority: 1000, // Coupons have high priority
          });

          // Record coupon usage
          await this.database.recordCouponUsage(coupon.id, customer.id);
        }
      } catch (error) {
        logger.warn(`Failed to apply coupon ${code}:`, error);
      }
    }

    return results;
  }

  /**
   * Check if campaign is currently valid
   */
  private isCampaignValid(campaign: Campaign): boolean {
    const now = new Date();
    return campaign.isActive && 
           campaign.status === 'active' &&
           now >= campaign.validFrom && 
           now <= campaign.validUntil;
  }

  /**
   * Check usage limits for campaign
   */
  private async checkUsageLimits(campaign: Campaign, customer: Customer): Promise<boolean> {
    // Check global usage limit
    if (campaign.maxUsage && campaign.currentUsage >= campaign.maxUsage) {
      return false;
    }

    // Check per-user usage limit
    if (campaign.maxUsagePerUser) {
      const userUsage = await this.database.getCampaignUsageByCustomer(campaign.id, customer.id);
      if (userUsage >= campaign.maxUsagePerUser) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check budget availability
   */
  private async checkBudgetAvailability(campaign: Campaign): Promise<boolean> {
    if (!campaign.budget) {
      return true;
    }

    return campaign.spentBudget.amount < campaign.budget.amount;
  }

  /**
   * Calculate total discount from all results
   */
  private calculateTotalDiscount(results: CampaignApplicationResult[]): Money {
    const total = results.reduce((sum, result) => {
      if (result.discountType !== 'free_delivery') {
        return sum + result.appliedAmount.amount;
      }
      return sum;
    }, 0);

    return { amount: total, currency: 'TRY' };
  }

  /**
   * Calculate delivery discount from all results
   */
  private calculateDeliveryDiscount(results: CampaignApplicationResult[]): Money {
    const total = results.reduce((sum, result) => {
      if (result.discountType === 'free_delivery') {
        return sum + result.appliedAmount.amount;
      }
      return sum;
    }, 0);

    return { amount: total, currency: 'TRY' };
  }

  /**
   * Extract generated coupons from results
   */
  private extractGeneratedCoupons(results: CampaignApplicationResult[]): any[] {
    return results.flatMap(result => result.metadata?.generatedCoupons || []);
  }

  /**
   * Get discount type from effects
   */
  private getDiscountType(effects: RuleEffect[]): 'percentage' | 'flat_amount' | 'free_delivery' {
    const effect = effects[0];
    if (effect.type === 'free_delivery') return 'free_delivery';
    if (effect.type === 'percentage_discount') return 'percentage';
    return 'flat_amount';
  }

  /**
   * Get discount value from effects
   */
  private getDiscountValue(effects: RuleEffect[]): number {
    return effects[0]?.value || 0;
  }

  /**
   * Record campaign usage for tracking
   */
  private async recordCampaignUsage(campaignId: string, customerId: string, discountAmount: Money): Promise<void> {
    try {
      await this.database.recordCampaignUsage({
        campaignId,
        customerId,
        discountAmount,
        appliedAt: new Date(),
      });
    } catch (error) {
      logger.error('Failed to record campaign usage:', error);
    }
  }

  /**
   * Log campaign applications for audit
   */
  private async logCampaignApplications(
    customerId: string, 
    results: CampaignApplicationResult[], 
    conflictResolution: any
  ): Promise<void> {
    auditLogger.info('Campaign applications', {
      customerId,
      appliedCampaigns: results.map(r => ({
        campaignId: r.campaignId,
        discountAmount: r.appliedAmount.amount,
        priority: r.priority,
      })),
      excludedCampaigns: conflictResolution.excludedCampaigns,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Validate coupon
   */
  private isCouponValid(coupon: any, customer: Customer, cart: Cart): boolean {
    const now = new Date();
    
    // Basic validity checks
    if (!coupon.isActive || now < coupon.validFrom || now > coupon.validUntil) {
      return false;
    }

    // Usage limit check
    if (coupon.usageCount >= coupon.usageLimit) {
      return false;
    }

    // Minimum order amount check
    if (coupon.minOrderAmount && cart.subtotal.amount < coupon.minOrderAmount.amount) {
      return false;
    }

    // User restrictions
    if (coupon.userRestrictions) {
      const restrictions = coupon.userRestrictions;
      
      if (restrictions.roles && !restrictions.roles.includes(customer.role)) {
        return false;
      }
      
      if (restrictions.segments && !restrictions.segments.includes(customer.segment)) {
        return false;
      }
      
      if (restrictions.cities && customer.location?.city && !restrictions.cities.includes(customer.location.city)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate coupon discount
   */
  private calculateCouponDiscount(coupon: any, cart: Cart): Money {
    let discountAmount = 0;

    switch (coupon.discountType) {
      case 'percentage':
        discountAmount = Math.round(cart.subtotal.amount * (coupon.discountValue / 100));
        break;
      case 'flat_amount':
        discountAmount = coupon.discountValue * 100; // Convert to cents
        break;
      case 'free_delivery':
        discountAmount = cart.deliveryFee.amount;
        break;
    }

    // Apply maximum discount limit
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount.amount) {
      discountAmount = coupon.maxDiscountAmount.amount;
    }

    return { amount: discountAmount, currency: cart.totalAmount.currency };
  }
}