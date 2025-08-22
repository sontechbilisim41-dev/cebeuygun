-- =====================================================
-- CebeUygun E-Commerce Platform Database Schema
-- Database: MySQL 8.0+
-- Version: 1.0.0
-- Created: 2024-01-20
-- =====================================================

-- Set SQL mode for strict validation
SET sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';

-- =====================================================
-- DATABASE SETUP
-- =====================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS cebeuygun 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE cebeuygun;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table - Central user management
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('customer', 'seller', 'courier', 'admin') DEFAULT 'customer' NOT NULL,
    status ENUM('pending', 'active', 'suspended', 'banned') DEFAULT 'pending' NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_phone (phone),
    INDEX idx_users_role (role),
    INDEX idx_users_status (status),
    INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB COMMENT='Central user management table supporting multiple roles';

-- Refresh tokens for JWT authentication
CREATE TABLE refresh_tokens (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_refresh_tokens_user_id (user_id),
    INDEX idx_refresh_tokens_expires_at (expires_at)
) ENGINE=InnoDB COMMENT='JWT refresh tokens for secure authentication';

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_password_reset_tokens_user_id (user_id),
    INDEX idx_password_reset_tokens_expires_at (expires_at)
) ENGINE=InnoDB COMMENT='Temporary tokens for password reset functionality';

-- =====================================================
-- PRODUCT CATALOG TABLES
-- =====================================================

-- Product categories with hierarchical structure
CREATE TABLE categories (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id CHAR(36) NULL,
    image_url TEXT,
    sort_order INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_categories_parent_id (parent_id),
    INDEX idx_categories_is_active (is_active),
    INDEX idx_categories_sort_order (sort_order),
    INDEX idx_categories_name (name)
) ENGINE=InnoDB COMMENT='Hierarchical product categories with parent-child relationships';

