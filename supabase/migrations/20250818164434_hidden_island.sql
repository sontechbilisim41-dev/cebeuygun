-- =====================================================
-- CebeUygun E-Commerce Platform Database Schema
-- Database: PostgreSQL/Supabase
-- Version: 1.0.0
-- Created: 2024-01-20
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- ENUMS AND CUSTOM TYPES
-- =====================================================

-- User role enumeration
CREATE TYPE user_role AS ENUM (
    'customer',
    'seller', 
    'courier',
    'admin'
);

-- User status enumeration
CREATE TYPE user_status AS ENUM (
    'pending',
    'active',
    'suspended',
    'banned'
);

-- Courier status enumeration
CREATE TYPE courier_status AS ENUM (
    'ACTIVE',
    'INACTIVE', 
    'BUSY',
    'OFFLINE',
    'UNAVAILABLE'
);

-- Vehicle type enumeration
CREATE TYPE vehicle_type AS ENUM (
    'BICYCLE',
    'MOTORBIKE',
    'CAR',
    'WALKING'
);

-- Assignment status enumeration
CREATE TYPE assignment_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'COMPLETED',
    'CANCELED'
);

-- Campaign status enumeration
CREATE TYPE campaign_status AS ENUM (
    'draft',
    'active',
    'paused',
    'expired',
    'completed'
);

-- Campaign type enumeration
CREATE TYPE campaign_type AS ENUM (
    'percentage_discount',
    'flat_discount',
    'free_delivery',
    'loyalty_reward',
    'flash_sale',
    'first_order'
);

-- Discount type enumeration
CREATE TYPE discount_type AS ENUM (
    'percentage',
    'flat_amount',
    'free_delivery'
);

-- Audit action enumeration
CREATE TYPE audit_action AS ENUM (
    'applied',
    'excluded',
    'conflict_resolved',
    'budget_exceeded',
    'usage_limit_reached'
);

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table - Central user management
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'customer' NOT NULL,
    status user_status DEFAULT 'pending' NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens for JWT authentication
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PRODUCT CATALOG TABLES
-- =====================================================

