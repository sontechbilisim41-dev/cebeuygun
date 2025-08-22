
// Core Types for TrendyolGo Platform

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'customer' | 'vendor' | 'courier' | 'admin' | 'super_admin';

export interface Customer extends User {
  role: 'customer';
  addresses: Address[];
  preferences: CustomerPreferences;
  loyaltyPoints: number;
  totalSpent: number;
  orderCount: number;
}

export interface Vendor extends User {
  role: 'vendor';
  businessName: string;
  businessType: string;
  taxNumber: string;
  commissionRate: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  businessHours: BusinessHours;
  deliveryZones: string[];
}

export interface Courier extends User {
  role: 'courier';
  vehicleType: 'bike' | 'motorcycle' | 'car';
  licenseNumber: string;
  isOnline: boolean;
  currentLocation?: Location;
  rating: number;
  deliveryCount: number;
  earnings: number;
}

export interface Address {
  id: string;
  userId: string;
  title: string;
  fullName: string;
  phone: string;
  address: string;
  district: string;
  city: string;
  postalCode: string;
  coordinates?: Location;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
}

export interface Location {
  lat: number;
  lng: number;
}

export interface CustomerPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  language: string;
  currency: string;
}

export interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    isOpen: boolean;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  level: number;
  isActive: boolean;
  sortOrder: number;
  children?: Category[];
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  brand: string;
  images: ProductImage[];
  variants: ProductVariant[];
  basePrice: number;
  salePrice?: number;
  discountPercentage?: number;
  stock: number;
  minStock: number;
  weight: number;
  dimensions: ProductDimensions;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  deliveryTime: DeliveryTime;
  shippingCost: number;
  freeShippingThreshold?: number;
  ageRestriction?: number;
  requiresPrescription: boolean;
  coldChain: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  type: 'color' | 'size' | 'other';
  value: string;
  priceModifier: number;
  stock: number;
  sku?: string;
  image?: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

export interface DeliveryTime {
  express: number; // minutes
  standard: number; // hours
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  vendorId: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  couponCode?: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  vendorId: string;
  courierId?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  deliveryAddress: Address;
  deliveryType: 'express' | 'standard';
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type PaymentMethod = 
  | 'credit_card'
  | 'debit_card'
  | 'cash_on_delivery'
  | 'bank_transfer'
  | 'digital_wallet';

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sku: string;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: CampaignType;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  createdAt: string;
}

export type CampaignType = 
  | 'site_wide'
  | 'category'
  | 'product'
  | 'first_order'
  | 'flash_sale'
  | 'loyalty'
  | 'referral';

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  userLimit?: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export type NotificationType = 
  | 'order_status'
  | 'campaign'
  | 'stock_alert'
  | 'price_drop'
  | 'review_request'
  | 'system';

export interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalVendors: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: Product[];
  topCategories: Category[];
  salesTrend: SalesTrendData[];
}

export interface SalesTrendData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface FilterOptions {
  categories?: string[];
  brands?: string[];
  priceRange?: [number, number];
  rating?: number;
  inStock?: boolean;
  onSale?: boolean;
  fastDelivery?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'bestseller';
}

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  filters: FilterOptions;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