-- Products table with comprehensive product information
CREATE TABLE products (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id CHAR(36) NOT NULL,
    brand VARCHAR(100),
    sku VARCHAR(100),
    barcode VARCHAR(100),
    base_price DECIMAL(12,2) NOT NULL CHECK (base_price >= 0),
    currency CHAR(3) DEFAULT 'TRY' NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0 NOT NULL CHECK (tax_rate >= 0 AND tax_rate <= 100),
    base_stock INT DEFAULT 0 NOT NULL CHECK (base_stock >= 0),
    min_stock INT DEFAULT 0 NOT NULL CHECK (min_stock >= 0),
    max_stock INT NULL CHECK (max_stock IS NULL OR max_stock >= min_stock),
    weight DECIMAL(10,3),
    dimensions VARCHAR(100),
    tags JSON,
    attributes JSON,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_express_delivery BOOLEAN DEFAULT FALSE NOT NULL,
    preparation_time INT DEFAULT 0 NOT NULL CHECK (preparation_time >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_products_category_id (category_id),
    INDEX idx_products_is_active (is_active),
    INDEX idx_products_base_price (base_price),
    INDEX idx_products_brand (brand),
    INDEX idx_products_sku (sku),
    INDEX idx_products_barcode (barcode),
    INDEX idx_products_is_express_delivery (is_express_delivery),
    UNIQUE INDEX idx_products_sku_unique (sku),
    UNIQUE INDEX idx_products_barcode_unique (barcode),
    FULLTEXT INDEX idx_products_name_fulltext (name, description)
) ENGINE=InnoDB COMMENT='Main product catalog with comprehensive product information';

-- Product variants for size, color, etc.
CREATE TABLE product_variants (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    price DECIMAL(12,2) CHECK (price IS NULL OR price >= 0),
    stock INT CHECK (stock IS NULL OR stock >= 0),
    weight DECIMAL(10,3),
    dimensions VARCHAR(100),
    attributes JSON,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_variants_product_id (product_id),
    INDEX idx_product_variants_is_active (is_active),
    INDEX idx_product_variants_sku (sku),
    INDEX idx_product_variants_barcode (barcode),
    INDEX idx_product_variants_sort_order (sort_order),
    UNIQUE INDEX idx_product_variants_sku_unique (sku),
    UNIQUE INDEX idx_product_variants_barcode_unique (barcode)
) ENGINE=InnoDB COMMENT='Product variations for size, color, and other attributes';

-- Product media (images, videos)
CREATE TABLE product_media (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id CHAR(36) NOT NULL,
    variant_id CHAR(36) NULL,
    type ENUM('image', 'video') NOT NULL,
    url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL CHECK (file_size > 0),
    mime_type VARCHAR(100) NOT NULL,
    alt_text TEXT,
    sort_order INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
    INDEX idx_product_media_product_id (product_id),
    INDEX idx_product_media_variant_id (variant_id),
    INDEX idx_product_media_type (type),
    INDEX idx_product_media_is_active (is_active),
    INDEX idx_product_media_sort_order (sort_order)
) ENGINE=InnoDB COMMENT='Product images and videos with metadata';

-- Seller-specific product configurations
CREATE TABLE seller_products (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    seller_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    variant_id CHAR(36) NULL,
    seller_sku VARCHAR(100),
    price DECIMAL(12,2) CHECK (price IS NULL OR price >= 0),
    stock INT CHECK (stock IS NULL OR stock >= 0),
    min_stock INT CHECK (min_stock IS NULL OR min_stock >= 0),
    max_stock INT CHECK (max_stock IS NULL OR max_stock >= COALESCE(min_stock, 0)),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_visible BOOLEAN DEFAULT TRUE NOT NULL,
    preparation_time INT CHECK (preparation_time IS NULL OR preparation_time >= 0),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
    INDEX idx_seller_products_seller_id (seller_id),
    INDEX idx_seller_products_product_id (product_id),
    INDEX idx_seller_products_variant_id (variant_id),
    INDEX idx_seller_products_is_active (is_active),
    INDEX idx_seller_products_is_visible (is_visible),
    INDEX idx_seller_products_seller_sku (seller_sku),
    UNIQUE INDEX idx_seller_products_unique (seller_id, product_id, COALESCE(variant_id, '')),
    UNIQUE INDEX idx_seller_products_seller_sku_unique (seller_id, seller_sku)
) ENGINE=InnoDB COMMENT='Seller-specific product configurations and pricing';

-- =====================================================
-- COURIER MANAGEMENT TABLES
-- =====================================================

-- Courier profiles
CREATE TABLE couriers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    vehicle_type ENUM('BICYCLE', 'MOTORBIKE', 'CAR', 'WALKING') NOT NULL,
    vehicle_plate VARCHAR(20),
    status ENUM('ACTIVE', 'INACTIVE', 'BUSY', 'OFFLINE', 'UNAVAILABLE') DEFAULT 'INACTIVE' NOT NULL,
    rating DECIMAL(3,2) DEFAULT 5.00 NOT NULL CHECK (rating >= 0 AND rating <= 5),
    completed_orders INT DEFAULT 0 NOT NULL CHECK (completed_orders >= 0),
    is_online BOOLEAN DEFAULT FALSE NOT NULL,
    last_seen_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    INDEX idx_couriers_status (status),
    INDEX idx_couriers_vehicle_type (vehicle_type),
    INDEX idx_couriers_is_online (is_online),
    INDEX idx_couriers_rating (rating),
    INDEX idx_couriers_last_seen (last_seen_at)
) ENGINE=InnoDB COMMENT='Courier profiles with vehicle and performance information';

-- Courier service areas with geographic boundaries
CREATE TABLE courier_service_areas (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    courier_id CHAR(36) NOT NULL,
    center_lat DOUBLE NOT NULL CHECK (center_lat >= -90 AND center_lat <= 90),
    center_lng DOUBLE NOT NULL CHECK (center_lng >= -180 AND center_lng <= 180),
    radius_km DOUBLE NOT NULL CHECK (radius_km > 0 AND radius_km <= 100),
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    FOREIGN KEY (courier_id) REFERENCES couriers(id) ON DELETE CASCADE,
    INDEX idx_service_areas_courier_id (courier_id),
    INDEX idx_service_areas_city (city),
    INDEX idx_service_areas_is_active (is_active),
    SPATIAL INDEX idx_service_areas_location (POINT(center_lng, center_lat))
) ENGINE=InnoDB COMMENT='Geographic service areas for each courier';

