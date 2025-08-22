
-- User Management Service Tables
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_by BIGINT,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10),
    country VARCHAR(100) DEFAULT 'Turkey',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT false,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product Catalog Service Tables
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id BIGINT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE brands (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    is_active BOOLEAN DEFAULT true,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    category_id BIGINT NOT NULL,
    brand_id BIGINT,
    vendor_id BIGINT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    compare_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    weight DECIMAL(8, 3),
    dimensions JSONB,
    images JSONB,
    attributes JSONB,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vendor Management Service Tables
CREATE TABLE vendors (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_slug VARCHAR(255) UNIQUE NOT NULL,
    tax_number VARCHAR(50),
    trade_registry_number VARCHAR(50),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    website_url TEXT,
    logo_url TEXT,
    banner_url TEXT,
    description TEXT,
    address JSONB NOT NULL,
    bank_account_info JSONB,
    commission_rate DECIMAL(5, 2) DEFAULT 15.00,
    status VARCHAR(20) DEFAULT 'pending',
    is_active BOOLEAN DEFAULT true,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_sales DECIMAL(12, 2) DEFAULT 0.00,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vendor_categories (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Processing Service Tables
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    vendor_id BIGINT,
    order_type VARCHAR(20) NOT NULL, -- 'marketplace', 'food', 'market'
    status VARCHAR(20) DEFAULT 'pending',
    payment_status VARCHAR(20) DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    shipping_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    notes TEXT,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT,
    food_item_id BIGINT,
    market_item_id BIGINT,
    name VARCHAR(500) NOT NULL,
    sku VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    attributes JSONB,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_provider VARCHAR(50),
    transaction_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    status VARCHAR(20) DEFAULT 'pending',
    gateway_response JSONB,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Logistics Service Tables
CREATE TABLE couriers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    license_plate VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    is_available BOOLEAN DEFAULT true,
    current_location JSONB,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_deliveries INTEGER DEFAULT 0,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE deliveries (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    courier_id BIGINT,
    pickup_address JSONB NOT NULL,
    delivery_address JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'assigned',
    estimated_pickup_time TIMESTAMP WITH TIME ZONE,
    actual_pickup_time TIMESTAMP WITH TIME ZONE,
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    distance_km DECIMAL(8, 2),
    delivery_fee DECIMAL(8, 2),
    tracking_updates JSONB,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Food Service Tables
CREATE TABLE restaurants (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    cuisine_types JSONB,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address JSONB NOT NULL,
    delivery_zones JSONB,
    min_order_amount DECIMAL(8, 2) DEFAULT 0.00,
    delivery_fee DECIMAL(8, 2) DEFAULT 0.00,
    delivery_time_min INTEGER DEFAULT 30,
    delivery_time_max INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    is_open BOOLEAN DEFAULT false,
    working_hours JSONB,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    images JSONB,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_categories (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_items (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(8, 2) NOT NULL,
    ingredients JSONB,
    allergens JSONB,
    nutritional_info JSONB,
    images JSONB,
    is_available BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    preparation_time INTEGER DEFAULT 15,
    sort_order INTEGER DEFAULT 0,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quick Market Service Tables
CREATE TABLE market_stores (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'supermarket', 'dark_store', 'pharmacy'
    address JSONB NOT NULL,
    delivery_zones JSONB,
    min_order_amount DECIMAL(8, 2) DEFAULT 0.00,
    delivery_fee DECIMAL(8, 2) DEFAULT 0.00,
    delivery_promise_minutes INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    is_24_hours BOOLEAN DEFAULT false,
    working_hours JSONB,
    phone VARCHAR(20),
    manager_name VARCHAR(255),
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE market_products (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    barcode VARCHAR(100),
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    price DECIMAL(8, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- 'piece', 'kg', 'liter'
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 5,
    is_available BOOLEAN DEFAULT true,
    images JSONB,
    attributes JSONB,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Configuration Tables
CREATE TABLE system_settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    type VARCHAR(50) DEFAULT 'string',
    is_public BOOLEAN DEFAULT false,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Tables
CREATE TABLE analytics_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    user_id BIGINT,
    session_id VARCHAR(255),
    properties JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_vendor ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_deliveries_courier ON deliveries(courier_id);
CREATE INDEX idx_deliveries_order ON deliveries(order_id);
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_market_products_store ON market_products(store_id);

-- Insert sample data for roles
INSERT INTO roles (name, description, permissions) VALUES
('super_admin', 'Super Administrator with full access', '{"all": true}'),
('admin', 'Platform Administrator', '{"users": ["read", "write"], "products": ["read", "write"], "orders": ["read", "write"]}'),
('vendor_manager', 'Vendor Management', '{"vendors": ["read", "write"], "products": ["read"]}'),
('customer_service', 'Customer Service Representative', '{"users": ["read"], "orders": ["read", "write"]}'),
('logistics_manager', 'Logistics and Delivery Manager', '{"deliveries": ["read", "write"], "couriers": ["read", "write"]}');

-- Insert sample admin users
INSERT INTO users (email, password_hash, first_name, last_name, phone, is_active, is_verified) VALUES
('admin@cebeuygun.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq5S/kS', 'Admin', 'User', '+905551234567', true, true),
('manager@cebeuygun.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq5S/kS', 'Platform', 'Manager', '+905551234568', true, true),
('vendor.manager@cebeuygun.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq5S/kS', 'Vendor', 'Manager', '+905551234569', true, true),
('support@cebeuygun.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq5S/kS', 'Customer', 'Support', '+905551234570', true, true),
('logistics@cebeuygun.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq5S/kS', 'Logistics', 'Manager', '+905551234571', true, true);

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES
(1, 1, 1), -- Super admin
(2, 2, 1), -- Admin
(3, 3, 1), -- Vendor manager
(4, 4, 1), -- Customer service
(5, 5, 1); -- Logistics manager

-- Insert sample categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Elektronik', 'elektronik', 'Telefon, bilgisayar, elektronik ürünler', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'),
('Moda', 'moda', 'Giyim, ayakkabı, aksesuar', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'),
('Ev & Yaşam', 'ev-yasam', 'Ev dekorasyonu, mobilya, beyaz eşya', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'),
('Spor & Outdoor', 'spor-outdoor', 'Spor malzemeleri, outdoor ürünler', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'),
('Kitap & Hobi', 'kitap-hobi', 'Kitaplar, oyuncaklar, hobi malzemeleri', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'),
('Yiyecek & İçecek', 'yiyecek-icecek', 'Gıda ürünleri, içecekler', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'),
('Sağlık & Kişisel Bakım', 'saglik-kisisel-bakim', 'Sağlık ürünleri, kozmetik', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400');

-- Insert sample brands
INSERT INTO brands (name, slug, description, logo_url) VALUES
('Apple', 'apple', 'Premium teknoloji ürünleri', 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200'),
('Samsung', 'samsung', 'Elektronik ve teknoloji', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200'),
('Nike', 'nike', 'Spor giyim ve ayakkabı', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'),
('Adidas', 'adidas', 'Spor malzemeleri', 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=200'),
('Zara', 'zara', 'Fast fashion giyim', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200');

-- Insert sample system settings
INSERT INTO system_settings (key, value, description, type, is_public) VALUES
('platform_name', 'Cebeuygun.com', 'Platform adı', 'string', true),
('default_currency', 'TRY', 'Varsayılan para birimi', 'string', true),
('min_order_amount', '50.00', 'Minimum sipariş tutarı', 'decimal', true),
('free_shipping_threshold', '150.00', 'Ücretsiz kargo limiti', 'decimal', true),
('platform_commission_rate', '15.00', 'Platform komisyon oranı (%)', 'decimal', false),
('max_delivery_distance_km', '25', 'Maksimum teslimat mesafesi (km)', 'integer', false),
('quick_delivery_promise_minutes', '30', 'Hızlı teslimat vaadi (dakika)', 'integer', true),
('customer_service_phone', '+908502220000', 'Müşteri hizmetleri telefonu', 'string', true);

-- Insert sample market stores
INSERT INTO market_stores (name, type, address, delivery_zones, min_order_amount, delivery_fee, delivery_promise_minutes, is_active, is_24_hours, working_hours, phone, manager_name) VALUES
('Cebeuygun Hızlı Market Kadıköy', 'dark_store', '{"address": "Kadıköy Merkez", "city": "İstanbul", "district": "Kadıköy"}', '["Kadıköy", "Üsküdar", "Ataşehir"]', 25.00, 4.99, 30, true, false, '{"monday": "08:00-22:00", "sunday": "09:00-21:00"}', '+902161234567', 'Ahmet Yılmaz'),
('Cebeuygun Express Beşiktaş', 'dark_store', '{"address": "Beşiktaş Merkez", "city": "İstanbul", "district": "Beşiktaş"}', '["Beşiktaş", "Şişli", "Sarıyer"]', 25.00, 4.99, 30, true, true, '{"all_day": "24/7"}', '+902122345678', 'Fatma Demir'),
('Cebeuygun Market Ankara Çankaya', 'supermarket', '{"address": "Çankaya Merkez", "city": "Ankara", "district": "Çankaya"}', '["Çankaya", "Yenimahalle", "Keçiören"]', 30.00, 6.99, 45, true, false, '{"monday": "07:00-23:00", "sunday": "08:00-22:00"}', '+903123456789', 'Mehmet Kaya');

-- Kampanya ve kupon yönetimi tablosu
CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed_amount', 'free_shipping'
    value NUMERIC(10,2) NOT NULL,
    min_order_amount NUMERIC(10,2) DEFAULT 0.00,
    max_discount_amount NUMERIC(10,2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    user_usage_limit INTEGER DEFAULT 1,
    applicable_categories JSONB,
    applicable_products JSONB,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by BIGINT,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ürün onay süreci tablosu
CREATE TABLE product_approvals (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    vendor_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by BIGINT,
    rejection_reason TEXT,
    admin_notes TEXT,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Satıcı performans metrikleri tablosu
CREATE TABLE vendor_performance (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    completed_orders INTEGER DEFAULT 0,
    cancelled_orders INTEGER DEFAULT 0,
    returned_orders INTEGER DEFAULT 0,
    total_revenue NUMERIC(12,2) DEFAULT 0.00,
    avg_delivery_time INTEGER DEFAULT 0,
    customer_satisfaction NUMERIC(3,2) DEFAULT 0.00,
    return_rate NUMERIC(5,2) DEFAULT 0.00,
    on_time_delivery_rate NUMERIC(5,2) DEFAULT 0.00,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Kurye kazanç hesaplamaları tablosu
CREATE TABLE courier_earnings (
    id BIGSERIAL PRIMARY KEY,
    courier_id BIGINT NOT NULL,
    delivery_id BIGINT NOT NULL,
    base_fee NUMERIC(8,2) NOT NULL,
    distance_fee NUMERIC(8,2) DEFAULT 0.00,
    time_bonus NUMERIC(8,2) DEFAULT 0.00,
    tip_amount NUMERIC(8,2) DEFAULT 0.00,
    total_earning NUMERIC(8,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
    payment_date TIMESTAMP WITH TIME ZONE,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Flash sale kampanyaları tablosu
CREATE TABLE flash_sales (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    product_ids JSONB NOT NULL,
    discount_percentage NUMERIC(5,2) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    max_quantity INTEGER,
    sold_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by BIGINT,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sadakat programı puanları tablosu
CREATE TABLE loyalty_points (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_id BIGINT,
    points_earned INTEGER DEFAULT 0,
    points_spent INTEGER DEFAULT 0,
    transaction_type VARCHAR(20) NOT NULL, -- 'earned', 'spent', 'expired'
    description TEXT,
    expiry_date TIMESTAMP WITH TIME ZONE,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Satıcı uyarı sistemi tablosu
CREATE TABLE vendor_warnings (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    warning_type VARCHAR(50) NOT NULL, -- 'late_delivery', 'poor_quality', 'policy_violation'
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    action_taken VARCHAR(100), -- 'warning', 'commission_increase', 'temporary_suspension'
    is_resolved BOOLEAN DEFAULT false,
    issued_by BIGINT NOT NULL,
    resolved_by BIGINT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- İade yönetimi tablosu
CREATE TABLE refunds (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    order_item_id BIGINT,
    user_id BIGINT NOT NULL,
    vendor_id BIGINT NOT NULL,
    refund_amount NUMERIC(10,2) NOT NULL,
    refund_reason VARCHAR(100) NOT NULL,
    refund_type VARCHAR(20) NOT NULL, -- 'full', 'partial'
    status VARCHAR(20) DEFAULT 'requested', -- 'requested', 'approved', 'rejected', 'processed'
    admin_notes TEXT,
    processed_by BIGINT,
    processed_at TIMESTAMP WITH TIME ZONE,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Kupon kullanım geçmişi tablosu
CREATE TABLE coupon_usage (
    id BIGSERIAL PRIMARY KEY,
    coupon_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    discount_amount NUMERIC(10,2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mevcut products tablosuna onay durumu alanı ekleme
ALTER TABLE products ADD COLUMN approval_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE products ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE products ADD COLUMN approved_by BIGINT;

-- Mevcut vendors tablosuna performans alanları ekleme
ALTER TABLE vendors ADD COLUMN warning_count INTEGER DEFAULT 0;
ALTER TABLE vendors ADD COLUMN suspension_count INTEGER DEFAULT 0;
ALTER TABLE vendors ADD COLUMN last_warning_date TIMESTAMP WITH TIME ZONE;

-- Mevcut couriers tablosuna onay durumu ekleme
ALTER TABLE couriers ADD COLUMN approval_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE couriers ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE couriers ADD COLUMN approved_by BIGINT;
ALTER TABLE couriers ADD COLUMN documents JSONB;

-- İndeksler ekleme
CREATE INDEX idx_product_approvals_product ON product_approvals(product_id);
CREATE INDEX idx_product_approvals_vendor ON product_approvals(vendor_id);
CREATE INDEX idx_product_approvals_status ON product_approvals(status);
CREATE INDEX idx_vendor_performance_vendor ON vendor_performance(vendor_id);
CREATE INDEX idx_courier_earnings_courier ON courier_earnings(courier_id);
CREATE INDEX idx_courier_earnings_delivery ON courier_earnings(delivery_id);
CREATE INDEX idx_loyalty_points_user ON loyalty_points(user_id);
CREATE INDEX idx_vendor_warnings_vendor ON vendor_warnings(vendor_id);
CREATE INDEX idx_refunds_order ON refunds(order_id);
CREATE INDEX idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user ON coupon_usage(user_id);

-- Örnek veri ekleme
INSERT INTO coupons (code, name, description, type, value, min_order_amount, usage_limit, start_date, end_date, created_by) VALUES
('HOSGELDIN10', 'Hoşgeldin İndirimi', 'Yeni üyelere özel %10 indirim', 'percentage', 10.00, 50.00, 1000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 1),
('KARGO0', 'Ücretsiz Kargo', '100 TL üzeri siparişlerde ücretsiz kargo', 'free_shipping', 0.00, 100.00, 5000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '60 days', 1),
('FLASH50', 'Flash Sale %50', 'Seçili ürünlerde %50 indirim', 'percentage', 50.00, 0.00, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '7 days', 1),
('YAZ25', 'Yaz İndirimi', 'Yaz ürünlerinde 25 TL indirim', 'fixed_amount', 25.00, 100.00, 2000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '90 days', 1),
('SADIK15', 'Sadık Müşteri', 'Sadık müşterilere özel %15 indirim', 'percentage', 15.00, 200.00, 500, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '45 days', 1);

INSERT INTO flash_sales (name, description, product_ids, discount_percentage, start_time, end_time, max_quantity, created_by) VALUES
('Elektronik Flash Sale', 'Elektronik ürünlerde büyük indirim', '[1,2,3,4,5]', 40.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '24 hours', 100, 1),
('Moda Çılgınlığı', 'Moda ürünlerinde flash sale', '[6,7,8,9,10]', 60.00, CURRENT_TIMESTAMP + INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '2 days', 200, 1),
('Ev & Yaşam', 'Ev eşyalarında özel fiyatlar', '[11,12,13,14,15]', 35.00, CURRENT_TIMESTAMP + INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '3 days', 150, 1),
('Spor Ürünleri', 'Spor malzemelerinde indirim', '[16,17,18,19,20]', 45.00, CURRENT_TIMESTAMP + INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '4 days', 80, 1),
('Kitap Festivali', 'Tüm kitaplarda büyük indirim', '[21,22,23,24,25]', 30.00, CURRENT_TIMESTAMP + INTERVAL '4 days', CURRENT_TIMESTAMP + INTERVAL '7 days', 300, 1);

INSERT INTO vendor_warnings (vendor_id, warning_type, severity, title, description, action_taken, issued_by) VALUES
(1, 'late_delivery', 'medium', 'Geç Teslimat Uyarısı', 'Son 7 günde 3 geç teslimat gerçekleşti', 'warning', 1),
(2, 'poor_quality', 'high', 'Ürün Kalitesi Şikayeti', 'Müşterilerden kalite şikayetleri alındı', 'commission_increase', 1),
(3, 'policy_violation', 'low', 'Politika İhlali', 'Ürün açıklamalarında eksiklik tespit edildi', 'warning', 1),
(4, 'late_delivery', 'critical', 'Kritik Teslimat Sorunu', 'Sürekli geç teslimat nedeniyle müşteri şikayetleri', 'temporary_suspension', 1),
(5, 'poor_quality', 'medium', 'Kalite Kontrol Uyarısı', 'Ürün kalite standartlarına uygunluk sorunu', 'warning', 1);

INSERT INTO loyalty_points (user_id, order_id, points_earned, transaction_type, description) VALUES
(1, 1, 50, 'earned', '500 TL alışveriş için kazanılan puan'),
(2, 2, 75, 'earned', '750 TL alışveriş için kazanılan puan'),
(3, 3, 30, 'earned', '300 TL alışveriş için kazanılan puan'),
(1, NULL, -25, 'spent', 'İndirim kuponu için harcanan puan'),
(4, 4, 100, 'earned', '1000 TL alışveriş için kazanılan puan'),
(5, 5, 40, 'earned', '400 TL alışveriş için kazanılan puan'),
(2, NULL, -50, 'spent', 'Ücretsiz kargo için harcanan puan'),
(6, 6, 60, 'earned', '600 TL alışveriş için kazanılan puan');

INSERT INTO courier_earnings (courier_id, delivery_id, base_fee, distance_fee, time_bonus, total_earning, payment_status) VALUES
(1, 1, 15.00, 5.50, 2.00, 22.50, 'paid'),
(2, 2, 15.00, 8.00, 0.00, 23.00, 'pending'),
(3, 3, 15.00, 3.25, 5.00, 23.25, 'paid'),
(1, 4, 15.00, 12.00, 0.00, 27.00, 'pending'),
(4, 5, 15.00, 6.75, 3.00, 24.75, 'paid'),
(2, 6, 15.00, 4.50, 2.50, 22.00, 'pending'),
(5, 7, 15.00, 9.25, 0.00, 24.25, 'paid'),
(3, 8, 15.00, 7.00, 4.00, 26.00, 'pending');

INSERT INTO refunds (order_id, user_id, vendor_id, refund_amount, refund_reason, refund_type, status) VALUES
(1, 1, 1, 150.00, 'Ürün hasarlı geldi', 'full', 'approved'),
(2, 2, 2, 75.50, 'Yanlış ürün gönderildi', 'partial', 'processed'),
(3, 3, 3, 200.00, 'Ürün açıklamaya uygun değil', 'full', 'requested'),
(4, 4, 1, 50.00, 'Geç teslimat', 'partial', 'approved'),
(5, 5, 4, 300.00, 'Ürün çalışmıyor', 'full', 'processed'),
(6, 6, 2, 25.00, 'Eksik parça', 'partial', 'requested'),
(7, 1, 3, 180.00, 'Müşteri memnun kalmadı', 'full', 'approved');

-- Müşteri-Satıcı mesajlaşma sistemi
CREATE TABLE vendor_messages (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    order_id BIGINT,
    product_id BIGINT,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sender_type VARCHAR(20) NOT NULL, -- 'vendor' veya 'customer'
    is_read BOOLEAN DEFAULT FALSE,
    parent_message_id BIGINT,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_messages_vendor ON vendor_messages(vendor_id);
CREATE INDEX idx_vendor_messages_user ON vendor_messages(user_id);
CREATE INDEX idx_vendor_messages_order ON vendor_messages(order_id);

-- Mesaj şablonları
CREATE TABLE message_templates (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'siparis', 'kargo', 'iade', 'genel'
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_message_templates_vendor ON message_templates(vendor_id);

-- Ürün yorumları ve değerlendirmeler
CREATE TABLE product_reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT FALSE,
    vendor_reply TEXT,
    vendor_reply_date TIMESTAMP WITH TIME ZONE,
    helpful_count INTEGER DEFAULT 0,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_user ON product_reviews(user_id);

-- Toplu ürün işlemleri geçmişi
CREATE TABLE bulk_product_operations (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    operation_type VARCHAR(50) NOT NULL, -- 'import', 'export', 'bulk_update'
    file_name VARCHAR(255),
    file_path TEXT,
    total_records INTEGER DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    failed_records INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'processing', -- 'processing', 'completed', 'failed'
    error_log JSONB,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bulk_operations_vendor ON bulk_product_operations(vendor_id);

-- Stok uyarı ayarları
CREATE TABLE stock_alert_settings (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    product_id BIGINT,
    alert_type VARCHAR(50) NOT NULL, -- 'low_stock', 'out_of_stock', 'overstocked'
    threshold_value INTEGER NOT NULL,
    notification_method VARCHAR(50) NOT NULL, -- 'email', 'sms', 'in_app'
    is_active BOOLEAN DEFAULT TRUE,
    last_alert_sent TIMESTAMP WITH TIME ZONE,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_alerts_vendor ON stock_alert_settings(vendor_id);
CREATE INDEX idx_stock_alerts_product ON stock_alert_settings(product_id);

-- Dinamik fiyatlandırma ve rakip takibi
CREATE TABLE competitor_pricing (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    vendor_id BIGINT NOT NULL,
    competitor_name VARCHAR(255) NOT NULL,
    competitor_price NUMERIC(10,2) NOT NULL,
    competitor_url TEXT,
    price_difference NUMERIC(10,2),
    price_difference_percentage NUMERIC(5,2),
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_competitor_pricing_product ON competitor_pricing(product_id);
CREATE INDEX idx_competitor_pricing_vendor ON competitor_pricing(vendor_id);

-- Otomatik fiyat kuralları
CREATE TABLE pricing_rules (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL, -- 'competitor_based', 'margin_based', 'campaign_based'
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pricing_rules_vendor ON pricing_rules(vendor_id);

-- Satıcı analitik verileri
CREATE TABLE vendor_analytics (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    date DATE NOT NULL,
    total_views INTEGER DEFAULT 0,
    product_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    conversion_rate NUMERIC(5,2) DEFAULT 0.00,
    avg_session_duration INTEGER DEFAULT 0,
    bounce_rate NUMERIC(5,2) DEFAULT 0.00,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_analytics_vendor ON vendor_analytics(vendor_id);
CREATE INDEX idx_vendor_analytics_date ON vendor_analytics(date);

-- Kargo firmaları ve ayarları
CREATE TABLE shipping_providers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    api_endpoint TEXT,
    tracking_url_template TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    supported_services JSONB,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Satıcı kargo ayarları
CREATE TABLE vendor_shipping_settings (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    provider_id BIGINT NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    api_credentials JSONB,
    default_service_type VARCHAR(100),
    free_shipping_threshold NUMERIC(10,2) DEFAULT 0.00,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_shipping_vendor ON vendor_shipping_settings(vendor_id);

-- Örnek veriler
INSERT INTO message_templates (vendor_id, title, content, category) VALUES
(1, 'Sipariş Onayı', 'Siparişiniz alınmıştır. Sipariş numaranız: {order_number}. En kısa sürede hazırlanacaktır.', 'siparis'),
(1, 'Kargo Bildirimi', 'Siparişiniz kargoya verilmiştir. Takip numarası: {tracking_number}', 'kargo'),
(1, 'İade Onayı', 'İade talebiniz onaylanmıştır. Ürünü kargo ile gönderebilirsiniz.', 'iade'),
(1, 'Teşekkür Mesajı', 'Alışverişiniz için teşekkür ederiz. Memnuniyetiniz bizim için önemlidir.', 'genel'),
(1, 'Stok Bildirimi', 'Merak ettiğiniz ürün tekrar stoklarımızda! Hemen sipariş verebilirsiniz.', 'genel');

INSERT INTO product_reviews (product_id, user_id, order_id, rating, title, comment, is_approved) VALUES
(1, 2, 1, 5, 'Mükemmel ürün', 'Çok memnun kaldım, herkese tavsiye ederim.', true),
(1, 3, 2, 4, 'İyi kalite', 'Fiyat performans açısından başarılı.', true),
(2, 2, 3, 5, 'Hızlı teslimat', 'Ürün kaliteli, teslimat çok hızlıydı.', true),
(3, 4, 4, 3, 'Ortalama', 'Beklediğimden biraz farklıydı ama kullanılabilir.', true),
(4, 5, 5, 5, 'Süper!', 'Tam aradığım ürün, çok beğendim.', true);

INSERT INTO stock_alert_settings (vendor_id, product_id, alert_type, threshold_value, notification_method) VALUES
(1, 1, 'low_stock', 10, 'email'),
(1, 2, 'low_stock', 5, 'sms'),
(1, 3, 'out_of_stock', 0, 'in_app'),
(1, 4, 'low_stock', 15, 'email'),
(1, 5, 'low_stock', 8, 'sms');

INSERT INTO competitor_pricing (product_id, vendor_id, competitor_name, competitor_price, price_difference) VALUES
(1, 1, 'Rakip Mağaza A', 299.99, -50.00),
(2, 1, 'Rakip Mağaza B', 199.99, 0.00),
(3, 1, 'Rakip Mağaza A', 89.99, 10.00),
(4, 1, 'Rakip Mağaza C', 449.99, -100.00),
(5, 1, 'Rakip Mağaza B', 79.99, 20.00);

INSERT INTO vendor_analytics (vendor_id, date, total_views, product_views, unique_visitors, conversion_rate) VALUES
(1, CURRENT_DATE - INTERVAL '7 days', 1250, 890, 456, 3.2),
(1, CURRENT_DATE - INTERVAL '6 days', 1180, 820, 423, 2.8),
(1, CURRENT_DATE - INTERVAL '5 days', 1350, 950, 487, 3.5),
(1, CURRENT_DATE - INTERVAL '4 days', 1420, 1020, 512, 3.8),
(1, CURRENT_DATE - INTERVAL '3 days', 1680, 1180, 598, 4.2),
(1, CURRENT_DATE - INTERVAL '2 days', 1890, 1340, 645, 4.5),
(1, CURRENT_DATE - INTERVAL '1 day', 2100, 1480, 712, 4.8);

INSERT INTO shipping_providers (name, code, tracking_url_template, supported_services) VALUES
('MNG Kargo', 'MNG', 'https://www.mngkargo.com.tr/track/{tracking_number}', '["standart", "express", "next_day"]'),
('Yurtiçi Kargo', 'YURTICI', 'https://www.yurticikargo.com/tr/online-services/cargo-tracking/{tracking_number}', '["standart", "express"]'),
('Aras Kargo', 'ARAS', 'https://www.araskargo.com.tr/takip/{tracking_number}', '["standart", "express", "same_day"]'),
('PTT Kargo', 'PTT', 'https://www.ptt.gov.tr/takip/{tracking_number}', '["standart"]'),
('Sürat Kargo', 'SURAT', 'https://www.suratkargo.com.tr/takip/{tracking_number}', '["standart", "express"]');

INSERT INTO vendor_shipping_settings (vendor_id, provider_id, is_enabled, default_service_type, free_shipping_threshold) VALUES
(1, 1, true, 'standart', 150.00),
(1, 2, true, 'express', 200.00),
(1, 3, false, 'standart', 100.00);

INSERT INTO bulk_product_operations (vendor_id, operation_type, file_name, total_records, processed_records, status) VALUES
(1, 'import', 'urunler_2024_01.xlsx', 150, 150, 'completed'),
(1, 'bulk_update', 'fiyat_guncelleme.xlsx', 75, 75, 'completed'),
(1, 'export', 'tum_urunler.xlsx', 200, 200, 'completed');

-- OAuth sosyal medya hesap bağlantıları
CREATE TABLE user_social_accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    provider VARCHAR(50) NOT NULL, -- 'google', 'apple', 'facebook'
    provider_user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_user_social_accounts_user ON user_social_accounts(user_id);
CREATE INDEX idx_user_social_accounts_provider ON user_social_accounts(provider);

-- 2FA doğrulama kodları
CREATE TABLE user_verification_codes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    code VARCHAR(10) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'sms', 'email', '2fa'
    purpose VARCHAR(50) NOT NULL, -- 'registration', 'login', 'password_reset'
    is_used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_codes_user ON user_verification_codes(user_id);
CREATE INDEX idx_verification_codes_code ON user_verification_codes(code);

-- Favori ürünler
CREATE TABLE user_favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT,
    restaurant_id BIGINT,
    market_store_id BIGINT,
    favorite_type VARCHAR(20) NOT NULL, -- 'product', 'restaurant', 'store'
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_product ON user_favorites(product_id);
CREATE INDEX idx_user_favorites_restaurant ON user_favorites(restaurant_id);

-- Alışveriş sepeti
CREATE TABLE shopping_cart (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_id VARCHAR(255), -- Misafir kullanıcılar için
    product_id BIGINT,
    menu_item_id BIGINT,
    market_product_id BIGINT,
    quantity INTEGER NOT NULL DEFAULT 1,
    price NUMERIC(10,2) NOT NULL,
    attributes JSONB, -- Seçilen özellikler (renk, boyut vs)
    vendor_id BIGINT NOT NULL,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shopping_cart_user ON shopping_cart(user_id);
CREATE INDEX idx_shopping_cart_session ON shopping_cart(session_id);
CREATE INDEX idx_shopping_cart_vendor ON shopping_cart(vendor_id);

-- Kayıtlı ödeme kartları (tokenize edilmiş)
CREATE TABLE user_payment_cards (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    card_token VARCHAR(255) NOT NULL, -- Tokenize edilmiş kart bilgisi
    card_last_four VARCHAR(4) NOT NULL,
    card_brand VARCHAR(20) NOT NULL, -- 'visa', 'mastercard', 'amex'
    card_holder_name VARCHAR(255) NOT NULL,
    expiry_month INTEGER NOT NULL,
    expiry_year INTEGER NOT NULL,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_payment_cards_user ON user_payment_cards(user_id);

-- Kullanıcı arama geçmişi ve davranış takibi
CREATE TABLE user_search_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    session_id VARCHAR(255),
    search_query VARCHAR(500) NOT NULL,
    search_type VARCHAR(20) DEFAULT 'text', -- 'text', 'barcode', 'image'
    results_count INTEGER DEFAULT 0,
    clicked_product_id BIGINT,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_search_history_user ON user_search_history(user_id);
CREATE INDEX idx_user_search_history_query ON user_search_history(search_query);

-- Kullanıcı davranış takibi (öneriler için)
CREATE TABLE user_behavior_tracking (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    session_id VARCHAR(255),
    action_type VARCHAR(50) NOT NULL, -- 'view', 'add_to_cart', 'purchase', 'favorite'
    product_id BIGINT,
    category_id BIGINT,
    vendor_id BIGINT,
    duration_seconds INTEGER,
    metadata JSONB,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_behavior_user ON user_behavior_tracking(user_id);
CREATE INDEX idx_user_behavior_action ON user_behavior_tracking(action_type);
CREATE INDEX idx_user_behavior_product ON user_behavior_tracking(product_id);

-- Push bildirim cihaz token'ları
CREATE TABLE user_device_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    device_token VARCHAR(500) NOT NULL,
    device_type VARCHAR(20) NOT NULL, -- 'ios', 'android', 'web'
    device_info JSONB,
    is_active BOOLEAN DEFAULT true,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_device_tokens_user ON user_device_tokens(user_id);
CREATE INDEX idx_user_device_tokens_token ON user_device_tokens(device_token);

-- Kupon kullanım geçmişi genişletme (mevcut tabloya ek)
ALTER TABLE coupon_usage ADD COLUMN session_id VARCHAR(255);

-- Test verileri
INSERT INTO user_social_accounts (user_id, provider, provider_user_id, email) VALUES
(1, 'google', 'google_123456789', 'ahmet@gmail.com'),
(2, 'apple', 'apple_987654321', 'mehmet@icloud.com'),
(3, 'google', 'google_456789123', 'ayse@gmail.com'),
(4, 'facebook', 'fb_789123456', 'fatma@facebook.com'),
(5, 'google', 'google_321654987', 'ali@gmail.com');

INSERT INTO user_verification_codes (user_id, code, type, purpose, expires_at) VALUES
(1, '123456', 'sms', 'login', CURRENT_TIMESTAMP + INTERVAL '5 minutes'),
(2, '789012', 'email', 'registration', CURRENT_TIMESTAMP + INTERVAL '10 minutes'),
(3, '345678', 'sms', '2fa', CURRENT_TIMESTAMP + INTERVAL '3 minutes'),
(4, '901234', 'email', 'password_reset', CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
(5, '567890', 'sms', 'login', CURRENT_TIMESTAMP + INTERVAL '5 minutes');

INSERT INTO user_favorites (user_id, product_id, favorite_type) VALUES
(1, 1, 'product'),
(1, 3, 'product'),
(2, 2, 'product'),
(2, 4, 'product'),
(3, 1, 'product'),
(3, 5, 'product'),
(4, 2, 'product'),
(5, 3, 'product');

INSERT INTO shopping_cart (user_id, product_id, quantity, price, vendor_id) VALUES
(1, 1, 2, 1299.99, 1),
(1, 3, 1, 89.99, 2),
(2, 2, 1, 2499.99, 1),
(3, 4, 3, 45.99, 3),
(4, 5, 1, 199.99, 2),
(5, 1, 1, 1299.99, 1);

INSERT INTO user_payment_cards (user_id, card_token, card_last_four, card_brand, card_holder_name, expiry_month, expiry_year) VALUES
(1, 'tok_1234567890abcdef', '1234', 'visa', 'AHMET YILMAZ', 12, 2027),
(2, 'tok_abcdef1234567890', '5678', 'mastercard', 'MEHMET KAYA', 8, 2026),
(3, 'tok_9876543210fedcba', '9012', 'visa', 'AYŞE DEMİR', 3, 2028),
(4, 'tok_fedcba0987654321', '3456', 'amex', 'FATMA ÖZ', 11, 2025),
(5, 'tok_1357924680abcdef', '7890', 'mastercard', 'ALİ ÇELIK', 6, 2027);

INSERT INTO user_search_history (user_id, search_query, results_count, clicked_product_id) VALUES
(1, 'iphone', 15, 1),
(1, 'laptop', 23, 2),
(2, 'ayakkabı', 45, 3),
(3, 'kitap', 67, 4),
(4, 'telefon', 34, 1),
(5, 'elektronik', 89, 2),
(1, 'samsung', 28, 5),
(2, 'spor ayakkabı', 19, 3);

INSERT INTO user_behavior_tracking (user_id, action_type, product_id, category_id, vendor_id, duration_seconds) VALUES
(1, 'view', 1, 1, 1, 45),
(1, 'add_to_cart', 1, 1, 1, 5),
(2, 'view', 2, 1, 1, 67),
(3, 'favorite', 3, 2, 2, 3),
(4, 'view', 4, 3, 3, 23),
(5, 'purchase', 5, 2, 2, 120),
(1, 'view', 3, 2, 2, 34),
(2, 'add_to_cart', 4, 3, 3, 8);

INSERT INTO user_device_tokens (user_id, device_token, device_type, device_info) VALUES
(1, 'fcm_token_1234567890abcdef', 'android', '{"model": "Samsung Galaxy S21", "os_version": "12"}'),
(2, 'apns_token_abcdef1234567890', 'ios', '{"model": "iPhone 13", "os_version": "15.6"}'),
(3, 'web_token_9876543210fedcba', 'web', '{"browser": "Chrome", "version": "104.0"}'),
(4, 'fcm_token_fedcba0987654321', 'android', '{"model": "Xiaomi Mi 11", "os_version": "11"}'),
(5, 'apns_token_1357924680abcdef', 'ios', '{"model": "iPhone 12", "os_version": "15.4"}');
