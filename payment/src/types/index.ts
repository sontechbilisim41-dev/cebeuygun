import { z } from 'zod';

// Payment provider types
export type PaymentProvider = 'stripe' | 'iyzico';
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'requires_action';
export type RefundStatus = 'pending' | 'succeeded' | 'failed' | 'canceled';

// Base schemas
export const MoneySchema = z.object({
  amount: z.number().int().min(1),
  currency: z.string().length(3).default('TRY'),
});

export const AddressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().length(2).default('TR'),
});

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  phone: z.string().min(10),
  name: z.string().min(1),
  address: AddressSchema.optional(),
});

// Payment intent schemas
export const PaymentIntentRequestSchema = z.object({
  amount: z.number().int().min(100), // Minimum 1 TRY (100 kuruş)
  currency: z.string().length(3).default('TRY'),
  customer: CustomerSchema,
  order_id: z.string().uuid(),
  description: z.string().optional(),
  metadata: z.record(z.string()).optional(),
  provider: z.enum(['stripe', 'iyzico']).default('stripe'),
  capture_method: z.enum(['automatic', 'manual']).default('automatic'),
});

export const PaymentIntentResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    payment_intent_id: z.string(),
    client_secret: z.string().optional(),
    status: z.enum(['pending', 'processing', 'succeeded', 'failed', 'requires_action']),
    amount: z.number(),
    currency: z.string(),
    provider: z.enum(['stripe', 'iyzico']),
    created_at: z.string().datetime(),
  }).optional(),
  error: z.string().optional(),
  message: z.string(),
});

// Payment confirmation schemas
export const PaymentConfirmRequestSchema = z.object({
  payment_intent_id: z.string(),
  payment_method: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('card'),
      card: z.object({
        number: z.string().regex(/^\d{13,19}$/),
        exp_month: z.number().int().min(1).max(12),
        exp_year: z.number().int().min(new Date().getFullYear()),
        cvc: z.string().regex(/^\d{3,4}$/),
        holder_name: z.string().min(1),
      }),
    }),
    z.object({
      type: z.literal('token'),
      token: z.string(),
    }),
  ]),
  three_d_secure: z.boolean().default(false),
  return_url: z.string().url().optional(),
});

export const PaymentConfirmResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    payment_id: z.string(),
    status: z.enum(['succeeded', 'failed', 'requires_action']),
    amount: z.number(),
    currency: z.string(),
    provider: z.enum(['stripe', 'iyzico']),
    three_d_secure_url: z.string().url().optional(),
    token: z.string().optional(), // For future use
    last_four: z.string().optional(),
    brand: z.string().optional(),
    processed_at: z.string().datetime(),
  }).optional(),
  error: z.string().optional(),
  message: z.string(),
});

// Refund schemas
export const RefundRequestSchema = z.object({
  payment_id: z.string(),
  amount: z.number().int().min(1).optional(), // Partial refund if specified
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer', 'expired_uncaptured']).default('requested_by_customer'),
  metadata: z.record(z.string()).optional(),
});

export const RefundResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    refund_id: z.string(),
    payment_id: z.string(),
    amount: z.number(),
    currency: z.string(),
    status: z.enum(['pending', 'succeeded', 'failed', 'canceled']),
    reason: z.string(),
    processed_at: z.string().datetime(),
  }).optional(),
  error: z.string().optional(),
  message: z.string(),
});

// Webhook schemas
export const WebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.record(z.any()),
  created: z.number(),
  provider: z.enum(['stripe', 'iyzico']),
});

// Internal types
export interface PaymentIntent {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  clientSecret?: string;
  metadata?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  paymentIntentId: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerPaymentId: string;
  tokenId?: string;
  lastFour?: string;
  brand?: string;
  threeDSecureUrl?: string;
  failureReason?: string;
  metadata?: Record<string, string>;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: RefundStatus;
  reason: string;
  providerRefundId: string;
  metadata?: Record<string, string>;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CardToken {
  id: string;
  customerId: string;
  lastFour: string;
  brand: string;
  expMonth: number;
  expYear: number;
  provider: PaymentProvider;
  providerTokenId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FraudCheck {
  id: string;
  customerId: string;
  paymentIntentId: string;
  riskScore: number;
  riskFactors: string[];
  action: 'allow' | 'review' | 'block';
  reason?: string;
  createdAt: Date;
}

// Type exports
export type Money = z.infer<typeof MoneySchema>;
export type Address = z.infer<typeof AddressSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
export type PaymentIntentRequest = z.infer<typeof PaymentIntentRequestSchema>;
export type PaymentIntentResponse = z.infer<typeof PaymentIntentResponseSchema>;
export type PaymentConfirmRequest = z.infer<typeof PaymentConfirmRequestSchema>;
export type PaymentConfirmResponse = z.infer<typeof PaymentConfirmResponseSchema>;
export type RefundRequest = z.infer<typeof RefundRequestSchema>;
export type RefundResponse = z.infer<typeof RefundResponseSchema>;
export type WebhookEvent = z.infer<typeof WebhookEventSchema>;