-- Courier working hours
CREATE TABLE courier_working_hours (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    courier_id CHAR(36) NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    FOREIGN KEY (courier_id) REFERENCES couriers(id) ON DELETE CASCADE,
    INDEX idx_working_hours_courier_id (courier_id),
    INDEX idx_working_hours_day (day_of_week),
    INDEX idx_working_hours_active (is_active),
    UNIQUE KEY unique_courier_day (courier_id, day_of_week),
    CHECK (start_time < end_time)
) ENGINE=InnoDB COMMENT='Courier availability schedules';

-- Courier location tracking
CREATE TABLE courier_locations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    courier_id CHAR(36) NOT NULL,
    latitude DOUBLE NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude DOUBLE NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    address TEXT,
    accuracy DOUBLE CHECK (accuracy IS NULL OR accuracy >= 0),
    speed DOUBLE CHECK (speed IS NULL OR speed >= 0),
    heading DOUBLE CHECK (heading IS NULL OR (heading >= 0 AND heading < 360)),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    FOREIGN KEY (courier_id) REFERENCES couriers(id) ON DELETE CASCADE,
    INDEX idx_courier_locations_courier_id (courier_id),
    INDEX idx_courier_locations_timestamp (timestamp),
    SPATIAL INDEX idx_courier_locations_point (POINT(longitude, latitude))
) ENGINE=InnoDB COMMENT='Real-time courier location tracking';

-- =====================================================
-- ORDER AND ASSIGNMENT TABLES
-- =====================================================

-- Order assignments to couriers
CREATE TABLE assignments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id CHAR(36) UNIQUE NOT NULL,
    courier_id CHAR(36) NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELED') DEFAULT 'PENDING' NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP NULL,
    rejected_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    pickup_location JSON NOT NULL,
    delivery_location JSON NOT NULL,
    estimated_distance DOUBLE NOT NULL CHECK (estimated_distance >= 0),
    estimated_duration INT NOT NULL CHECK (estimated_duration >= 0),
    actual_distance DOUBLE CHECK (actual_distance IS NULL OR actual_distance >= 0),
    actual_duration INT CHECK (actual_duration IS NULL OR actual_duration >= 0),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    FOREIGN KEY (courier_id) REFERENCES couriers(id),
    INDEX idx_assignments_order_id (order_id),
    INDEX idx_assignments_courier_id (courier_id),
    INDEX idx_assignments_status (status),
    INDEX idx_assignments_assigned_at (assigned_at),
    INDEX idx_assignments_distance (estimated_distance)
) ENGINE=InnoDB COMMENT='Order assignments to couriers with tracking';

-- Assignment history for audit trail
CREATE TABLE assignment_history (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    assignment_id CHAR(36) NOT NULL,
    previous_status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELED'),
    new_status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELED') NOT NULL,
    changed_by CHAR(36),
    reason TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    INDEX idx_assignment_history_assignment_id (assignment_id),
    INDEX idx_assignment_history_created_at (created_at)
) ENGINE=InnoDB COMMENT='Audit trail for assignment status changes';

-- =====================================================
-- MARKETING AND CAMPAIGNS
-- =====================================================

