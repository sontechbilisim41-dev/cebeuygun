
// Database Schema Definitions for Cebeuygun.com Platform
// This file defines all database tables and their relationships

export interface DatabaseSchema {
  // User Management Tables
  users: User[];
  user_profiles: UserProfile[];
  user_addresses: UserAddress[];
  user_preferences: UserPreference[];
  
  // Product Management Tables
  categories: Category[];
  products: Product[];
  product_images: ProductImage[];
  product_variants: ProductVariant[];
  product_reviews: ProductReview[];
  brands: Brand[];
  
  // Vendor/Restaurant Management Tables
  vendors: Vendor[];
  vendor_profiles: VendorProfile[];
  restaurants: Restaurant[];
  restaurant_menus: RestaurantMenu[];
  menu_items: MenuItem[];
  menu_categories: MenuCategory[];
  
  // Order Management Tables
  orders: Order[];
  order_items: OrderItem[];
  order_tracking: OrderTracking[];
  order_payments: OrderPayment[];
  
  // Cart and Wishlist Tables
  carts: Cart[];
  cart_items: CartItem[];
  wishlists: Wishlist[];
  wishlist_items: WishlistItem[];
  
  // Courier and Delivery Tables
  couriers: Courier[];
  courier_profiles: CourierProfile[];
  deliveries: Delivery[];
  delivery_tracking: DeliveryTracking[];
  delivery_zones: DeliveryZone[];
  
  // Marketing and Promotions Tables
  campaigns: Campaign[];
  coupons: Coupon[];
  user_coupons: UserCoupon[];
  flash_deals: FlashDeal[];
  
  // Notification and Communication Tables
  notifications: Notification[];
  user_notifications: UserNotification[];
  support_tickets: SupportTicket[];
  support_messages: SupportMessage[];
  
  // Analytics and Reporting Tables
  analytics_events: AnalyticsEvent[];
  sales_reports: SalesReport[];
  user_activities: UserActivity[];
  
  // System Configuration Tables
  system_settings: SystemSetting[];
  payment_methods: PaymentMethod[];
  shipping_methods: ShippingMethod[];
  tax_rates: TaxRate[];
}

// User Management Tables
export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'vendor' | 'courier' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  email_verified: boolean;
  phone_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  language: string;
  timezone: string;
  loyalty_points: number;
  total_spent: number;
  order_count: number;
  referral_code: string;
  referred_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UserAddress {
  id: string;
  user_id: string;
  title: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  district: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  type: 'home' | 'work' | 'other';
  created_at: string;
  updated_at: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  order_updates: boolean;
  promotional_offers: boolean;
  language: string;
  currency: string;
  theme: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
}

// Product Management Tables
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parent_id?: string;
  level: number;
  sort_order: number;
  is_active: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  category_id: string;
  brand_id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  sku: string;
  barcode?: string;
  base_price: number;
  sale_price?: number;
  cost_price?: number;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  is_active: boolean;
  is_featured: boolean;
  is_digital: boolean;
  requires_shipping: boolean;
  requires_prescription: boolean;
  age_restriction?: number;
  cold_chain_required: boolean;
  expiry_date?: string;
  rating_average: number;
  rating_count: number;
  sold_count: number;
  view_count: number;
  tags?: string;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  type: 'color' | 'size' | 'weight' | 'volume' | 'other';
  value: string;
  price_modifier: number;
  stock_quantity: number;
  sku?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  order_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string;
  is_verified: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Vendor/Restaurant Management Tables
export interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  business_type: 'marketplace' | 'restaurant' | 'market';
  tax_number: string;
  trade_registry_number?: string;
  commission_rate: number;
  is_verified: boolean;
  verification_date?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface VendorProfile {
  id: string;
  vendor_id: string;
  description?: string;
  logo?: string;
  banner_image?: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  business_hours?: string; // JSON string
  delivery_zones?: string; // JSON string
  minimum_order_amount?: number;
  delivery_fee?: number;
  free_delivery_threshold?: number;
  average_preparation_time: number;
  rating_average: number;
  rating_count: number;
  total_orders: number;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  vendor_id: string;
  cuisine_type: string;
  price_range: 1 | 2 | 3 | 4; // $ to $$$$
  accepts_reservations: boolean;
  has_delivery: boolean;
  has_takeout: boolean;
  alcohol_served: boolean;
  outdoor_seating: boolean;
  wifi_available: boolean;
  parking_available: boolean;
  wheelchair_accessible: boolean;
  created_at: string;
  updated_at: string;
}

export interface RestaurantMenu {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  valid_from?: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  menu_id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  menu_category_id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  ingredients?: string;
  allergens?: string;
  nutritional_info?: string; // JSON string
  calories?: number;
  preparation_time: number;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_spicy: boolean;
  spice_level?: number;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Order Management Tables
export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  vendor_id: string;
  courier_id?: string;
  order_type: 'marketplace' | 'food' | 'market';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  subtotal: number;
  tax_amount: number;
  delivery_fee: number;
  service_fee: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  delivery_address_id: string;
  delivery_type: 'express' | 'standard' | 'scheduled';
  scheduled_delivery_time?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  special_instructions?: string;
  cancellation_reason?: string;
  refund_amount?: number;
  refund_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  menu_item_id?: string;
  variant_id?: string;
  name: string;
  description?: string;
  image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  customizations?: string; // JSON string
  created_at: string;
}

export interface OrderTracking {
  id: string;
  order_id: string;
  status: string;
  message?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  estimated_time?: string;
  created_by?: string;
  created_at: string;
}

export interface OrderPayment {
  id: string;
  order_id: string;
  payment_method: 'credit_card' | 'debit_card' | 'cash' | 'digital_wallet' | 'bank_transfer';
  payment_provider?: string;
  transaction_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  gateway_response?: string; // JSON string
  created_at: string;
  updated_at: string;
}

