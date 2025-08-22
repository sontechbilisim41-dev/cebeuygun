// Core Data Types
export interface SeedUser {
  id: string;
  email: string;
  password_hash: string;
  phone: string;
  first_name: string;
  last_name: string;
  role: 'customer' | 'seller' | 'courier' | 'admin';
  status: 'pending' | 'active' | 'suspended' | 'banned';
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeedCourier {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  vehicle_type: 'BICYCLE' | 'MOTORBIKE' | 'CAR' | 'WALKING';
  vehicle_plate?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BUSY' | 'OFFLINE' | 'UNAVAILABLE';
  rating: number;
  completed_orders: number;
  is_online: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeedCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeedProduct {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  brand?: string;
  sku?: string;
  barcode?: string;
  base_price: number;
  currency: string;
  tax_rate: number;
  base_stock: number;
  min_stock: number;
  max_stock?: number;
  weight?: number;
  dimensions?: string;
  tags?: string[];
  attributes?: Record<string, any>;
  is_active: boolean;
  is_express_delivery: boolean;
  preparation_time: number;
  created_at: string;
  updated_at: string;
}

export interface SeedProductMedia {
  id: string;
  product_id: string;
  variant_id?: string;
  type: 'image' | 'video';
  url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  alt_text?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeedCampaign {
  id: string;
  name: string;
  description?: string;
  type: 'percentage_discount' | 'flat_discount' | 'free_delivery' | 'loyalty_reward' | 'flash_sale' | 'first_order';
  status: 'draft' | 'active' | 'paused' | 'expired' | 'completed';
  rules: any[];
  is_active: boolean;
  valid_from: string;
  valid_until: string;
  budget?: Record<string, any>;
  spent_budget: Record<string, any>;
  max_usage?: number;
  current_usage: number;
  max_usage_per_user?: number;
  priority: number;
  is_exclusive: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeedCoupon {
  id: string;
  code: string;
  campaign_id?: string;
  discount_type: 'percentage' | 'flat_amount' | 'free_delivery';
  discount_value: number;
  min_order_amount?: Record<string, any>;
  max_discount_amount?: Record<string, any>;
  usage_limit: number;
  usage_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  applicable_products?: string[];
  applicable_categories?: string[];
  excluded_products?: string[];
  user_restrictions?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SeedServiceArea {
  id: string;
  courier_id: string;
  center_lat: number;
  center_lng: number;
  radius_km: number;
  city: string;
  district?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeedWorkingHours {
  id: string;
  courier_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Configuration Types
export interface SeedConfig {
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  counts: {
    users: number;
    couriers: number;
    categories: number;
    products: number;
    campaigns: number;
    coupons: number;
  };
  options: {
    clearExisting: boolean;
    generateImages: boolean;
    verbose: boolean;
  };
}

// Geographic Data
export interface TurkishCity {
  name: string;
  latitude: number;
  longitude: number;
  districts: string[];
  population: number;
}

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  steps: DemoStep[];
  testUsers: TestUser[];
  expectedOutcome: string;
}

export interface DemoStep {
  step: number;
  action: string;
  description: string;
  endpoint?: string;
  credentials?: TestUser;
  expectedResult: string;
}

export interface TestUser {
  email: string;
  password: string;
  role: string;
  name: string;
  description: string;
}