-- Marketing campaigns
CREATE TABLE campaigns (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type ENUM('percentage_discount', 'flat_discount', 'free_delivery', 'loyalty_reward', 'flash_sale', 'first_order') NOT NULL,
    status ENUM('draft', 'active', 'paused', 'expired', 'completed') DEFAULT 'draft' NOT NULL,
    rules JSON DEFAULT ('[]') NOT NULL,
    is_active BOOLEAN DEFAULT FALSE NOT NULL,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    budget JSON,
    spent_budget JSON DEFAULT ('{"amount": 0, "currency": "TRY"}') NOT NULL,
    max_usage INT CHECK (max_usage IS NULL OR max_usage > 0),
    current_usage INT DEFAULT 0 NOT NULL CHECK (current_usage >= 0),
    max_usage_per_user INT CHECK (max_usage_per_user IS NULL OR max_usage_per_user > 0),
    priority INT DEFAULT 100 NOT NULL CHECK (priority >= 1 AND priority <= 1000),
    is_exclusive BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_campaigns_type (type),
    INDEX idx_campaigns_dates (valid_from, valid_until),
    INDEX idx_campaigns_active (is_active, status, valid_from, valid_until),
    INDEX idx_campaigns_priority (priority DESC),
    CHECK (valid_from < valid_until)
) ENGINE=InnoDB COMMENT='Marketing campaigns with rules and budget tracking';

-- Discount coupons
CREATE TABLE coupons (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    code VARCHAR(50) UNIQUE NOT NULL,
    campaign_id CHAR(36),
    discount_type ENUM('percentage', 'flat_amount', 'free_delivery') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value >= 0),
    min_order_amount JSON,
    max_discount_amount JSON,
    usage_limit INT DEFAULT 1 NOT NULL CHECK (usage_limit > 0),
    usage_count INT DEFAULT 0 NOT NULL CHECK (usage_count >= 0),
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    applicable_products JSON,
    applicable_categories JSON,
    excluded_products JSON,
    user_restrictions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL,
    INDEX idx_coupons_code (code),
    INDEX idx_coupons_campaign (campaign_id),
    INDEX idx_coupons_active (is_active, valid_from, valid_until),
    INDEX idx_coupons_usage (usage_count, usage_limit),
    CHECK (valid_from < valid_until),
    CHECK (usage_count <= usage_limit)
) ENGINE=InnoDB COMMENT='Discount coupons linked to campaigns';

-- Campaign usage tracking
CREATE TABLE campaign_usage (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    campaign_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    order_id CHAR(36),
    discount_amount JSON NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata JSON DEFAULT ('{}'),
    
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    INDEX idx_campaign_usage_campaign (campaign_id),
    INDEX idx_campaign_usage_customer (customer_id),
    INDEX idx_campaign_usage_order (order_id),
    INDEX idx_campaign_usage_applied_at (applied_at),
    UNIQUE KEY unique_campaign_order (campaign_id, order_id)
) ENGINE=InnoDB COMMENT='Campaign usage tracking for analytics';

-- Campaign audit trail
CREATE TABLE campaign_audit (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    campaign_id CHAR(36),
    customer_id CHAR(36),
    action ENUM('applied', 'excluded', 'conflict_resolved', 'budget_exceeded', 'usage_limit_reached') NOT NULL,
    details JSON DEFAULT ('{}') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    session_id CHAR(36),
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL,
    INDEX idx_campaign_audit_campaign (campaign_id),
    INDEX idx_campaign_audit_customer (customer_id),
    INDEX idx_campaign_audit_action (action),
    INDEX idx_campaign_audit_timestamp (timestamp)
) ENGINE=InnoDB COMMENT='Audit trail for campaign-related actions';

-- Coupon pools for bulk generation
CREATE TABLE coupon_pools (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    campaign_id CHAR(36) NOT NULL,
    pool_name VARCHAR(100) NOT NULL,
    total_coupons INT NOT NULL CHECK (total_coupons > 0),
    used_coupons INT DEFAULT 0 NOT NULL CHECK (used_coupons >= 0 AND used_coupons <= total_coupons),
    template JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    INDEX idx_coupon_pools_campaign (campaign_id)
) ENGINE=InnoDB COMMENT='Bulk coupon generation and management';

-- =====================================================
-- PRICING AND COMMISSION TABLES
-- =====================================================

