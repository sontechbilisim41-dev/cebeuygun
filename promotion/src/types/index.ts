import { z } from 'zod';

// Campaign types
export type CampaignType = 'percentage_discount' | 'flat_discount' | 'free_delivery' | 'loyalty_reward' | 'flash_sale' | 'first_order';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'expired' | 'completed';
export type DiscountType = 'percentage' | 'flat_amount' | 'free_delivery';
export type UserRole = 'customer' | 'seller' | 'courier' | 'admin';

// DSL Condition types
export interface RuleCondition {
  type: 'user_role' | 'location' | 'time' | 'cart_total' | 'product_tags' | 'product_categories' | 'order_count' | 'customer_segment';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'in' | 'not_in' | 'contains' | 'between';
  value: any;
  field?: string;
}

// DSL Effect types
export interface RuleEffect {
  type: 'percentage_discount' | 'flat_discount' | 'free_delivery' | 'generate_coupon' | 'loyalty_points';
  value: number;
  target?: 'cart_total' | 'delivery_fee' | 'specific_products' | 'category';
  metadata?: Record<string, any>;
}

// Campaign rule DSL
export interface CampaignRule {
  id: string;
  name: string;
  description: string;
  conditions: RuleCondition[];
  effects: RuleEffect[];
  priority: number;
  isExclusive: boolean;
  maxApplications?: number;
  validFrom: Date;
  validUntil: Date;
}

// Base schemas
export const MoneySchema = z.object({
  amount: z.number().int().min(0),
  currency: z.string().length(3).default('TRY'),
});

export const LocationSchema = z.object({
  city: z.string().min(1),
  district: z.string().optional(),
  country: z.string().length(2).default('TR'),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['customer', 'seller', 'courier', 'admin']),
  email: z.string().email(),
  phone: z.string().min(10),
  location: LocationSchema.optional(),
  registrationDate: z.string().datetime(),
  totalOrders: z.number().int().min(0).default(0),
  totalSpent: MoneySchema.default({ amount: 0, currency: 'TRY' }),
  segment: z.enum(['new', 'regular', 'vip', 'premium']).default('new'),
});

export const CartItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().min(1),
  unitPrice: MoneySchema,
  totalPrice: MoneySchema,
  tags: z.array(z.string()).default([]),
  categoryId: z.string().uuid(),
  categoryName: z.string(),
});

export const CartSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  items: z.array(CartItemSchema),
  subtotal: MoneySchema,
  deliveryFee: MoneySchema,
  totalAmount: MoneySchema,
  location: LocationSchema.optional(),
});

// Campaign schemas
export const CampaignConditionSchema = z.object({
  type: z.enum(['user_role', 'location', 'time', 'cart_total', 'product_tags', 'product_categories', 'order_count', 'customer_segment']),
  operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'in', 'not_in', 'contains', 'between']),
  value: z.any(),
  field: z.string().optional(),
});

export const CampaignEffectSchema = z.object({
  type: z.enum(['percentage_discount', 'flat_discount', 'free_delivery', 'generate_coupon', 'loyalty_points']),
  value: z.number(),
  target: z.enum(['cart_total', 'delivery_fee', 'specific_products', 'category']).optional(),
  metadata: z.record(z.any()).optional(),
});

export const CampaignRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000),
  conditions: z.array(CampaignConditionSchema),
  effects: z.array(CampaignEffectSchema),
  priority: z.number().int().min(1).max(1000).default(100),
  isExclusive: z.boolean().default(false),
  maxApplications: z.number().int().min(1).optional(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
});

export const CreateCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000),
  type: z.enum(['percentage_discount', 'flat_discount', 'free_delivery', 'loyalty_reward', 'flash_sale', 'first_order']),
  rules: z.array(CampaignRuleSchema),
  isActive: z.boolean().default(false),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  budget: MoneySchema.optional(),
  maxUsage: z.number().int().min(1).optional(),
  maxUsagePerUser: z.number().int().min(1).optional(),
});

