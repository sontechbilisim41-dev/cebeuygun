// Core entity types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Money {
  amount: number; // Amount in cents
  currency: string;
}

export interface Address {
  street: string;
  city: string;
  district: string;
  postalCode?: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

// Order types
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'dispatched' 
  | 'delivered' 
  | 'cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: Money;
  totalPrice: Money;
  notes?: string;
}

export interface Order extends BaseEntity {
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: Money;
  taxAmount: Money;
  deliveryFee: Money;
  totalAmount: Money;
  deliveryAddress: Address;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  notes?: string;
  isExpressDelivery: boolean;
}

// Product types
export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  price?: Money;
  stock?: number;
  attributes: Record<string, string>;
  isActive: boolean;
}

export interface Product extends BaseEntity {
  name: string;
  description?: string;
  categoryId: string;
  categoryName: string;
  brand?: string;
  sku?: string;
  barcode?: string;
  basePrice: Money;
  taxRate: number;
  stock: number;
  minStock: number;
  maxStock?: number;
  tags: string[];
  variants: ProductVariant[];
  images: string[];
  isActive: boolean;
  isExpressDelivery: boolean;
  preparationTime: number; // in minutes
}

// Campaign types
export type CampaignType = 
  | 'percentage_discount' 
  | 'flat_discount' 
  | 'free_delivery' 
  | 'loyalty_reward' 
  | 'flash_sale' 
  | 'first_order';

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'expired' | 'completed';

export interface Campaign extends BaseEntity {
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  discountValue: number;
  minOrderAmount?: Money;
  maxDiscountAmount?: Money;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
  targetCustomerSegments?: string[];
}

// Analytics types
export interface SalesMetrics {
  totalRevenue: Money;
  totalOrders: number;
  averageOrderValue: Money;
  conversionRate: number;
  period: string;
}

export interface OrderAnalytics {
  ordersByStatus: Record<OrderStatus, number>;
  ordersByHour: Array<{ hour: number; count: number }>;
  topProducts: Array<{ productId: string; productName: string; quantity: number; revenue: Money }>;
  customerSegments: Array<{ segment: string; orders: number; revenue: Money }>;
}

export interface InventoryAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
}

// Bulk operation types
export interface BulkOperation extends BaseEntity {
  type: 'product_import' | 'inventory_update' | 'price_update';
  fileName: string;
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errors: BulkOperationError[];
  downloadUrl?: string;
}

export interface BulkOperationError {
  row: number;
  field: string;
  message: string;
  value: string;
}

// WebSocket event types
export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: string;
}

export interface OrderUpdateEvent extends WebSocketEvent {
  type: 'order_update';
  data: {
    orderId: string;
    status: OrderStatus;
    estimatedDeliveryTime?: string;
    courierInfo?: {
      id: string;
      name: string;
      phone: string;
    };
  };
}

export interface InventoryUpdateEvent extends WebSocketEvent {
  type: 'inventory_update';
  data: {
    productId: string;
    newStock: number;
    previousStock: number;
    reason: string;
  };
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface OrderStatusUpdateForm {
  status: OrderStatus;
  notes?: string;
  estimatedDeliveryTime?: string;
}

export interface ProductForm {
  name: string;
  description?: string;
  categoryId: string;
  brand?: string;
  sku?: string;
  barcode?: string;
  basePrice: number;
  taxRate: number;
  stock: number;
  minStock: number;
  maxStock?: number;
  tags: string[];
  isExpressDelivery: boolean;
  preparationTime: number;
  variants: Omit<ProductVariant, 'id'>[];
}

export interface CampaignForm {
  name: string;
  description: string;
  type: CampaignType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  targetCustomerSegments?: string[];
}

// Store types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'seller';
  sellerId: string;
  permissions: string[];
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
  language: string;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}