-- Product categories with hierarchical structure
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Products table with comprehensive product information
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    brand VARCHAR(100),
    sku VARCHAR(100),
    barcode VARCHAR(100),
    base_price DECIMAL(12,2) NOT NULL CHECK (base_price >= 0),
    currency CHAR(3) DEFAULT 'TRY' NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0 NOT NULL CHECK (tax_rate >= 0 AND tax_rate <= 100),
    base_stock INTEGER DEFAULT 0 NOT NULL CHECK (base_stock >= 0),
    min_stock INTEGER DEFAULT 0 NOT NULL CHECK (min_stock >= 0),
    max_stock INTEGER CHECK (max_stock IS NULL OR max_stock >= min_stock),
    weight DECIMAL(10,3),
    dimensions VARCHAR(100),
    tags TEXT[],
    attributes JSONB,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_express_delivery BOOLEAN DEFAULT FALSE NOT NULL,
    preparation_time INTEGER DEFAULT 0 NOT NULL CHECK (preparation_time >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Product variants for size, color, etc.
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    price DECIMAL(12,2) CHECK (price IS NULL OR price >= 0),
    stock INTEGER CHECK (stock IS NULL OR stock >= 0),
    weight DECIMAL(10,3),
    dimensions VARCHAR(100),
    attributes JSONB,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Product media (images, videos)
CREATE TABLE product_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('image', 'video')),
    url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL CHECK (file_size > 0),
    mime_type VARCHAR(100) NOT NULL,
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seller-specific product configurations
CREATE TABLE seller_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    seller_sku VARCHAR(100),
    price DECIMAL(12,2) CHECK (price IS NULL OR price >= 0),
    stock INTEGER CHECK (stock IS NULL OR stock >= 0),
    min_stock INTEGER CHECK (min_stock IS NULL OR min_stock >= 0),
    max_stock INTEGER CHECK (max_stock IS NULL OR max_stock >= COALESCE(min_stock, 0)),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_visible BOOLEAN DEFAULT TRUE NOT NULL,
    preparation_time INTEGER CHECK (preparation_time IS NULL OR preparation_time >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- COURIER MANAGEMENT TABLES
-- =====================================================

-- Courier profiles
CREATE TABLE couriers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    vehicle_type vehicle_type NOT NULL,
    vehicle_plate VARCHAR(20),
    status courier_status DEFAULT 'INACTIVE' NOT NULL,
    rating DECIMAL(3,2) DEFAULT 5.00 NOT NULL CHECK (rating >= 0 AND rating <= 5),
    completed_orders INTEGER DEFAULT 0 NOT NULL CHECK (completed_orders >= 0),
    is_online BOOLEAN DEFAULT FALSE NOT NULL,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Courier service areas with geographic boundaries
CREATE TABLE courier_service_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    courier_id UUID NOT NULL REFERENCES couriers(id) ON DELETE CASCADE,
    center_lat DOUBLE PRECISION NOT NULL CHECK (center_lat >= -90 AND center_lat <= 90),
    center_lng DOUBLE PRECISION NOT NULL CHECK (center_lng >= -180 AND center_lng <= 180),
    radius_km DOUBLE PRECISION NOT NULL CHECK (radius_km > 0 AND radius_km <= 100),
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Courier working hours
CREATE TABLE courier_working_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    courier_id UUID NOT NULL REFERENCES couriers(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL CHECK (start_time < end_time),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(courier_id, day_of_week)
);

-- Courier location tracking
CREATE TABLE courier_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    courier_id UUID NOT NULL REFERENCES couriers(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude DOUBLE PRECISION NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    address TEXT,
    accuracy DOUBLE PRECISION CHECK (accuracy IS NULL OR accuracy >= 0),
    speed DOUBLE PRECISION CHECK (speed IS NULL OR speed >= 0),
    heading DOUBLE PRECISION CHECK (heading IS NULL OR (heading >= 0 AND heading < 360)),
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- ORDER AND ASSIGNMENT TABLES
-- =====================================================

-- Order assignments to couriers
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL,
    courier_id UUID NOT NULL REFERENCES couriers(id),
    status assignment_status DEFAULT 'PENDING' NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    accepted_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    pickup_location JSONB NOT NULL,
    delivery_location JSONB NOT NULL,
    estimated_distance DOUBLE PRECISION NOT NULL CHECK (estimated_distance >= 0),
    estimated_duration INTEGER NOT NULL CHECK (estimated_duration >= 0),
    actual_distance DOUBLE PRECISION CHECK (actual_distance IS NULL OR actual_distance >= 0),
    actual_duration INTEGER CHECK (actual_duration IS NULL OR actual_duration >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Assignment history for audit trail
CREATE TABLE assignment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    previous_status assignment_status,
    new_status assignment_status NOT NULL,
    changed_by UUID,
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- MARKETING AND CAMPAIGNS
-- =====================================================

-- Marketing campaigns
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type campaign_type NOT NULL,
    status campaign_status DEFAULT 'draft' NOT NULL,
    rules JSONB DEFAULT '[]'::jsonb NOT NULL,
    is_active BOOLEAN DEFAULT FALSE NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL CHECK (valid_from < valid_until),
    budget JSONB,
    spent_budget JSONB DEFAULT '{"amount": 0, "currency": "TRY"}'::jsonb NOT NULL,
    max_usage INTEGER CHECK (max_usage IS NULL OR max_usage > 0),
    current_usage INTEGER DEFAULT 0 NOT NULL CHECK (current_usage >= 0),
    max_usage_per_user INTEGER CHECK (max_usage_per_user IS NULL OR max_usage_per_user > 0),
    priority INTEGER DEFAULT 100 NOT NULL CHECK (priority >= 1 AND priority <= 1000),
    is_exclusive BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discount coupons
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    discount_type discount_type NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value >= 0),
    min_order_amount JSONB,
    max_discount_amount JSONB,
    usage_limit INTEGER DEFAULT 1 NOT NULL CHECK (usage_limit > 0),
    usage_count INTEGER DEFAULT 0 NOT NULL CHECK (usage_count >= 0 AND usage_count <= usage_limit),
    valid_from TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL CHECK (valid_from < valid_until),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    applicable_products UUID[],
    applicable_categories UUID[],
    excluded_products UUID[],
    user_restrictions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign usage tracking
CREATE TABLE campaign_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    order_id UUID,
    discount_amount JSONB NOT NULL,
    applied_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(campaign_id, order_id) DEFERRABLE INITIALLY DEFERRED
);

-- Campaign audit trail
CREATE TABLE campaign_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    customer_id UUID,
    action audit_action NOT NULL,
    details JSONB DEFAULT '{}'::jsonb NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    session_id UUID,
    ip_address INET,
    user_agent TEXT
);