// Cart and Wishlist Tables
export interface Cart {
  id: string;
  user_id: string;
  vendor_id: string;
  session_id?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id?: string;
  menu_item_id?: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  special_instructions?: string;
  customizations?: string; // JSON string
  created_at: string;
  updated_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  name: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  wishlist_id: string;
  product_id: string;
  added_at: string;
}

// Courier and Delivery Tables
export interface Courier {
  id: string;
  user_id: string;
  vehicle_type: 'bicycle' | 'motorcycle' | 'car' | 'van';
  license_number?: string;
  vehicle_registration?: string;
  insurance_number?: string;
  is_online: boolean;
  current_latitude?: number;
  current_longitude?: number;
  max_delivery_distance: number;
  hourly_rate?: number;
  commission_rate: number;
  rating_average: number;
  rating_count: number;
  total_deliveries: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

export interface CourierProfile {
  id: string;
  courier_id: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  bank_account_number?: string;
  bank_name?: string;
  tax_number?: string;
  working_hours?: string; // JSON string
  preferred_zones?: string; // JSON string
  languages_spoken?: string;
  created_at: string;
  updated_at: string;
}

export interface Delivery {
  id: string;
  order_id: string;
  courier_id: string;
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  delivery_address: string;
  delivery_latitude: number;
  delivery_longitude: number;
  distance_km: number;
  estimated_duration_minutes: number;
  actual_duration_minutes?: number;
  pickup_time?: string;
  delivery_time?: string;
  delivery_fee: number;
  tip_amount?: number;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  failure_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryTracking {
  id: string;
  delivery_id: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  description?: string;
  polygon_coordinates: string; // JSON string of coordinates
  delivery_fee: number;
  minimum_order_amount?: number;
  estimated_delivery_time: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Marketing and Promotions Tables
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: 'discount' | 'bogo' | 'free_shipping' | 'cashback' | 'loyalty_points';
  target_audience: 'all' | 'new_customers' | 'returning_customers' | 'vip_customers';
  discount_type?: 'percentage' | 'fixed_amount';
  discount_value?: number;
  minimum_order_amount?: number;
  maximum_discount_amount?: number;
  applicable_products?: string; // JSON string of product IDs
  applicable_categories?: string; // JSON string of category IDs
  applicable_vendors?: string; // JSON string of vendor IDs
  start_date: string;
  end_date: string;
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minimum_order_amount?: number;
  maximum_discount_amount?: number;
  usage_limit?: number;
  usage_limit_per_user?: number;
  usage_count: number;
  applicable_products?: string; // JSON string
  applicable_categories?: string; // JSON string
  applicable_vendors?: string; // JSON string
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface UserCoupon {
  id: string;
  user_id: string;
  coupon_id: string;
  usage_count: number;
  first_used_at?: string;
  last_used_at?: string;
  created_at: string;
}

export interface FlashDeal {
  id: string;
  product_id: string;
  original_price: number;
  deal_price: number;
  discount_percentage: number;
  quantity_available: number;
  quantity_sold: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Notification and Communication Tables
export interface Notification {
  id: string;
  type: 'order_update' | 'promotion' | 'system' | 'marketing' | 'reminder';
  title: string;
  message: string;
  image?: string;
  action_url?: string;
  target_audience: 'all' | 'customers' | 'vendors' | 'couriers' | 'specific_users';
  target_user_ids?: string; // JSON string
  send_via_email: boolean;
  send_via_sms: boolean;
  send_via_push: boolean;
  scheduled_at?: string;
  sent_at?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface UserNotification {
  id: string;
  user_id: string;
  notification_id: string;
  is_read: boolean;
  read_at?: string;
  is_clicked: boolean;
  clicked_at?: string;
  delivered_at: string;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  category: 'order_issue' | 'payment_issue' | 'delivery_issue' | 'product_issue' | 'account_issue' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  subject: string;
  description: string;
  assigned_to?: string;
  resolution?: string;
  satisfaction_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: 'customer' | 'support_agent' | 'system';
  message: string;
  attachments?: string; // JSON string
  is_internal: boolean;
  created_at: string;
}

// Analytics and Reporting Tables
export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  session_id?: string;
  event_type: string;
  event_name: string;
  properties?: string; // JSON string
  page_url?: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
  country?: string;
  city?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  created_at: string;
}

export interface SalesReport {
  id: string;
  report_date: string;
  vendor_id?: string;
  category_id?: string;
  total_orders: number;
  total_revenue: number;
  total_items_sold: number;
  average_order_value: number;
  new_customers: number;
  returning_customers: number;
  cancellation_rate: number;
  refund_rate: number;
  created_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: 'login' | 'logout' | 'order_placed' | 'product_viewed' | 'search' | 'review_posted';
  description?: string;
  metadata?: string; // JSON string
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// System Configuration Tables
export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'digital_wallet' | 'bank_transfer' | 'cash_on_delivery';
  provider: string;
  is_active: boolean;
  configuration?: string; // JSON string
  supported_currencies?: string; // JSON string
  processing_fee_percentage?: number;
  processing_fee_fixed?: number;
  created_at: string;
  updated_at: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  type: 'express' | 'standard' | 'overnight' | 'pickup';
  base_cost: number;
  cost_per_km?: number;
  cost_per_kg?: number;
  free_shipping_threshold?: number;
  estimated_delivery_time_min: number;
  estimated_delivery_time_max: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  type: 'percentage' | 'fixed';
  applicable_to: 'all' | 'products' | 'services' | 'delivery';
  country?: string;
  state?: string;
  city?: string;
  postal_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