-- Dynamic pricing quotes
CREATE TABLE pricing_quotes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    customer_id CHAR(36) NOT NULL,
    seller_id CHAR(36) NOT NULL,
    quote_hash VARCHAR(64) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0),
    tax_amount DECIMAL(12,2) NOT NULL CHECK (tax_amount >= 0),
    delivery_fee DECIMAL(12,2) NOT NULL CHECK (delivery_fee >= 0),
    small_basket_fee DECIMAL(12,2) DEFAULT 0 NOT NULL CHECK (small_basket_fee >= 0),
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    currency CHAR(3) DEFAULT 'TRY' NOT NULL,
    commission_breakdown JSON NOT NULL,
    pricing_breakdown JSON NOT NULL,
    applied_rules JSON NOT NULL,
    feature_flags JSON,
    region VARCHAR(100),
    valid_until TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    INDEX idx_pricing_quotes_hash (quote_hash, valid_until),
    INDEX idx_pricing_quotes_customer (customer_id, created_at)
) ENGINE=InnoDB COMMENT='Dynamic pricing calculations with breakdown';

-- Commission rates configuration
CREATE TABLE commission_rates (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    category_id CHAR(36),
    seller_id CHAR(36),
    logistics_provider VARCHAR(100),
    commission_type ENUM('PERCENTAGE', 'FLAT', 'TIERED') NOT NULL,
    rate DECIMAL(10,4) NOT NULL CHECK (rate >= 0),
    min_amount DECIMAL(12,2) CHECK (min_amount >= 0),
    max_amount DECIMAL(12,2) CHECK (max_amount >= 0),
    currency CHAR(3) DEFAULT 'TRY' NOT NULL,
    region VARCHAR(100),
    effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    effective_to TIMESTAMP CHECK (effective_to IS NULL OR effective_to > effective_from),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    priority INT DEFAULT 100 NOT NULL CHECK (priority >= 1 AND priority <= 1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    INDEX idx_commission_rates_lookup (category_id, seller_id, logistics_provider, region, effective_from, effective_to),
    INDEX idx_commission_rates_effective (effective_from, effective_to),
    INDEX idx_commission_rates_priority (priority DESC),
    CHECK (max_amount IS NULL OR min_amount IS NULL OR max_amount >= min_amount)
) ENGINE=InnoDB COMMENT='Commission rate configuration by category/seller';

-- Pricing rules engine
CREATE TABLE pricing_rules (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    type ENUM('DELIVERY_FEE', 'SMALL_BASKET', 'COMMISSION', 'REGIONAL_FEE', 'EXPRESS_FEE') NOT NULL,
    configuration JSON NOT NULL,
    region VARCHAR(100),
    effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    effective_to TIMESTAMP CHECK (effective_to IS NULL OR effective_to > effective_from),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    version INT DEFAULT 1 NOT NULL,
    created_by CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    INDEX idx_pricing_rules_type_region (type, region, effective_from, effective_to),
    INDEX idx_pricing_rules_version (name, version DESC)
) ENGINE=InnoDB COMMENT='Pricing rules engine for dynamic calculations';

-- Feature flags for A/B testing
CREATE TABLE feature_flags (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    flag_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type ENUM('BOOLEAN', 'STRING', 'NUMBER', 'PERCENTAGE') NOT NULL,
    value JSON NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    rollout JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    INDEX idx_feature_flags_key (flag_key)
) ENGINE=InnoDB COMMENT='Feature flags for A/B testing and rollouts';

-- Commission analytics
CREATE TABLE commission_analytics (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    category_id CHAR(36),
    seller_id CHAR(36),
    region VARCHAR(100),
    total_commission DECIMAL(12,2) DEFAULT 0 NOT NULL,
    transaction_count INT DEFAULT 0 NOT NULL,
    average_rate DECIMAL(10,4) DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    INDEX idx_commission_analytics_period (period_start, period_end, category_id, seller_id, region)
) ENGINE=InnoDB COMMENT='Commission analytics and reporting data';

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
    (TIMESTAMPDIFF(SECOND, cl.timestamp, NOW()) < 300) AS location_fresh,
    (c.status = 'ACTIVE' AND c.is_online = TRUE AND 
     TIMESTAMPDIFF(SECOND, cl.timestamp, NOW()) < 300) AS is_available
FROM couriers c
LEFT JOIN (
    SELECT 
        courier_id,
        latitude, 
        longitude, 
        timestamp,
        ROW_NUMBER() OVER (PARTITION BY courier_id ORDER BY timestamp DESC) as rn
    FROM courier_locations
) cl ON c.id = cl.courier_id AND cl.rn = 1;

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Assignment status change logging trigger
DELIMITER $$

CREATE TRIGGER log_assignment_status_changes 
    AFTER UPDATE ON assignments 
    FOR EACH ROW 
BEGIN
    IF OLD.status != NEW.status THEN
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
            NULL,
            NULL,
            JSON_OBJECT(
                'changed_at', NOW(),
                'old_status', OLD.status,
                'new_status', NEW.status
            )
        );
    END IF;
