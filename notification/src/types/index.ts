import { z } from 'zod';

// Notification channel types
export type NotificationChannel = 'push' | 'sms' | 'email';
export type NotificationStatus = 'pending' | 'queued' | 'sent' | 'delivered' | 'failed' | 'skipped';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

// Base schemas
export const ContactInfoSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  pushTokens: z.array(z.string()).optional(),
  language: z.enum(['tr', 'en']).default('tr'),
  timezone: z.string().default('Europe/Istanbul'),
});

export const NotificationTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  eventType: z.string().min(1),
  channel: z.enum(['push', 'sms', 'email']),
  language: z.enum(['tr', 'en']).default('tr'),
  subject: z.string().optional(), // For email
  title: z.string().optional(), // For push
  body: z.string().min(1),
  variables: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

// Notification request schemas
export const SendNotificationSchema = z.object({
  userId: z.string().uuid(),
  eventType: z.string().min(1),
  channels: z.array(z.enum(['push', 'sms', 'email'])).min(1),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  data: z.record(z.any()).default({}),
  metadata: z.object({
    orderId: z.string().uuid().optional(),
    campaignId: z.string().uuid().optional(),
    source: z.string().optional(),
  }).optional(),
  scheduleAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const BulkNotificationSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(1000),
  eventType: z.string().min(1),
  channels: z.array(z.enum(['push', 'sms', 'email'])).min(1),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  data: z.record(z.any()).default({}),
  metadata: z.object({
    campaignId: z.string().uuid().optional(),
    source: z.string().optional(),
  }).optional(),
});

// Event schemas for Kafka
export const OrderEventSchema = z.object({
  order_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  seller_id: z.string().uuid().optional(),
  courier_id: z.string().uuid().optional(),
  status: z.string(),
  total_amount: z.number().optional(),
  currency: z.string().optional(),
  estimated_delivery_time: z.string().datetime().optional(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
});

export const CourierEventSchema = z.object({
  courier_id: z.string().uuid(),
  order_id: z.string().uuid(),
  assignment_id: z.string().uuid().optional(),
  estimated_eta: z.number().optional(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
});

export const PaymentEventSchema = z.object({
  order_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  payment_id: z.string().uuid().optional(),
  amount: z.number(),
  currency: z.string(),
  failure_reason: z.string().optional(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
});

// Internal types
export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  eventType: string;
  channel: NotificationChannel;
  language: 'tr' | 'en';
  subject?: string;
  title?: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationRequest {
  id: string;
  userId: string;
  eventType: string;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  data: Record<string, any>;
  metadata?: {
    orderId?: string;
    campaignId?: string;
    source?: string;
  };
  scheduleAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export interface NotificationDelivery {
  id: string;
  requestId: string;
  userId: string;
  channel: NotificationChannel;
  templateId: string;
  status: NotificationStatus;
  content: {
    subject?: string;
    title?: string;
    body: string;
    recipient: string; // email, phone, or push token
  };
  attempts: number;
  lastAttemptAt?: Date;
  deliveredAt?: Date;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactInfo {
  userId: string;
  email?: string;
  phone?: string;
  pushTokens: string[];
  language: 'tr' | 'en';
  timezone: string;
  preferences: {
    push: boolean;
    sms: boolean;
    email: boolean;
    quietHours: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationMetrics {
  channel: NotificationChannel;
  sent: number;
  delivered: number;
  failed: number;
  deliveryRate: number;
  averageDeliveryTime: number;
  period: string;
}

// Type exports
export type SendNotificationRequest = z.infer<typeof SendNotificationSchema>;
export type BulkNotificationRequest = z.infer<typeof BulkNotificationSchema>;
export type OrderEvent = z.infer<typeof OrderEventSchema>;
export type CourierEvent = z.infer<typeof CourierEventSchema>;
export type PaymentEvent = z.infer<typeof PaymentEventSchema>;