-- Coupon pools for bulk generation
CREATE TABLE coupon_pools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    pool_name VARCHAR(100) NOT NULL,
    total_coupons INTEGER NOT NULL CHECK (total_coupons > 0),
    used_coupons INTEGER DEFAULT 0 NOT NULL CHECK (used_coupons >= 0 AND used_coupons <= total_coupons),
    template JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRICING AND COMMISSION TABLES
-- =====================================================

-- Dynamic pricing quotes
CREATE TABLE pricing_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    quote_hash VARCHAR(64) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0),
    tax_amount DECIMAL(12,2) NOT NULL CHECK (tax_amount >= 0),
    delivery_fee DECIMAL(12,2) NOT NULL CHECK (delivery_fee >= 0),
    small_basket_fee DECIMAL(12,2) DEFAULT 0 NOT NULL CHECK (small_basket_fee >= 0),
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    currency CHAR(3) DEFAULT 'TRY' NOT NULL,
    commission_breakdown JSONB NOT NULL,
    pricing_breakdown JSONB NOT NULL,
    applied_rules JSONB NOT NULL,
    feature_flags JSONB,
    region VARCHAR(100),
    valid_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Commission rates configuration
CREATE TABLE commission_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID,
    seller_id UUID,
    logistics_provider VARCHAR(100),
    commission_type VARCHAR(20) NOT NULL CHECK (commission_type IN ('PERCENTAGE', 'FLAT', 'TIERED')),
    rate DECIMAL(10,4) NOT NULL CHECK (rate >= 0),
    min_amount DECIMAL(12,2) CHECK (min_amount >= 0),
    max_amount DECIMAL(12,2) CHECK (max_amount >= 0),
    currency CHAR(3) DEFAULT 'TRY' NOT NULL,
    region VARCHAR(100),
    effective_from TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    effective_to TIMESTAMPTZ CHECK (effective_to IS NULL OR effective_to > effective_from),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    priority INTEGER DEFAULT 100 NOT NULL CHECK (priority >= 1 AND priority <= 1000),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CHECK (max_amount IS NULL OR min_amount IS NULL OR max_amount >= min_amount)
);

-- Pricing rules engine
CREATE TABLE pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('DELIVERY_FEE', 'SMALL_BASKET', 'COMMISSION', 'REGIONAL_FEE', 'EXPRESS_FEE')),
    configuration JSONB NOT NULL,
    region VARCHAR(100),
    effective_from TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    effective_to TIMESTAMPTZ CHECK (effective_to IS NULL OR effective_to > effective_from),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    version INTEGER DEFAULT 1 NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Feature flags for A/B testing
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('BOOLEAN', 'STRING', 'NUMBER', 'PERCENTAGE')),
    value JSONB NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    rollout JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Commission analytics
CREATE TABLE commission_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    category_id UUID,
    seller_id UUID,
    region VARCHAR(100),
    total_commission DECIMAL(12,2) DEFAULT 0 NOT NULL,
    transaction_count INTEGER DEFAULT 0 NOT NULL,
    average_rate DECIMAL(10,4) DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Refresh token indexes
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Password reset token indexes
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Category indexes
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
CREATE INDEX idx_categories_name ON categories(name);

-- Product indexes
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_base_price ON products(base_price);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_is_express_delivery ON products(is_express_delivery);
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_products_attributes ON products USING GIN(attributes);
CREATE INDEX idx_products_name_trgm ON products USING GIN(name gin_trgm_ops);

-- Unique indexes for business rules
CREATE UNIQUE INDEX idx_products_sku_unique ON products(sku) WHERE sku IS NOT NULL;
CREATE UNIQUE INDEX idx_products_barcode_unique ON products(barcode) WHERE barcode IS NOT NULL;

-- Product variant indexes
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_is_active ON product_variants(is_active);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_product_variants_barcode ON product_variants(barcode);
CREATE INDEX idx_product_variants_sort_order ON product_variants(sort_order);
CREATE INDEX idx_product_variants_attributes ON product_variants USING GIN(attributes);

-- Unique indexes for variants
CREATE UNIQUE INDEX idx_product_variants_sku_unique ON product_variants(sku) WHERE sku IS NOT NULL;
CREATE UNIQUE INDEX idx_product_variants_barcode_unique ON product_variants(barcode) WHERE barcode IS NOT NULL;