END$$

DELIMITER ;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Procedure to get available couriers for a location
DELIMITER $$

CREATE PROCEDURE GetAvailableCouriers(
    IN target_lat DOUBLE,
    IN target_lng DOUBLE,
    IN max_distance_km DOUBLE
)
BEGIN
    SELECT 
        c.id,
        c.first_name,
        c.last_name,
        c.vehicle_type,
        c.rating,
        c.completed_orders,
        csa.center_lat,
        csa.center_lng,
        csa.radius_km,
        ST_Distance_Sphere(
            POINT(target_lng, target_lat),
            POINT(csa.center_lng, csa.center_lat)
        ) / 1000 AS distance_km
    FROM couriers c
    JOIN courier_service_areas csa ON c.id = csa.courier_id
    WHERE c.status = 'ACTIVE'
      AND c.is_online = TRUE
      AND csa.is_active = TRUE
      AND ST_Distance_Sphere(
          POINT(target_lng, target_lat),
          POINT(csa.center_lng, csa.center_lat)
      ) / 1000 <= LEAST(csa.radius_km, max_distance_km)
    ORDER BY distance_km ASC, c.rating DESC
    LIMIT 10;
END$$

DELIMITER ;

-- Procedure to calculate delivery fee
DELIMITER $$

CREATE PROCEDURE CalculateDeliveryFee(
    IN distance_km DOUBLE,
    IN is_express BOOLEAN,
    IN order_amount DECIMAL(12,2),
    OUT delivery_fee DECIMAL(12,2)
)
BEGIN
    DECLARE base_fee DECIMAL(12,2) DEFAULT 500; -- 5 TL base fee
    DECLARE per_km_fee DECIMAL(12,2) DEFAULT 100; -- 1 TL per km
    DECLARE express_multiplier DECIMAL(3,2) DEFAULT 1.5;
    DECLARE small_basket_threshold DECIMAL(12,2) DEFAULT 2500; -- 25 TL
    DECLARE small_basket_fee DECIMAL(12,2) DEFAULT 300; -- 3 TL
    
    -- Calculate base delivery fee
    SET delivery_fee = base_fee + (distance_km * per_km_fee);
    
    -- Apply express multiplier
    IF is_express THEN
        SET delivery_fee = delivery_fee * express_multiplier;
    END IF;
    
    -- Add small basket fee
    IF order_amount < small_basket_threshold THEN
        SET delivery_fee = delivery_fee + small_basket_fee;
    END IF;
    
    -- Cap maximum fee
    IF delivery_fee > 2000 THEN
        SET delivery_fee = 2000;
    END IF;
END$$

DELIMITER ;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to validate campaign rules
DELIMITER $$

CREATE FUNCTION validate_campaign_rules(rules JSON)
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE is_valid BOOLEAN DEFAULT TRUE;
    
    -- Basic validation for campaign rules structure
    IF JSON_TYPE(rules) != 'ARRAY' THEN
        SET is_valid = FALSE;
    END IF;
    
    RETURN is_valid;
END$$

DELIMITER ;

-- =====================================================
-- SAMPLE DATA VERIFICATION
-- =====================================================

