import { z } from 'zod';

// Common types
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  total: z.number().optional(),
  totalPages: z.number().optional(),
});

export const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
  city: z.string(),
  district: z.string(),
  postalCode: z.string().optional(),
});

export const MoneySchema = z.object({
  currency: z.string().length(3),
  amount: z.number().int().min(0),
});

// Feed types
export const FeedRequestSchema = z.object({
  location: LocationSchema.optional(),
  categoryId: z.string().uuid().optional(),
  limit: z.number().min(1).max(50).default(20),
});

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  price: MoneySchema,
  originalPrice: MoneySchema.optional(),
  imageUrl: z.string().url(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().min(0),
  sellerId: z.string().uuid(),
  sellerName: z.string(),
  categoryId: z.string().uuid(),
  isAvailable: z.boolean(),
  preparationTime: z.number().min(0),
  tags: z.array(z.string()),
});

export const CampaignSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().url(),
  discountPercentage: z.number().min(0).max(100),
  validUntil: z.string().datetime(),
  productIds: z.array(z.string().uuid()),
});

export const FeedResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    featuredProducts: z.array(ProductSchema),
    campaigns: z.array(CampaignSchema),
    categories: z.array(z.object({
      id: z.string().uuid(),
      name: z.string(),
      imageUrl: z.string().url(),
      productCount: z.number(),
    })),
    nearbyProducts: z.array(ProductSchema),
  }),
});

// Checkout types
export const CheckoutItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().min(1),
  notes: z.string().optional(),
});

export const CheckoutRequestSchema = z.object({
  items: z.array(CheckoutItemSchema).min(1),
  deliveryAddress: LocationSchema,
  paymentMethodId: z.string(),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

export const CheckoutResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    orderId: z.string().uuid(),
    totalAmount: MoneySchema,
    estimatedDeliveryTime: z.number(),
    paymentStatus: z.enum(['pending', 'processing', 'completed', 'failed']),
  }).optional(),
  error: z.string().optional(),
});

// Order types
export const OrderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'dispatched',
  'delivered',
  'cancelled',
]);

export const OrderSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  sellerId: z.string().uuid(),
  status: OrderStatusSchema,
  items: z.array(z.object({
    productId: z.string().uuid(),
    productName: z.string(),
    quantity: z.number(),
    price: MoneySchema,
  })),
  totalAmount: MoneySchema,
  deliveryAddress: LocationSchema,
  estimatedDeliveryTime: z.string().datetime(),
  actualDeliveryTime: z.string().datetime().optional(),
  courierId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// WebSocket types
export const WebSocketEventSchema = z.object({
  type: z.enum(['order_update', 'courier_location', 'notification']),
  data: z.record(z.any()),
  timestamp: z.string().datetime(),
});

// Auth types
export interface JWTPayload {
  userId: string;
  role: 'CUSTOMER' | 'SELLER' | 'COURIER' | 'ADMIN';
  iat: number;
  exp: number;
}

// Type exports
export type Pagination = z.infer<typeof PaginationSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Money = z.infer<typeof MoneySchema>;
export type FeedRequest = z.infer<typeof FeedRequestSchema>;
export type FeedResponse = z.infer<typeof FeedResponseSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Campaign = z.infer<typeof CampaignSchema>;
export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;
export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type WebSocketEvent = z.infer<typeof WebSocketEventSchema>;