-- Product media indexes
CREATE INDEX idx_product_media_product_id ON product_media(product_id);
CREATE INDEX idx_product_media_variant_id ON product_media(variant_id);
CREATE INDEX idx_product_media_type ON product_media(type);
CREATE INDEX idx_product_media_is_active ON product_media(is_active);
CREATE INDEX idx_product_media_sort_order ON product_media(sort_order);

-- Seller product indexes
CREATE INDEX idx_seller_products_seller_id ON seller_products(seller_id);
CREATE INDEX idx_seller_products_product_id ON seller_products(product_id);
CREATE INDEX idx_seller_products_variant_id ON seller_products(variant_id);
CREATE INDEX idx_seller_products_is_active ON seller_products(is_active);
CREATE INDEX idx_seller_products_is_visible ON seller_products(is_visible);
CREATE INDEX idx_seller_products_seller_sku ON seller_products(seller_sku);

-- Unique constraint for seller products
CREATE UNIQUE INDEX idx_seller_products_unique ON seller_products(seller_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid));
CREATE UNIQUE INDEX idx_seller_products_seller_sku_unique ON seller_products(seller_id, seller_sku) WHERE seller_sku IS NOT NULL;

-- Courier indexes
CREATE INDEX idx_couriers_status ON couriers(status);
CREATE INDEX idx_couriers_vehicle_type ON couriers(vehicle_type);
CREATE INDEX idx_couriers_is_online ON couriers(is_online);
CREATE INDEX idx_couriers_rating ON couriers(rating);
CREATE INDEX idx_couriers_last_seen ON couriers(last_seen_at);

-- Service area indexes
CREATE INDEX idx_service_areas_courier_id ON courier_service_areas(courier_id);
CREATE INDEX idx_service_areas_city ON courier_service_areas(city);
CREATE INDEX idx_service_areas_is_active ON courier_service_areas(is_active);
CREATE INDEX idx_service_areas_location ON courier_service_areas USING GIST(ST_Point(center_lng, center_lat));

-- Working hours indexes
CREATE INDEX idx_working_hours_courier_id ON courier_working_hours(courier_id);
CREATE INDEX idx_working_hours_day ON courier_working_hours(day_of_week);
CREATE INDEX idx_working_hours_active ON courier_working_hours(is_active);

-- Location tracking indexes
CREATE INDEX idx_courier_locations_courier_id ON courier_locations(courier_id);
CREATE INDEX idx_courier_locations_timestamp ON courier_locations(timestamp);
CREATE INDEX idx_courier_locations_point ON courier_locations USING GIST(ST_Point(longitude, latitude));