// Coupon schemas
export const CouponSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(3).max(50),
  campaignId: z.string().uuid().optional(),
  discountType: z.enum(['percentage', 'flat_amount', 'free_delivery']),
  discountValue: z.number().min(0),
  minOrderAmount: MoneySchema.optional(),
  maxDiscountAmount: MoneySchema.optional(),
  usageLimit: z.number().int().min(1).default(1),
  usageCount: z.number().int().min(0).default(0),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  isActive: z.boolean().default(true),
  applicableProducts: z.array(z.string().uuid()).optional(),
  applicableCategories: z.array(z.string().uuid()).optional(),
  excludedProducts: z.array(z.string().uuid()).optional(),
  userRestrictions: z.object({
    roles: z.array(z.enum(['customer', 'seller', 'courier', 'admin'])).optional(),
    segments: z.array(z.enum(['new', 'regular', 'vip', 'premium'])).optional(),
    cities: z.array(z.string()).optional(),
    maxUsagePerUser: z.number().int().min(1).optional(),
  }).optional(),
});

// Application request schemas
export const ApplyCampaignsRequestSchema = z.object({
  customer: CustomerSchema,
  cart: CartSchema,
  couponCodes: z.array(z.string()).optional(),
  context: z.object({
    timestamp: z.string().datetime().default(() => new Date().toISOString()),
    sessionId: z.string().uuid().optional(),
    deviceType: z.enum(['web', 'mobile', 'api']).optional(),
  }).optional(),
});

export const CampaignApplicationResultSchema = z.object({
  campaignId: z.string().uuid(),
  campaignName: z.string(),
  ruleId: z.string().uuid(),
  discountType: z.enum(['percentage', 'flat_amount', 'free_delivery']),
  discountValue: z.number(),
  appliedAmount: MoneySchema,
  priority: z.number(),
  metadata: z.record(z.any()).optional(),
});

export const ApplyCampaignsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    originalTotal: MoneySchema,
    discountedTotal: MoneySchema,
    totalDiscount: MoneySchema,
    deliveryFee: MoneySchema,
    appliedCampaigns: z.array(CampaignApplicationResultSchema),
    generatedCoupons: z.array(z.object({
      code: z.string(),
      discountType: z.string(),
      discountValue: z.number(),
      validUntil: z.string().datetime(),
    })).optional(),
    conflictResolution: z.object({
      excludedCampaigns: z.array(z.object({
        campaignId: z.string().uuid(),
        reason: z.string(),
      })),
      priorityAdjustments: z.array(z.object({
        campaignId: z.string().uuid(),
        originalPriority: z.number(),
        adjustedPriority: z.number(),
      })),
    }).optional(),
  }),
  message: z.string(),
});

// Internal types
export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  rules: CampaignRule[];
  isActive: boolean;
  validFrom: Date;
  validUntil: Date;
  budget?: Money;
  spentBudget: Money;
  maxUsage?: number;
  currentUsage: number;
  maxUsagePerUser?: number;
  priority: number;
  isExclusive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Coupon {
  id: string;
  code: string;
  campaignId?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: Money;
  maxDiscountAmount?: Money;
  usageLimit: number;
  usageCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
  excludedProducts?: string[];
  userRestrictions?: {
    roles?: UserRole[];
    segments?: string[];
    cities?: string[];
    maxUsagePerUser?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignUsage {
  id: string;
  campaignId: string;
  customerId: string;
  orderId?: string;
  discountAmount: Money;
  appliedAt: Date;
  metadata?: Record<string, any>;
}

export interface CampaignAudit {
  id: string;
  campaignId: string;
  customerId?: string;
  action: 'applied' | 'excluded' | 'conflict_resolved' | 'budget_exceeded' | 'usage_limit_reached';
  details: Record<string, any>;
  timestamp: Date;
}

// Type exports
export type Money = z.infer<typeof MoneySchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type Cart = z.infer<typeof CartSchema>;
export type CreateCampaign = z.infer<typeof CreateCampaignSchema>;
export type ApplyCampaignsRequest = z.infer<typeof ApplyCampaignsRequestSchema>;
export type ApplyCampaignsResponse = z.infer<typeof ApplyCampaignsResponseSchema>;
export type CampaignApplicationResult = z.infer<typeof CampaignApplicationResultSchema>;