-- Create a procedure to verify data integrity
DELIMITER $$

CREATE PROCEDURE VerifyDataIntegrity()
BEGIN
    DECLARE user_count INT;
    DECLARE product_count INT;
    DECLARE courier_count INT;
    DECLARE campaign_count INT;
    
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO product_count FROM products;
    SELECT COUNT(*) INTO courier_count FROM couriers;
    SELECT COUNT(*) INTO campaign_count FROM campaigns;
    
    SELECT 
        'Data Verification Results' AS status,
        user_count AS users,
        product_count AS products,
        courier_count AS couriers,
        campaign_count AS campaigns;
        
    -- Check for orphaned records
    SELECT 
        'Orphaned Records Check' AS check_type,
        (SELECT COUNT(*) FROM product_variants WHERE product_id NOT IN (SELECT id FROM products)) AS orphaned_variants,
        (SELECT COUNT(*) FROM product_media WHERE product_id NOT IN (SELECT id FROM products)) AS orphaned_media,
        (SELECT COUNT(*) FROM courier_service_areas WHERE courier_id NOT IN (SELECT id FROM couriers)) AS orphaned_service_areas;
END$$

DELIMITER ;

-- =====================================================
-- PERFORMANCE OPTIMIZATION
-- =====================================================

-- Optimize MySQL settings for the application
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL innodb_log_file_size = 268435456; -- 256MB
SET GLOBAL innodb_flush_log_at_trx_commit = 2;
SET GLOBAL query_cache_size = 67108864; -- 64MB
SET GLOBAL query_cache_type = 1;

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

-- Add table comments for documentation
ALTER TABLE users COMMENT = 'Central user management table supporting multiple roles (customer, seller, courier, admin)';
ALTER TABLE refresh_tokens COMMENT = 'JWT refresh tokens for secure authentication with automatic expiration';
ALTER TABLE password_reset_tokens COMMENT = 'Temporary tokens for secure password reset functionality';
ALTER TABLE categories COMMENT = 'Hierarchical product categories supporting unlimited nesting levels';
ALTER TABLE products COMMENT = 'Comprehensive product catalog with pricing, inventory, and metadata';
ALTER TABLE product_variants COMMENT = 'Product variations for different sizes, colors, and configurations';
ALTER TABLE product_media COMMENT = 'Product images and videos with CDN integration support';
ALTER TABLE seller_products COMMENT = 'Seller-specific product configurations, pricing, and inventory';
ALTER TABLE couriers COMMENT = 'Courier profiles with vehicle information and performance metrics';
ALTER TABLE courier_service_areas COMMENT = 'Geographic service boundaries for courier coverage areas';
ALTER TABLE courier_working_hours COMMENT = 'Courier availability schedules with day/time restrictions';
ALTER TABLE courier_locations COMMENT = 'Real-time GPS location tracking for active couriers';
ALTER TABLE assignments COMMENT = 'Order-to-courier assignments with delivery tracking';
ALTER TABLE assignment_history COMMENT = 'Complete audit trail for assignment status changes';
ALTER TABLE campaigns COMMENT = 'Marketing campaigns with rule engine and budget tracking';
ALTER TABLE coupons COMMENT = 'Discount coupons with usage limits and targeting rules';
ALTER TABLE campaign_usage COMMENT = 'Campaign application tracking for analytics and reporting';
ALTER TABLE campaign_audit COMMENT = 'Detailed audit log for all campaign-related activities';
ALTER TABLE coupon_pools COMMENT = 'Bulk coupon generation and management system';
ALTER TABLE pricing_quotes COMMENT = 'Dynamic pricing calculations with detailed breakdowns';
ALTER TABLE commission_rates COMMENT = 'Configurable commission rates by category, seller, and region';
ALTER TABLE pricing_rules COMMENT = 'Rule engine for dynamic pricing calculations';
ALTER TABLE feature_flags COMMENT = 'Feature toggles for A/B testing and gradual rollouts';
ALTER TABLE commission_analytics COMMENT = 'Commission analytics and reporting aggregations';