-- Assignment indexes
CREATE INDEX idx_assignments_order_id ON assignments(order_id);
CREATE INDEX idx_assignments_courier_id ON assignments(courier_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_assignments_assigned_at ON assignments(assigned_at);
CREATE INDEX idx_assignments_distance ON assignments(estimated_distance);

-- Assignment history indexes
CREATE INDEX idx_assignment_history_assignment_id ON assignment_history(assignment_id);
CREATE INDEX idx_assignment_history_created_at ON assignment_history(created_at);

-- Campaign indexes
CREATE INDEX idx_campaigns_type ON campaigns(type);
CREATE INDEX idx_campaigns_dates ON campaigns(valid_from, valid_until);
CREATE INDEX idx_campaigns_active ON campaigns(is_active, status, valid_from, valid_until) WHERE is_active = TRUE;
CREATE INDEX idx_campaigns_priority ON campaigns(priority DESC) WHERE is_active = TRUE;
CREATE INDEX idx_campaigns_rules_gin ON campaigns USING GIN(rules);

-- Coupon indexes
CREATE INDEX idx_coupons_code ON coupons(code) WHERE is_active = TRUE;
CREATE INDEX idx_coupons_campaign ON coupons(campaign_id);
CREATE INDEX idx_coupons_active ON coupons(is_active, valid_from, valid_until) WHERE is_active = TRUE;
CREATE INDEX idx_coupons_usage ON coupons(usage_count, usage_limit);

-- Campaign usage indexes
CREATE INDEX idx_campaign_usage_campaign ON campaign_usage(campaign_id);
CREATE INDEX idx_campaign_usage_customer ON campaign_usage(customer_id);
CREATE INDEX idx_campaign_usage_order ON campaign_usage(order_id);
CREATE INDEX idx_campaign_usage_applied_at ON campaign_usage(applied_at);

-- Campaign audit indexes
CREATE INDEX idx_campaign_audit_campaign ON campaign_audit(campaign_id);
CREATE INDEX idx_campaign_audit_customer ON campaign_audit(customer_id);
CREATE INDEX idx_campaign_audit_action ON campaign_audit(action);
CREATE INDEX idx_campaign_audit_timestamp ON campaign_audit(timestamp);

-- Coupon pool indexes
CREATE INDEX idx_coupon_pools_campaign ON coupon_pools(campaign_id);

-- Pricing quote indexes
CREATE INDEX idx_pricing_quotes_hash ON pricing_quotes(quote_hash, valid_until);
CREATE INDEX idx_pricing_quotes_customer ON pricing_quotes(customer_id, created_at);

-- Commission rate indexes
CREATE INDEX idx_commission_rates_lookup ON commission_rates(category_id, seller_id, logistics_provider, region, effective_from, effective_to) WHERE is_active = TRUE;
CREATE INDEX idx_commission_rates_effective ON commission_rates(effective_from, effective_to) WHERE is_active = TRUE;
CREATE INDEX idx_commission_rates_priority ON commission_rates(priority DESC) WHERE is_active = TRUE;

-- Pricing rules indexes
CREATE INDEX idx_pricing_rules_type_region ON pricing_rules(type, region, effective_from, effective_to) WHERE is_active = TRUE;
CREATE INDEX idx_pricing_rules_version ON pricing_rules(name, version DESC);

-- Feature flags indexes
CREATE INDEX idx_feature_flags_key ON feature_flags(key) WHERE is_enabled = TRUE;

-- Commission analytics indexes
CREATE INDEX idx_commission_analytics_period ON commission_analytics(period_start, period_end, category_id, seller_id, region);

-- =====================================================
-- VIEWS FOR COMPLEX QUERIES
-- =====================================================

-- Courier availability view
CREATE VIEW courier_availability AS
SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.phone,
    c.vehicle_type,
    c.status,
    c.is_online,
    c.rating,
    c.completed_orders,
    cl.latitude AS current_lat,
    cl.longitude AS current_lng,
    cl.timestamp AS location_updated_at,
    (EXTRACT(EPOCH FROM (NOW() - cl.timestamp)) < 300) AS location_fresh,
    (c.status = 'ACTIVE' AND c.is_online = TRUE AND 
     EXTRACT(EPOCH FROM (NOW() - cl.timestamp)) < 300) AS is_available
FROM couriers c
LEFT JOIN LATERAL (
    SELECT latitude, longitude, timestamp
    FROM courier_locations 
    WHERE courier_id = c.id 
    ORDER BY timestamp DESC 
    LIMIT 1
) cl ON TRUE;

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_media_updated_at BEFORE UPDATE ON product_media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seller_products_updated_at BEFORE UPDATE ON seller_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_couriers_updated_at BEFORE UPDATE ON couriers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_areas_updated_at BEFORE UPDATE ON courier_service_areas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_working_hours_updated_at BEFORE UPDATE ON courier_working_hours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupon_pools_updated_at BEFORE UPDATE ON coupon_pools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commission_rates_updated_at BEFORE UPDATE ON commission_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON pricing_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commission_analytics_updated_at BEFORE UPDATE ON commission_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Assignment status change logging
CREATE OR REPLACE FUNCTION log_assignment_status_change()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO assignment_history (
        assignment_id,
        previous_status,
        new_status,
        changed_by,
        reason,
        metadata
    ) VALUES (
        NEW.id,
        OLD.status,
        NEW.status,
        NULL, -- Would be set by application
        NULL,
        jsonb_build_object(
            'changed_at', NOW(),
            'old_status', OLD.status,
            'new_status', NEW.status
        )
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_assignment_status_changes 
    AFTER UPDATE ON assignments 
    FOR EACH ROW 
    EXECUTE FUNCTION log_assignment_status_change();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_pools ENABLE ROW LEVEL SECURITY;

-- Campaign policies
CREATE POLICY "Campaigns are viewable by everyone" ON campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Campaigns can be managed by admins" ON campaigns FOR ALL TO authenticated USING (jwt() ->> 'role' = 'admin');

-- Coupon policies
CREATE POLICY "Coupons are viewable by everyone" ON coupons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Coupons can be managed by admins" ON coupons FOR ALL TO authenticated USING (jwt() ->> 'role' = 'admin');

-- Campaign usage policies
CREATE POLICY "Users can view their own usage" ON campaign_usage FOR SELECT TO authenticated USING (customer_id::text = jwt() ->> 'sub');
CREATE POLICY "Usage can be inserted by system" ON campaign_usage FOR INSERT TO authenticated WITH CHECK (true);

-- Campaign audit policies
CREATE POLICY "Audit logs viewable by admins" ON campaign_audit FOR SELECT TO authenticated USING (jwt() ->> 'role' = 'admin');
CREATE POLICY "Audit logs can be inserted by system" ON campaign_audit FOR INSERT TO authenticated WITH CHECK (true);

-- =====================================================
-- VALIDATION FUNCTIONS
-- =====================================================

-- Validate campaign rules
CREATE OR REPLACE FUNCTION validate_campaign_rules(rules JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Basic validation for campaign rules structure
    -- In production, this would contain comprehensive validation logic
    RETURN jsonb_typeof(rules) = 'array';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add validation constraint
ALTER TABLE campaigns ADD CONSTRAINT campaigns_valid_rules CHECK (validate_campaign_rules(rules));

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

-- Table comments
COMMENT ON TABLE users IS 'Central user management table supporting multiple roles';
COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for secure authentication';
COMMENT ON TABLE password_reset_tokens IS 'Temporary tokens for password reset functionality';
COMMENT ON TABLE categories IS 'Hierarchical product categories with parent-child relationships';
COMMENT ON TABLE products IS 'Main product catalog with comprehensive product information';
COMMENT ON TABLE product_variants IS 'Product variations for size, color, and other attributes';
COMMENT ON TABLE product_media IS 'Product images and videos with metadata';
COMMENT ON TABLE seller_products IS 'Seller-specific product configurations and pricing';
COMMENT ON TABLE couriers IS 'Courier profiles with vehicle and performance information';
COMMENT ON TABLE courier_service_areas IS 'Geographic service areas for each courier';
COMMENT ON TABLE courier_working_hours IS 'Courier availability schedules';
COMMENT ON TABLE courier_locations IS 'Real-time courier location tracking';
COMMENT ON TABLE assignments IS 'Order assignments to couriers with tracking';
COMMENT ON TABLE assignment_history IS 'Audit trail for assignment status changes';
COMMENT ON TABLE campaigns IS 'Marketing campaigns with rules and budget tracking';
COMMENT ON TABLE coupons IS 'Discount coupons linked to campaigns';
COMMENT ON TABLE campaign_usage IS 'Campaign usage tracking for analytics';
COMMENT ON TABLE campaign_audit IS 'Audit trail for campaign-related actions';
COMMENT ON TABLE coupon_pools IS 'Bulk coupon generation and management';
COMMENT ON TABLE pricing_quotes IS 'Dynamic pricing calculations with breakdown';
COMMENT ON TABLE commission_rates IS 'Commission rate configuration by category/seller';
COMMENT ON TABLE pricing_rules IS 'Pricing rules engine for dynamic calculations';
COMMENT ON TABLE feature_flags IS 'Feature flags for A/B testing and rollouts';
COMMENT ON TABLE commission_analytics IS 'Commission analytics and reporting data';

-- Column comments for key fields
COMMENT ON COLUMN users.role IS 'User role: customer, seller, courier, or admin';
COMMENT ON COLUMN users.status IS 'Account status: pending, active, suspended, or banned';
COMMENT ON COLUMN couriers.rating IS 'Courier rating from 0.00 to 5.00';
COMMENT ON COLUMN couriers.vehicle_type IS 'Type of vehicle used for deliveries';
COMMENT ON COLUMN courier_service_areas.radius_km IS 'Service radius in kilometers (max 100km)';
COMMENT ON COLUMN assignments.estimated_distance IS 'Estimated delivery distance in kilometers';
COMMENT ON COLUMN assignments.estimated_duration IS 'Estimated delivery duration in minutes';
COMMENT ON COLUMN campaigns.priority IS 'Campaign priority for conflict resolution (1-1000)';
COMMENT ON COLUMN campaigns.is_exclusive IS 'Whether campaign can be combined with others';
COMMENT ON COLUMN coupons.usage_limit IS 'Maximum number of times coupon can be used';
COMMENT ON COLUMN pricing_quotes.quote_hash IS 'Hash for quote deduplication and caching';
COMMENT ON COLUMN commission_rates.rate IS 'Commission rate (percentage or flat amount)';
COMMENT ON COLUMN feature_flags.rollout IS 'Rollout configuration for gradual feature release';