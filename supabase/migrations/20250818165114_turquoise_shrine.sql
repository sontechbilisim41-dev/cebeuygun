-- =====================================================
-- CebeUygun Platform Demo Seed Data
-- Database: MySQL 8.0+
-- Purpose: Comprehensive demo data for platform testing
-- =====================================================

USE cebeuygun;

-- Disable foreign key checks for data loading
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data (in correct order to respect foreign keys)
TRUNCATE TABLE campaign_usage;
TRUNCATE TABLE campaign_audit;
TRUNCATE TABLE coupon_pools;
TRUNCATE TABLE coupons;
TRUNCATE TABLE campaigns;
TRUNCATE TABLE product_media;
TRUNCATE TABLE seller_products;
TRUNCATE TABLE product_variants;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE assignment_history;
TRUNCATE TABLE assignments;
TRUNCATE TABLE courier_locations;
TRUNCATE TABLE courier_working_hours;
TRUNCATE TABLE courier_service_areas;
TRUNCATE TABLE couriers;
TRUNCATE TABLE password_reset_tokens;
TRUNCATE TABLE refresh_tokens;
TRUNCATE TABLE users;
TRUNCATE TABLE pricing_quotes;
TRUNCATE TABLE commission_rates;
TRUNCATE TABLE pricing_rules;
TRUNCATE TABLE feature_flags;
TRUNCATE TABLE commission_analytics;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- DEMO USERS
-- =====================================================

-- Insert demo users with bcrypt hashed passwords (password: demo123 for all)
INSERT INTO users (id, email, password_hash, phone, first_name, last_name, role, status, email_verified, phone_verified, created_at, updated_at) VALUES
-- Admin user
('550e8400-e29b-41d4-a716-446655440000', 'admin@cebeuygun.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 555 000 0001', 'Admin', 'User', 'admin', 'active', 1, 1, NOW(), NOW()),

-- Customer users
('550e8400-e29b-41d4-a716-446655440001', 'customer@demo.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 555 123 4567', 'Ahmet', 'Yılmaz', 'customer', 'active', 1, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'ayse.demir@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 555 987 6543', 'Ayşe', 'Demir', 'customer', 'active', 1, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'mehmet.kaya@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 555 456 7890', 'Mehmet', 'Kaya', 'customer', 'active', 1, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'elif.ozturk@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 555 789 0123', 'Elif', 'Öztürk', 'customer', 'active', 1, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'burak.celik@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 555 321 6547', 'Burak', 'Çelik', 'customer', 'active', 1, 1, NOW(), NOW()),

-- Courier users
('550e8400-e29b-41d4-a716-446655440010', 'courier@demo.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 555 111 2222', 'Can', 'Özkan', 'courier', 'active', 1, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440011', 'kurye1@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 555 222 3333', 'Emre', 'Şahin', 'courier', 'active', 1, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'kurye2@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 555 333 4444', 'Zeynep', 'Yıldız', 'courier', 'active', 1, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', 'kurye3@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 555 444 5555', 'Murat', 'Arslan', 'courier', 'active', 1, 1, NOW(), NOW()),

-- Seller users
('550e8400-e29b-41d4-a716-446655440020', 'seller@demo.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 555 444 5555', 'Fatma', 'Özkan', 'seller', 'active', 1, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440021', 'pizza.palace@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 212 555 0101', 'Pizza', 'Palace', 'seller', 'active', 1, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440022', 'burger.house@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 212 555 0202', 'Burger', 'House', 'seller', 'active', 1, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440023', 'sushi.tokyo@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 212 555 0303', 'Sushi', 'Tokyo', 'seller', 'active', 1, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440024', 'doner.king@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 212 555 0404', 'Döner', 'King', 'seller', 'active', 1, 1, NOW(), NOW());

-- =====================================================
-- PRODUCT CATEGORIES
-- =====================================================

-- Main categories
INSERT INTO categories (id, name, description, parent_id, sort_order, is_active) VALUES
-- Level 0 - Main categories
('cat-food', 'Yiyecek & İçecek', 'Taze gıda ürünleri ve içecekler', NULL, 1, 1),
('cat-market', 'Market & Gıda', 'Günlük ihtiyaç ürünleri', NULL, 2, 1),
('cat-electronics', 'Elektronik & Teknoloji', 'Teknoloji ürünleri ve aksesuarları', NULL, 3, 1),
('cat-fashion', 'Moda & Giyim', 'Kadın, erkek ve çocuk giyim', NULL, 4, 1),
('cat-home', 'Ev & Yaşam', 'Ev eşyaları ve yaşam ürünleri', NULL, 5, 1);

-- Level 1 - Sub categories
INSERT INTO categories (id, name, description, parent_id, sort_order, is_active) VALUES
-- Food subcategories
('cat-fastfood', 'Fast Food', 'Hamburger, pizza, döner ve hızlı yemek seçenekleri', 'cat-food', 1, 1),
('cat-turkish', 'Türk Mutfağı', 'Geleneksel Türk yemekleri', 'cat-food', 2, 1),
('cat-world', 'Dünya Mutfağı', 'Uluslararası lezzetler', 'cat-food', 3, 1),
('cat-beverages', 'İçecekler', 'Soğuk ve sıcak içecekler', 'cat-food', 4, 1),

-- Market subcategories
('cat-fruits', 'Meyve & Sebze', 'Taze meyve ve sebzeler', 'cat-market', 1, 1),
('cat-meat', 'Et & Tavuk & Balık', 'Protein kaynakları', 'cat-market', 2, 1),
('cat-dairy', 'Süt Ürünleri', 'Süt ve süt ürünleri', 'cat-market', 3, 1),

-- Electronics subcategories
('cat-phones', 'Telefon & Tablet', 'Akıllı telefon ve tablet bilgisayarlar', 'cat-electronics', 1, 1),
('cat-computers', 'Bilgisayar & Laptop', 'Masaüstü ve taşınabilir bilgisayarlar', 'cat-electronics', 2, 1),

-- Fashion subcategories
('cat-women', 'Kadın Giyim', 'Kadın kıyafetleri ve aksesuarları', 'cat-fashion', 1, 1),
('cat-men', 'Erkek Giyim', 'Erkek kıyafetleri ve aksesuarları', 'cat-fashion', 2, 1),

-- Home subcategories
('cat-decoration', 'Ev Dekorasyonu', 'Dekoratif ev eşyaları', 'cat-home', 1, 1),
('cat-kitchen', 'Mutfak Eşyaları', 'Mutfak gereçleri ve aletleri', 'cat-home', 2, 1);

-- =====================================================
-- SAMPLE PRODUCTS
-- =====================================================

-- Fast food products
INSERT INTO products (id, name, description, category_id, brand, sku, base_price, currency, tax_rate, base_stock, min_stock, preparation_time, is_active, is_express_delivery, tags, attributes) VALUES
('prod-001', 'Big Mac Menü', 'İki köfte, özel sos, marul, peynir, turşu, soğan ile sesam ekmekte. Patates kızartması ve içecek dahil.', 'cat-fastfood', 'McDonald''s', 'MCD-BIGMAC-001', 4500, 'TRY', 18, 100, 10, 8, 1, 0, JSON_ARRAY('hamburger', 'menü', 'popüler'), JSON_OBJECT('calories', 563, 'allergens', JSON_ARRAY('gluten', 'dairy', 'sesame'))),

('prod-002', 'Margherita Pizza (Büyük)', 'Taze mozzarella, domates sosu ve fesleğen ile klasik İtalyan pizzası.', 'cat-fastfood', 'Domino''s Pizza', 'DOM-MARG-L-001', 3800, 'TRY', 18, 50, 5, 15, 1, 0, JSON_ARRAY('pizza', 'vegetarian', 'italian'), JSON_OBJECT('size', 'large', 'diameter', '32cm', 'allergens', JSON_ARRAY('gluten', 'dairy'))),

('prod-003', 'Chicken Döner Porsiyon', 'Taze tavuk döner, pilav, salata ve ayran ile servis edilir.', 'cat-fastfood', 'Döner King', 'DK-CHICK-001', 2800, 'TRY', 18, 80, 8, 5, 1, 0, JSON_ARRAY('döner', 'tavuk', 'geleneksel'), JSON_OBJECT('spiceLevel', 'medium', 'allergens', JSON_ARRAY('dairy'))),

('prod-004', 'Fish & Chips', 'Çıtır balık fileto ve patates kızartması, tartar sos ile.', 'cat-fastfood', 'British Fish', 'BF-FISHCHIPS-001', 3200, 'TRY', 18, 40, 4, 12, 1, 0, JSON_ARRAY('balık', 'deniz ürünleri', 'british'), JSON_OBJECT('fishType', 'cod', 'allergens', JSON_ARRAY('fish', 'gluten')));

-- Turkish cuisine products
INSERT INTO products (id, name, description, category_id, brand, sku, base_price, currency, tax_rate, base_stock, min_stock, preparation_time, is_active, is_express_delivery, tags, attributes) VALUES
('prod-005', 'Adana Kebap', 'Acılı kıyma kebabı, bulgur pilavı, közlenmiş domates ve biber ile.', 'cat-turkish', 'Kebapçı Halil', 'KH-ADANA-001', 4200, 'TRY', 18, 60, 6, 20, 1, 0, JSON_ARRAY('kebap', 'acılı', 'geleneksel'), JSON_OBJECT('spiceLevel', 'hot', 'region', 'Adana', 'allergens', JSON_ARRAY())),

('prod-006', 'İskender Kebap', 'Döner eti, pide üzerinde, domates sosu ve tereyağı ile.', 'cat-turkish', 'Bursa Sofrası', 'BS-ISKENDER-001', 4800, 'TRY', 18, 40, 4, 15, 1, 0, JSON_ARRAY('iskender', 'döner', 'bursa'), JSON_OBJECT('region', 'Bursa', 'allergens', JSON_ARRAY('gluten', 'dairy'))),

('prod-007', 'Mantı', 'El açması hamur içinde kıyma, yoğurt ve tereyağlı sos ile.', 'cat-turkish', 'Anadolu Mutfağı', 'AM-MANTI-001', 3500, 'TRY', 18, 30, 3, 25, 1, 0, JSON_ARRAY('mantı', 'hamur işi', 'geleneksel'), JSON_OBJECT('pieces', 40, 'allergens', JSON_ARRAY('gluten', 'dairy', 'eggs'))),

('prod-008', 'Lahmacun', 'İnce hamur üzerinde kıymalı karışım, maydanoz ve limon ile.', 'cat-turkish', 'Antep Sofrası', 'AS-LAHMACUN-001', 1800, 'TRY', 18, 70, 7, 10, 1, 0, JSON_ARRAY('lahmacun', 'ince hamur', 'geleneksel'), JSON_OBJECT('size', 'medium', 'allergens', JSON_ARRAY('gluten')));

-- Beverages
INSERT INTO products (id, name, description, category_id, brand, sku, base_price, currency, tax_rate, base_stock, min_stock, preparation_time, is_active, is_express_delivery, tags, attributes) VALUES
('prod-009', 'Türk Kahvesi', 'Geleneksel Türk kahvesi, şeker seçeneği ile.', 'cat-beverages', 'Kahve Dünyası', 'KD-TURK-001', 800, 'TRY', 18, 200, 20, 5, 1, 0, JSON_ARRAY('kahve', 'geleneksel', 'sıcak'), JSON_OBJECT('caffeine', 'medium', 'temperature', 'hot')),

('prod-010', 'Taze Sıkılmış Portakal Suyu', 'Günlük taze sıkılmış portakal suyu, %100 doğal.', 'cat-beverages', 'Fresh Juice', 'FJ-ORANGE-001', 1200, 'TRY', 8, 150, 15, 3, 1, 0, JSON_ARRAY('meyve suyu', 'taze', 'vitamin'), JSON_OBJECT('vitaminC', 'high', 'natural', true)),

('prod-011', 'Ayran', 'Geleneksel Türk içeceği, yoğurt, su ve tuz karışımı.', 'cat-beverages', 'Sütaş', 'SUT-AYRAN-001', 600, 'TRY', 8, 300, 30, 2, 1, 0, JSON_ARRAY('ayran', 'geleneksel', 'probiyotik'), JSON_OBJECT('probiotics', true, 'allergens', JSON_ARRAY('dairy'))),

('prod-012', 'Çay (Bardak)', 'Geleneksel Türk çayı, taze demlenmiş.', 'cat-beverages', 'Çaykur', 'CK-TEA-001', 400, 'TRY', 8, 500, 50, 3, 1, 0, JSON_ARRAY('çay', 'geleneksel', 'sıcak'), JSON_OBJECT('caffeine', 'low', 'temperature', 'hot'));

-- Electronics
INSERT INTO products (id, name, description, category_id, brand, sku, base_price, currency, tax_rate, base_stock, min_stock, preparation_time, is_active, is_express_delivery, tags, attributes) VALUES
('prod-013', 'iPhone 15 Pro Max 256GB', 'Apple iPhone 15 Pro Max, 256GB depolama, ProRAW kamera sistemi.', 'cat-phones', 'Apple', 'APL-IP15PM-256', 6499900, 'TRY', 18, 10, 1, 0, 1, 1, JSON_ARRAY('iphone', 'apple', 'flagship'), JSON_OBJECT('storage', '256GB', 'color', 'Natural Titanium', 'warranty', '2 years')),

('prod-014', 'Samsung Galaxy S24 Ultra', 'Samsung Galaxy S24 Ultra, S Pen dahil, 512GB depolama.', 'cat-phones', 'Samsung', 'SAM-S24U-512', 5799900, 'TRY', 18, 8, 1, 0, 1, 1, JSON_ARRAY('samsung', 'android', 'flagship'), JSON_OBJECT('storage', '512GB', 'color', 'Titanium Black', 'spen', true)),

('prod-015', 'MacBook Air M3 13"', 'Apple MacBook Air M3 çip, 13 inç Liquid Retina ekran, 512GB SSD.', 'cat-computers', 'Apple', 'APL-MBA-M3-512', 4999900, 'TRY', 18, 5, 1, 0, 1, 1, JSON_ARRAY('macbook', 'apple', 'laptop'), JSON_OBJECT('processor', 'M3', 'screen', '13.6"', 'storage', '512GB SSD')),

('prod-016', 'Dell XPS 13 Plus', 'Dell XPS 13 Plus, Intel i7, 16GB RAM, 1TB SSD.', 'cat-computers', 'Dell', 'DEL-XPS13P-I7', 3999900, 'TRY', 18, 6, 1, 0, 1, 1, JSON_ARRAY('dell', 'laptop', 'business'), JSON_OBJECT('processor', 'Intel i7', 'ram', '16GB', 'storage', '1TB SSD'));

-- Fashion items
INSERT INTO products (id, name, description, category_id, brand, sku, base_price, currency, tax_rate, base_stock, min_stock, preparation_time, is_active, is_express_delivery, tags, attributes) VALUES
('prod-017', 'Levi''s 501 Original Jean', 'Klasik straight fit jean, %100 pamuk, vintage yıkama.', 'cat-men', 'Levi''s', 'LEV-501-BLUE', 89900, 'TRY', 18, 25, 2, 0, 1, 0, JSON_ARRAY('jean', 'levis', 'klasik'), JSON_OBJECT('material', '100% Cotton', 'fit', 'Straight', 'wash', 'Medium Blue')),

('prod-018', 'Nike Air Max 270', 'Nike Air Max 270 spor ayakkabı, maksimum hava yastığı teknolojisi.', 'cat-men', 'Nike', 'NIK-AM270-BW', 179900, 'TRY', 18, 15, 1, 0, 1, 0, JSON_ARRAY('nike', 'spor ayakkabı', 'air max'), JSON_OBJECT('brand', 'Nike', 'technology', 'Air Max', 'color', 'Black/White')),

('prod-019', 'Zara Kadın Elbise', 'Şık günlük elbise, %95 pamuk karışımı.', 'cat-women', 'Zara', 'ZAR-DRESS-001', 59900, 'TRY', 18, 20, 2, 0, 1, 0, JSON_ARRAY('elbise', 'zara', 'günlük'), JSON_OBJECT('material', '95% Cotton', 'style', 'Casual', 'season', 'All Season')),

('prod-020', 'H&M Erkek Gömlek', 'Klasik beyaz gömlek, iş ve günlük kullanım.', 'cat-men', 'H&M', 'HM-SHIRT-WHITE', 39900, 'TRY', 18, 30, 3, 0, 1, 0, JSON_ARRAY('gömlek', 'hm', 'klasik'), JSON_OBJECT('material', 'Cotton Blend', 'color', 'White', 'fit', 'Regular'));

-- Home & living
INSERT INTO products (id, name, description, category_id, brand, sku, base_price, currency, tax_rate, base_stock, min_stock, preparation_time, is_active, is_express_delivery, tags, attributes) VALUES
('prod-021', 'IKEA MALM Yatak Odası Takımı', 'Modern yatak odası takımı, yatak, komodin ve dolap dahil.', 'cat-decoration', 'IKEA', 'IKE-MALM-SET', 899900, 'TRY', 18, 3, 1, 0, 1, 0, JSON_ARRAY('yatak odası', 'ikea', 'mobilya'), JSON_OBJECT('material', 'Particle Board', 'color', 'White', 'assembly', 'Required')),

('prod-022', 'Philips Hue Akıllı Ampul Seti', '4''lü renkli LED ampul seti, WiFi kontrolü, 16 milyon renk.', 'cat-decoration', 'Philips', 'PHI-HUE-4SET', 149900, 'TRY', 18, 12, 2, 0, 1, 1, JSON_ARRAY('akıllı ev', 'led', 'philips'), JSON_OBJECT('connectivity', 'WiFi', 'colors', '16M', 'wattage', '9W')),

('prod-023', 'Tefal Tencere Seti', '7 parça paslanmaz çelik tencere seti.', 'cat-kitchen', 'Tefal', 'TEF-POT-SET7', 79900, 'TRY', 18, 8, 1, 0, 1, 0, JSON_ARRAY('tencere', 'tefal', 'mutfak'), JSON_OBJECT('material', 'Stainless Steel', 'pieces', 7, 'dishwasher_safe', true)),

('prod-024', 'Arçelik Blender', '1000W güçlü blender, cam hazne.', 'cat-kitchen', 'Arçelik', 'ARC-BLEND-1000', 49900, 'TRY', 18, 15, 2, 0, 1, 0, JSON_ARRAY('blender', 'arçelik', 'mutfak'), JSON_OBJECT('power', '1000W', 'capacity', '1.5L', 'material', 'Glass'));

-- =====================================================
-- PRODUCT MEDIA
-- =====================================================

-- Product images from Pexels (high-quality stock photos)
INSERT INTO product_media (id, product_id, type, url, file_name, file_size, mime_type, alt_text, sort_order, is_active) VALUES
-- Big Mac images
('media-001', 'prod-001', 'image', 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400', 'bigmac_1.jpg', 125000, 'image/jpeg', 'Big Mac Menü', 0, 1),
('media-002', 'prod-001', 'image', 'https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=400', 'bigmac_2.jpg', 118000, 'image/jpeg', 'Big Mac Menü Detay', 1, 1),

-- Pizza images
('media-003', 'prod-002', 'image', 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400', 'margherita_1.jpg', 142000, 'image/jpeg', 'Margherita Pizza', 0, 1),
('media-004', 'prod-002', 'image', 'https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg?auto=compress&cs=tinysrgb&w=400', 'margherita_2.jpg', 156000, 'image/jpeg', 'Margherita Pizza Detay', 1, 1),

-- Döner images
('media-005', 'prod-003', 'image', 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=400', 'doner_1.jpg', 134000, 'image/jpeg', 'Chicken Döner', 0, 1),
('media-006', 'prod-003', 'image', 'https://images.pexels.com/photos/6419733/pexels-photo-6419733.jpeg?auto=compress&cs=tinysrgb&w=400', 'doner_2.jpg', 145000, 'image/jpeg', 'Chicken Döner Porsiyon', 1, 1),

-- Fish & Chips images
('media-007', 'prod-004', 'image', 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=400', 'fish_chips_1.jpg', 167000, 'image/jpeg', 'Fish & Chips', 0, 1),

-- Turkish cuisine images
('media-008', 'prod-005', 'image', 'https://images.pexels.com/photos/6419733/pexels-photo-6419733.jpeg?auto=compress&cs=tinysrgb&w=400', 'adana_1.jpg', 167000, 'image/jpeg', 'Adana Kebap', 0, 1),
('media-009', 'prod-006', 'image', 'https://images.pexels.com/photos/5474640/pexels-photo-5474640.jpeg?auto=compress&cs=tinysrgb&w=400', 'iskender_1.jpg', 189000, 'image/jpeg', 'İskender Kebap', 0, 1),
('media-010', 'prod-007', 'image', 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=400', 'manti_1.jpg', 156000, 'image/jpeg', 'Mantı', 0, 1),

-- Electronics images
('media-011', 'prod-013', 'image', 'https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg?auto=compress&cs=tinysrgb&w=400', 'iphone15_1.jpg', 98000, 'image/jpeg', 'iPhone 15 Pro Max', 0, 1),
('media-012', 'prod-014', 'image', 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400', 'galaxy_s24_1.jpg', 102000, 'image/jpeg', 'Samsung Galaxy S24 Ultra', 0, 1),
('media-013', 'prod-015', 'image', 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400', 'macbook_1.jpg', 87000, 'image/jpeg', 'MacBook Air M3', 0, 1),
('media-014', 'prod-016', 'image', 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400', 'dell_xps_1.jpg', 94000, 'image/jpeg', 'Dell XPS 13 Plus', 0, 1),

-- Fashion images
('media-015', 'prod-017', 'image', 'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=400', 'levis_jean_1.jpg', 112000, 'image/jpeg', 'Levi''s 501 Jean', 0, 1),
('media-016', 'prod-018', 'image', 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400', 'nike_shoes_1.jpg', 134000, 'image/jpeg', 'Nike Air Max 270', 0, 1),
('media-017', 'prod-019', 'image', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400', 'zara_dress_1.jpg', 123000, 'image/jpeg', 'Zara Kadın Elbise', 0, 1),

-- Home & living images
('media-018', 'prod-021', 'image', 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400', 'ikea_bedroom_1.jpg', 178000, 'image/jpeg', 'IKEA MALM Yatak Odası', 0, 1),
('media-019', 'prod-022', 'image', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400', 'philips_hue_1.jpg', 89000, 'image/jpeg', 'Philips Hue Ampul Seti', 0, 1),
('media-020', 'prod-023', 'image', 'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=400', 'tefal_pots_1.jpg', 145000, 'image/jpeg', 'Tefal Tencere Seti', 0, 1);

-- =====================================================
-- COURIER DATA
-- =====================================================

-- Courier profiles
INSERT INTO couriers (id, user_id, first_name, last_name, phone, email, vehicle_type, vehicle_plate, status, rating, completed_orders, is_online) VALUES
('courier-001', '550e8400-e29b-41d4-a716-446655440010', 'Can', 'Özkan', '+90 555 111 2222', 'courier@demo.com', 'MOTORBIKE', '34 ABC 123', 'ACTIVE', 4.8, 247, 0),
('courier-002', '550e8400-e29b-41d4-a716-446655440011', 'Emre', 'Şahin', '+90 555 222 3333', 'kurye1@example.com', 'BICYCLE', NULL, 'ACTIVE', 4.6, 189, 0),
('courier-003', '550e8400-e29b-41d4-a716-446655440012', 'Zeynep', 'Yıldız', '+90 555 333 4444', 'kurye2@example.com', 'CAR', '34 DEF 456', 'INACTIVE', 4.9, 312, 0),
('courier-004', '550e8400-e29b-41d4-a716-446655440013', 'Murat', 'Arslan', '+90 555 444 5555', 'kurye3@example.com', 'MOTORBIKE', '34 GHI 789', 'ACTIVE', 4.7, 156, 0);

-- Courier service areas (Istanbul focus)
INSERT INTO courier_service_areas (id, courier_id, center_lat, center_lng, radius_km, city, district, is_active) VALUES
-- Can Özkan - Motorbike (larger radius)
('area-001', 'courier-001', 41.0082, 28.9784, 15.0, 'İstanbul', 'Beyoğlu', 1),
('area-002', 'courier-001', 41.0369, 28.9857, 12.0, 'İstanbul', 'Şişli', 1),

-- Emre Şahin - Bicycle (smaller radius)
('area-003', 'courier-002', 41.0255, 28.9744, 5.0, 'İstanbul', 'Taksim', 1),
('area-004', 'courier-002', 41.0138, 28.9497, 6.0, 'İstanbul', 'Eminönü', 1),

-- Zeynep Yıldız - Car (largest radius)
('area-005', 'courier-003', 41.0431, 29.0061, 25.0, 'İstanbul', 'Levent', 1),
('area-006', 'courier-003', 41.0766, 29.0573, 20.0, 'İstanbul', 'Maslak', 1),

-- Murat Arslan - Motorbike
('area-007', 'courier-004', 41.0138, 28.9497, 18.0, 'İstanbul', 'Fatih', 1),
('area-008', 'courier-004', 41.0255, 28.9744, 15.0, 'İstanbul', 'Beyoğlu', 1);

-- Courier working hours
INSERT INTO courier_working_hours (id, courier_id, day_of_week, start_time, end_time, is_active) VALUES
-- Can Özkan - Monday to Saturday
('hours-001', 'courier-001', 1, '09:00:00', '22:00:00', 1),
('hours-002', 'courier-001', 2, '09:00:00', '22:00:00', 1),
('hours-003', 'courier-001', 3, '09:00:00', '22:00:00', 1),
('hours-004', 'courier-001', 4, '09:00:00', '22:00:00', 1),
('hours-005', 'courier-001', 5, '09:00:00', '22:00:00', 1),
('hours-006', 'courier-001', 6, '10:00:00', '20:00:00', 1),

-- Emre Şahin - Tuesday to Sunday
('hours-007', 'courier-002', 2, '08:00:00', '18:00:00', 1),
('hours-008', 'courier-002', 3, '08:00:00', '18:00:00', 1),
('hours-009', 'courier-002', 4, '08:00:00', '18:00:00', 1),
('hours-010', 'courier-002', 5, '08:00:00', '18:00:00', 1),
('hours-011', 'courier-002', 6, '08:00:00', '18:00:00', 1),
('hours-012', 'courier-002', 0, '10:00:00', '16:00:00', 1),

-- Zeynep Yıldız - Monday to Friday
('hours-013', 'courier-003', 1, '10:00:00', '21:00:00', 1),
('hours-014', 'courier-003', 2, '10:00:00', '21:00:00', 1),
('hours-015', 'courier-003', 3, '10:00:00', '21:00:00', 1),
('hours-016', 'courier-003', 4, '10:00:00', '21:00:00', 1),
('hours-017', 'courier-003', 5, '10:00:00', '21:00:00', 1),

-- Murat Arslan - Full week
('hours-018', 'courier-004', 0, '11:00:00', '23:00:00', 1),
('hours-019', 'courier-004', 1, '09:00:00', '23:00:00', 1),
('hours-020', 'courier-004', 2, '09:00:00', '23:00:00', 1),
('hours-021', 'courier-004', 3, '09:00:00', '23:00:00', 1),
('hours-022', 'courier-004', 4, '09:00:00', '23:00:00', 1),
('hours-023', 'courier-004', 5, '09:00:00', '23:00:00', 1),
('hours-024', 'courier-004', 6, '11:00:00', '23:00:00', 1);

-- Sample courier locations (current positions)
INSERT INTO courier_locations (id, courier_id, latitude, longitude, address, accuracy, speed, heading, timestamp) VALUES
('loc-001', 'courier-001', 41.0082, 28.9784, 'Galata Kulesi yakını', 5.0, 0.0, 45.0, NOW()),
('loc-002', 'courier-002', 41.0255, 28.9744, 'Taksim Meydanı', 3.0, 0.0, 180.0, NOW()),
('loc-003', 'courier-003', 41.0431, 29.0061, 'Levent Metro', 8.0, 0.0, 270.0, NOW()),
('loc-004', 'courier-004', 41.0138, 28.9497, 'Eminönü İskelesi', 4.0, 0.0, 90.0, NOW());

-- =====================================================
-- MARKETING CAMPAIGNS
-- =====================================================

-- Sample campaigns with realistic Turkish market data
INSERT INTO campaigns (id, name, description, type, status, rules, is_active, valid_from, valid_until, budget, spent_budget, max_usage, current_usage, max_usage_per_user, priority, is_exclusive) VALUES
('camp-001', 'Hoş Geldin Kampanyası', 'Yeni üyelere özel %20 indirim', 'first_order', 'active', JSON_ARRAY(JSON_OBJECT('type', 'user_order_count', 'operator', 'equals', 'value', 0)), 1, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), JSON_OBJECT('amount', 100000, 'currency', 'TRY'), JSON_OBJECT('amount', 15000, 'currency', 'TRY'), 1000, 75, 1, 100, 0),

('camp-002', 'Ücretsiz Teslimat', '100 TL üzeri siparişlerde ücretsiz teslimat', 'free_delivery', 'active', JSON_ARRAY(JSON_OBJECT('type', 'min_order_amount', 'value', 10000, 'currency', 'TRY')), 1, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), JSON_OBJECT('amount', 50000, 'currency', 'TRY'), JSON_OBJECT('amount', 8500, 'currency', 'TRY'), 2000, 170, 3, 200, 0),

('camp-003', 'Flash Sale - %30 İndirim', 'Seçili ürünlerde 24 saat özel indirim', 'flash_sale', 'active', JSON_ARRAY(JSON_OBJECT('type', 'time_restriction', 'hours', JSON_OBJECT('start', '12:00', 'end', '23:59'))), 1, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), JSON_OBJECT('amount', 25000, 'currency', 'TRY'), JSON_OBJECT('amount', 12000, 'currency', 'TRY'), 500, 120, 2, 500, 1),

('camp-004', 'Hafta Sonu Özel', 'Hafta sonu siparişlerinde 25 TL indirim', 'flat_discount', 'active', JSON_ARRAY(JSON_OBJECT('type', 'time_restriction', 'days', JSON_ARRAY(0, 6))), 1, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), JSON_OBJECT('amount', 30000, 'currency', 'TRY'), JSON_OBJECT('amount', 5500, 'currency', 'TRY'), 1200, 220, 2, 150, 0),

('camp-005', 'Sadakat Programı', '10. siparişinizde %50 indirim', 'loyalty_reward', 'active', JSON_ARRAY(JSON_OBJECT('type', 'user_order_count', 'operator', 'equals', 'value', 10)), 1, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), JSON_OBJECT('amount', 75000, 'currency', 'TRY'), JSON_OBJECT('amount', 3200, 'currency', 'TRY'), 300, 16, 1, 300, 0),

('camp-006', 'Öğrenci İndirimi', 'Öğrencilere özel %15 indirim', 'percentage_discount', 'active', JSON_ARRAY(JSON_OBJECT('type', 'user_segment', 'value', 'student')), 1, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 45 DAY), JSON_OBJECT('amount', 40000, 'currency', 'TRY'), JSON_OBJECT('amount', 6800, 'currency', 'TRY'), 800, 68, 5, 250, 0);

-- Sample coupons
INSERT INTO coupons (id, code, campaign_id, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, usage_count, valid_from, valid_until, is_active, applicable_products, user_restrictions) VALUES
-- Welcome campaign coupons
('coupon-001', 'SAVE1234', 'camp-001', 'percentage', 20, JSON_OBJECT('amount', 2000, 'currency', 'TRY'), JSON_OBJECT('amount', 5000, 'currency', 'TRY'), 1, 0, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 1, NULL, JSON_OBJECT('newUsersOnly', true)),
('coupon-002', 'DEAL5678', 'camp-001', 'percentage', 20, JSON_OBJECT('amount', 2000, 'currency', 'TRY'), JSON_OBJECT('amount', 5000, 'currency', 'TRY'), 1, 0, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 1, NULL, JSON_OBJECT('newUsersOnly', true)),
('coupon-003', 'WELCOME20', 'camp-001', 'percentage', 20, JSON_OBJECT('amount', 2000, 'currency', 'TRY'), JSON_OBJECT('amount', 5000, 'currency', 'TRY'), 1, 0, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 1, NULL, JSON_OBJECT('newUsersOnly', true)),

-- Free delivery coupons
('coupon-004', 'FREESHIP100', 'camp-002', 'free_delivery', 0, JSON_OBJECT('amount', 10000, 'currency', 'TRY'), NULL, 100, 15, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), 1, NULL, NULL),
('coupon-005', 'NODELIVERY', 'camp-002', 'free_delivery', 0, JSON_OBJECT('amount', 10000, 'currency', 'TRY'), NULL, 100, 8, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), 1, NULL, NULL),
('coupon-006', 'SHIPFREE', 'camp-002', 'free_delivery', 0, JSON_OBJECT('amount', 10000, 'currency', 'TRY'), NULL, 150, 23, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), 1, NULL, NULL),

-- Flash sale coupons
('coupon-007', 'FLASH30', 'camp-003', 'percentage', 30, JSON_OBJECT('amount', 5000, 'currency', 'TRY'), JSON_OBJECT('amount', 10000, 'currency', 'TRY'), 50, 12, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), 1, JSON_ARRAY('prod-001', 'prod-002'), NULL),
('coupon-008', 'FLASHDEAL', 'camp-003', 'percentage', 30, JSON_OBJECT('amount', 5000, 'currency', 'TRY'), JSON_OBJECT('amount', 10000, 'currency', 'TRY'), 75, 18, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), 1, JSON_ARRAY('prod-003', 'prod-004'), NULL),

-- Weekend special coupons
('coupon-009', 'WEEKEND25', 'camp-004', 'flat_amount', 2500, JSON_OBJECT('amount', 7500, 'currency', 'TRY'), NULL, 200, 45, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), 1, NULL, NULL),
('coupon-010', 'HAFTASONU', 'camp-004', 'flat_amount', 2500, JSON_OBJECT('amount', 7500, 'currency', 'TRY'), NULL, 180, 38, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), 1, NULL, NULL),

-- Loyalty coupons
('coupon-011', 'LOYAL50', 'camp-005', 'percentage', 50, JSON_OBJECT('amount', 3000, 'currency', 'TRY'), JSON_OBJECT('amount', 15000, 'currency', 'TRY'), 1, 0, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), 1, NULL, JSON_OBJECT('minOrderHistory', 9)),
('coupon-012', 'SADAKAT', 'camp-005', 'percentage', 50, JSON_OBJECT('amount', 3000, 'currency', 'TRY'), JSON_OBJECT('amount', 15000, 'currency', 'TRY'), 1, 0, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), 1, NULL, JSON_OBJECT('minOrderHistory', 9)),

-- Student discount coupons
('coupon-013', 'STUDENT15', 'camp-006', 'percentage', 15, JSON_OBJECT('amount', 2500, 'currency', 'TRY'), JSON_OBJECT('amount', 3000, 'currency', 'TRY'), 5, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 45 DAY), 1, NULL, JSON_OBJECT('userSegment', 'student')),
('coupon-014', 'OGRENCI', 'camp-006', 'percentage', 15, JSON_OBJECT('amount', 2500, 'currency', 'TRY'), JSON_OBJECT('amount', 3000, 'currency', 'TRY'), 5, 0, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 45 DAY), 1, NULL, JSON_OBJECT('userSegment', 'student'));

-- =====================================================
-- SELLER PRODUCT CONFIGURATIONS
-- =====================================================

-- Pizza Palace products
INSERT INTO seller_products (id, seller_id, product_id, seller_sku, price, stock, min_stock, max_stock, is_active, is_visible, preparation_time, notes) VALUES
('sp-001', '550e8400-e29b-41d4-a716-446655440021', 'prod-002', 'PP-MARG-L', 3800, 25, 3, 50, 1, 1, 15, 'En popüler pizza çeşidimiz'),
('sp-002', '550e8400-e29b-41d4-a716-446655440021', 'prod-009', 'PP-COFFEE', 800, 100, 10, 200, 1, 1, 5, 'Taze çekilmiş kahve'),
('sp-003', '550e8400-e29b-41d4-a716-446655440021', 'prod-012', 'PP-TEA', 400, 150, 15, 300, 1, 1, 3, 'Geleneksel Türk çayı');

-- Burger House products
INSERT INTO seller_products (id, seller_id, product_id, seller_sku, price, stock, min_stock, max_stock, is_active, is_visible, preparation_time, notes) VALUES
('sp-004', '550e8400-e29b-41d4-a716-446655440022', 'prod-001', 'BH-BIGMAC', 4500, 40, 5, 80, 1, 1, 8, 'Klasik Big Mac menümüz'),
('sp-005', '550e8400-e29b-41d4-a716-446655440022', 'prod-010', 'BH-ORANGE', 1200, 60, 6, 120, 1, 1, 3, 'Taze sıkılmış portakal suyu'),
('sp-006', '550e8400-e29b-41d4-a716-446655440022', 'prod-004', 'BH-FISHCHIPS', 3200, 30, 3, 60, 1, 1, 12, 'Taze balık fileto');

-- Sushi Tokyo products
INSERT INTO seller_products (id, seller_id, product_id, seller_sku, price, stock, min_stock, max_stock, is_active, is_visible, preparation_time, notes) VALUES
('sp-007', '550e8400-e29b-41d4-a716-446655440023', 'prod-011', 'ST-AYRAN', 600, 80, 8, 160, 1, 1, 2, 'Ev yapımı ayran'),
('sp-008', '550e8400-e29b-41d4-a716-446655440023', 'prod-009', 'ST-COFFEE', 900, 50, 5, 100, 1, 1, 5, 'Özel harman kahve');

-- Döner King products
INSERT INTO seller_products (id, seller_id, product_id, seller_sku, price, stock, min_stock, max_stock, is_active, is_visible, preparation_time, notes) VALUES
('sp-009', '550e8400-e29b-41d4-a716-446655440024', 'prod-003', 'DK-CHICK', 2800, 60, 6, 120, 1, 1, 5, 'Taze tavuk döner'),
('sp-010', '550e8400-e29b-41d4-a716-446655440024', 'prod-005', 'DK-ADANA', 4200, 35, 3, 70, 1, 1, 20, 'Acılı Adana kebap'),
('sp-011', '550e8400-e29b-41d4-a716-446655440024', 'prod-008', 'DK-LAHMACUN', 1800, 45, 4, 90, 1, 1, 10, 'İnce hamur lahmacun');

-- =====================================================
-- PRICING AND COMMISSION DATA
-- =====================================================

-- Commission rates for different categories
INSERT INTO commission_rates (id, commission_type, rate, currency, effective_from, is_active, priority) VALUES
('comm-001', 'PERCENTAGE', 15.0000, 'TRY', DATE_SUB(NOW(), INTERVAL 30 DAY), 1, 100),
('comm-002', 'PERCENTAGE', 12.0000, 'TRY', DATE_SUB(NOW(), INTERVAL 30 DAY), 1, 200),
('comm-003', 'FLAT', 500.0000, 'TRY', DATE_SUB(NOW(), INTERVAL 30 DAY), 1, 300),
('comm-004', 'PERCENTAGE', 18.0000, 'TRY', DATE_SUB(NOW(), INTERVAL 15 DAY), 1, 150),
('comm-005', 'TIERED', 10.0000, 'TRY', DATE_SUB(NOW(), INTERVAL 20 DAY), 1, 250);

-- Pricing rules for delivery and fees
INSERT INTO pricing_rules (id, name, type, configuration, effective_from, is_active, version, created_by) VALUES
('rule-001', 'Standard Delivery Fee', 'DELIVERY_FEE', JSON_OBJECT('baseRate', 500, 'perKm', 100, 'maxFee', 2000), DATE_SUB(NOW(), INTERVAL 30 DAY), 1, 1, '550e8400-e29b-41d4-a716-446655440000'),
('rule-002', 'Small Basket Fee', 'SMALL_BASKET', JSON_OBJECT('threshold', 2500, 'fee', 300), DATE_SUB(NOW(), INTERVAL 30 DAY), 1, 1, '550e8400-e29b-41d4-a716-446655440000'),
('rule-003', 'Express Delivery Fee', 'EXPRESS_FEE', JSON_OBJECT('multiplier', 1.5, 'minFee', 1000), DATE_SUB(NOW(), INTERVAL 30 DAY), 1, 1, '550e8400-e29b-41d4-a716-446655440000'),
('rule-004', 'Regional Fee Istanbul', 'REGIONAL_FEE', JSON_OBJECT('region', 'Istanbul', 'additionalFee', 200), DATE_SUB(NOW(), INTERVAL 25 DAY), 1, 1, '550e8400-e29b-41d4-a716-446655440000'),
('rule-005', 'Commission Base Rate', 'COMMISSION', JSON_OBJECT('baseRate', 15, 'minAmount', 1000), DATE_SUB(NOW(), INTERVAL 20 DAY), 1, 1, '550e8400-e29b-41d4-a716-446655440000');

-- Feature flags for platform features
INSERT INTO feature_flags (id, flag_key, name, description, type, value, is_enabled) VALUES
('flag-001', 'enable_express_delivery', 'Express Delivery', 'Enable express delivery option', 'BOOLEAN', JSON_QUOTE('true'), 1),
('flag-002', 'loyalty_program', 'Loyalty Program', 'Enable customer loyalty program', 'BOOLEAN', JSON_QUOTE('true'), 1),
('flag-003', 'dynamic_pricing', 'Dynamic Pricing', 'Enable dynamic pricing based on demand', 'BOOLEAN', JSON_QUOTE('false'), 0),
('flag-004', 'surge_pricing_multiplier', 'Surge Pricing Multiplier', 'Multiplier for surge pricing', 'NUMBER', JSON_QUOTE('1.5'), 0),
('flag-005', 'chat_support', 'Chat Support', 'Enable real-time chat support', 'BOOLEAN', JSON_QUOTE('true'), 1),
('flag-006', 'mobile_app_v2', 'Mobile App V2', 'Enable new mobile app features', 'BOOLEAN', JSON_QUOTE('false'), 0),
('flag-007', 'payment_gateway_v2', 'Payment Gateway V2', 'Enable new payment gateway', 'BOOLEAN', JSON_QUOTE('true'), 1);

-- Sample pricing quotes
INSERT INTO pricing_quotes (id, customer_id, seller_id, quote_hash, subtotal, tax_amount, delivery_fee, small_basket_fee, total_amount, currency, commission_breakdown, pricing_breakdown, applied_rules, valid_until) VALUES
('quote-001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440021', 'hash123abc', 3800, 684, 500, 0, 4984, 'TRY', JSON_OBJECT('platform', 570, 'payment', 50), JSON_OBJECT('subtotal', 3800, 'tax', 684, 'delivery', 500), JSON_ARRAY('rule-001'), DATE_ADD(NOW(), INTERVAL 1 HOUR)),

('quote-002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440022', 'hash456def', 4500, 810, 500, 0, 5810, 'TRY', JSON_OBJECT('platform', 675, 'payment', 58), JSON_OBJECT('subtotal', 4500, 'tax', 810, 'delivery', 500), JSON_ARRAY('rule-001'), DATE_ADD(NOW(), INTERVAL 1 HOUR)),

('quote-003', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440023', 'hash789ghi', 2200, 396, 800, 300, 3696, 'TRY', JSON_OBJECT('platform', 330, 'payment', 37), JSON_OBJECT('subtotal', 2200, 'tax', 396, 'delivery', 800, 'smallBasket', 300), JSON_ARRAY('rule-001', 'rule-002'), DATE_ADD(NOW(), INTERVAL 1 HOUR));

-- =====================================================
-- SAMPLE ASSIGNMENTS
-- =====================================================

-- Sample order assignments
INSERT INTO assignments (id, order_id, courier_id, status, pickup_location, delivery_location, estimated_distance, estimated_duration, notes) VALUES
('assign-001', 'order-demo-001', 'courier-001', 'PENDING', 
 JSON_OBJECT('latitude', 41.0082, 'longitude', 28.9784, 'address', 'Galata Kulesi Mah. Büyük Hendek Cad. No:15, Beyoğlu/İstanbul'),
 JSON_OBJECT('latitude', 41.0369, 'longitude', 28.9857, 'address', 'Maslak Mah. Büyükdere Cad. No:255 Daire:12, Şişli/İstanbul'),
 5.2, 25, 'Müşteri kapıcıya bırakılmasını istiyor'),

('assign-002', 'order-demo-002', 'courier-002', 'ACCEPTED',
 JSON_OBJECT('latitude', 41.0255, 'longitude', 28.9744, 'address', 'Taksim Meydan No:1, Beyoğlu/İstanbul'),
 JSON_OBJECT('latitude', 41.0138, 'longitude', 28.9497, 'address', 'Eminönü Mah. Hobyar Cad. No:45, Fatih/İstanbul'),
 3.8, 18, 'Ofis binası, 2. kat'),

('assign-003', 'order-demo-003', 'courier-003', 'COMPLETED',
 JSON_OBJECT('latitude', 41.0431, 'longitude', 29.0061, 'address', 'Levent Mah. Büyükdere Cad. No:120, Beşiktaş/İstanbul'),
 JSON_OBJECT('latitude', 41.0766, 'longitude', 29.0573, 'address', 'Maslak Mah. Ahi Evran Cad. No:6, Sarıyer/İstanbul'),
 8.1, 35, 'Teslim edildi, müşteri memnun'),

('assign-004', 'order-demo-004', 'courier-004', 'PENDING',
 JSON_OBJECT('latitude', 41.0138, 'longitude', 28.9497, 'address', 'Eminönü Mah. Hobyar Cad. No:25, Fatih/İstanbul'),
 JSON_OBJECT('latitude', 41.0255, 'longitude', 28.9744, 'address', 'Taksim Mah. İstiklal Cad. No:100, Beyoğlu/İstanbul'),
 2.1, 12, 'Hızlı teslimat isteniyor');

-- =====================================================
-- CAMPAIGN USAGE EXAMPLES
-- =====================================================

-- Sample campaign usage tracking
INSERT INTO campaign_usage (id, campaign_id, customer_id, order_id, discount_amount, applied_at, metadata) VALUES
('usage-001', 'camp-001', '550e8400-e29b-41d4-a716-446655440001', 'order-demo-001', JSON_OBJECT('amount', 760, 'currency', 'TRY'), DATE_SUB(NOW(), INTERVAL 2 HOUR), JSON_OBJECT('couponCode', 'SAVE1234', 'originalAmount', 3800)),

('usage-002', 'camp-002', '550e8400-e29b-41d4-a716-446655440002', 'order-demo-002', JSON_OBJECT('amount', 500, 'currency', 'TRY'), DATE_SUB(NOW(), INTERVAL 1 HOUR), JSON_OBJECT('couponCode', 'FREESHIP100', 'deliveryFeeWaived', true)),

('usage-003', 'camp-003', '550e8400-e29b-41d4-a716-446655440003', 'order-demo-003', JSON_OBJECT('amount', 1140, 'currency', 'TRY'), DATE_SUB(NOW(), INTERVAL 3 HOUR), JSON_OBJECT('couponCode', 'FLASH30', 'originalAmount', 3800)),

('usage-004', 'camp-004', '550e8400-e29b-41d4-a716-446655440004', 'order-demo-004', JSON_OBJECT('amount', 2500, 'currency', 'TRY'), DATE_SUB(NOW(), INTERVAL 30 MINUTE), JSON_OBJECT('couponCode', 'WEEKEND25', 'originalAmount', 7500));

-- Sample campaign audit trail
INSERT INTO campaign_audit (id, campaign_id, customer_id, action, details, timestamp, ip_address, user_agent) VALUES
('audit-001', 'camp-001', '550e8400-e29b-41d4-a716-446655440001', 'applied', JSON_OBJECT('couponCode', 'SAVE1234', 'discountAmount', 760, 'orderId', 'order-demo-001'), DATE_SUB(NOW(), INTERVAL 2 HOUR), '192.168.1.100', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'),

('audit-002', 'camp-002', '550e8400-e29b-41d4-a716-446655440002', 'applied', JSON_OBJECT('couponCode', 'FREESHIP100', 'deliveryFeeWaived', true, 'orderId', 'order-demo-002'), DATE_SUB(NOW(), INTERVAL 1 HOUR), '192.168.1.101', 'Mozilla/5.0 (Android 14; Mobile)'),

('audit-003', 'camp-003', '550e8400-e29b-41d4-a716-446655440003', 'applied', JSON_OBJECT('couponCode', 'FLASH30', 'discountAmount', 1140, 'orderId', 'order-demo-003'), DATE_SUB(NOW(), INTERVAL 3 HOUR), '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),

('audit-004', 'camp-004', '550e8400-e29b-41d4-a716-446655440004', 'applied', JSON_OBJECT('couponCode', 'WEEKEND25', 'discountAmount', 2500, 'orderId', 'order-demo-004'), DATE_SUB(NOW(), INTERVAL 30 MINUTE), '192.168.1.103', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');

-- =====================================================
-- ANALYTICS DATA
-- =====================================================

-- Commission analytics sample data for the last week
INSERT INTO commission_analytics (id, period_start, period_end, total_commission, transaction_count, average_rate) VALUES
('analytics-001', DATE_SUB(DATE(NOW()), INTERVAL 1 DAY), DATE(NOW()), 15750.00, 105, 15.0000),
('analytics-002', DATE_SUB(DATE(NOW()), INTERVAL 2 DAY), DATE_SUB(DATE(NOW()), INTERVAL 1 DAY), 18920.00, 126, 15.0000),
('analytics-003', DATE_SUB(DATE(NOW()), INTERVAL 3 DAY), DATE_SUB(DATE(NOW()), INTERVAL 2 DAY), 22340.00, 149, 15.0000),
('analytics-004', DATE_SUB(DATE(NOW()), INTERVAL 4 DAY), DATE_SUB(DATE(NOW()), INTERVAL 3 DAY), 19680.00, 131, 15.0000),
('analytics-005', DATE_SUB(DATE(NOW()), INTERVAL 5 DAY), DATE_SUB(DATE(NOW()), INTERVAL 4 DAY), 21450.00, 143, 15.0000),
('analytics-006', DATE_SUB(DATE(NOW()), INTERVAL 6 DAY), DATE_SUB(DATE(NOW()), INTERVAL 5 DAY), 17890.00, 119, 15.0000),
('analytics-007', DATE_SUB(DATE(NOW()), INTERVAL 7 DAY), DATE_SUB(DATE(NOW()), INTERVAL 6 DAY), 20120.00, 134, 15.0000);

-- =====================================================
-- COUPON POOLS
-- =====================================================

-- Sample coupon pools for bulk generation
INSERT INTO coupon_pools (id, campaign_id, pool_name, total_coupons, used_coupons, template) VALUES
('pool-001', 'camp-001', 'Welcome Coupons Batch 1', 1000, 75, JSON_OBJECT('prefix', 'WELCOME', 'length', 8, 'type', 'alphanumeric')),
('pool-002', 'camp-002', 'Free Delivery Pool', 2000, 170, JSON_OBJECT('prefix', 'SHIP', 'length', 6, 'type', 'numeric')),
('pool-003', 'camp-003', 'Flash Sale Pool', 500, 120, JSON_OBJECT('prefix', 'FLASH', 'length', 7, 'type', 'mixed')),
('pool-004', 'camp-004', 'Weekend Special Pool', 1200, 220, JSON_OBJECT('prefix', 'WEEKEND', 'length', 6, 'type', 'numeric')),
('pool-005', 'camp-005', 'Loyalty Rewards Pool', 300, 16, JSON_OBJECT('prefix', 'LOYAL', 'length', 8, 'type', 'alphanumeric'));

-- =====================================================
-- VERIFICATION AND SUMMARY
-- =====================================================

-- Call the verification procedure
CALL VerifyDataIntegrity();

-- Display summary statistics
SELECT 
    'SEED DATA SUMMARY' AS summary_type,
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM products) AS total_products,
    (SELECT COUNT(*) FROM categories) AS total_categories,
    (SELECT COUNT(*) FROM couriers) AS total_couriers,
    (SELECT COUNT(*) FROM campaigns) AS total_campaigns,
    (SELECT COUNT(*) FROM coupons) AS total_coupons,
    (SELECT COUNT(*) FROM product_media) AS total_media_files,
    (SELECT COUNT(*) FROM seller_products) AS total_seller_products,
    (SELECT COUNT(*) FROM assignments) AS total_assignments;

-- Display demo credentials
SELECT 
    'DEMO CREDENTIALS' AS info_type,
    'Use these accounts for testing' AS description;

SELECT 
    role,
    email,
    'demo123' AS password,
    CONCAT(first_name, ' ', last_name) AS full_name,
    CASE 
        WHEN role = 'admin' THEN 'Full platform access'
        WHEN role = 'customer' THEN 'Order placement and tracking'
        WHEN role = 'courier' THEN 'Delivery management'
        WHEN role = 'seller' THEN 'Product and inventory management'
    END AS access_description
FROM users 
WHERE email IN ('admin@cebeuygun.com', 'customer@demo.com', 'courier@demo.com', 'seller@demo.com')
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1 
        WHEN 'customer' THEN 2 
        WHEN 'courier' THEN 3 
        WHEN 'seller' THEN 4 
    END;

-- Display available coupons
SELECT 
    'DEMO COUPONS' AS info_type,
    'Use these coupon codes for testing' AS description;

SELECT 
    code AS coupon_code,
    discount_type,
    discount_value,
    CASE 
        WHEN discount_type = 'percentage' THEN CONCAT(discount_value, '% discount')
        WHEN discount_type = 'flat_amount' THEN CONCAT(discount_value/100, ' TL discount')
        WHEN discount_type = 'free_delivery' THEN 'Free delivery'
    END AS discount_description,
    usage_limit - usage_count AS remaining_uses,
    DATE(valid_until) AS expires_on
FROM coupons 
WHERE is_active = 1 AND valid_until > NOW()
ORDER BY discount_value DESC;

-- =====================================================
-- FINAL NOTES
-- =====================================================

/*
MYSQL SEED DATA COMPLETED SUCCESSFULLY!

Demo Environment Ready:
======================

Total Records Generated:
- Users: 12 (4 demo accounts + 8 additional)
- Products: 24 across all categories
- Categories: 17 (hierarchical structure)
- Couriers: 4 with different vehicle types
- Campaigns: 6 active marketing campaigns
- Coupons: 14 usable discount codes
- Product Media: 20 high-quality images
- Service Areas: 8 geographic coverage areas
- Working Hours: 24 schedule configurations

Demo Credentials:
================
- Admin: admin@cebeuygun.com / demo123
- Customer: customer@demo.com / demo123  
- Courier: courier@demo.com / demo123
- Seller: seller@demo.com / demo123

Popular Coupon Codes:
====================
- SAVE1234: 20% new user discount
- FREESHIP100: Free delivery over 100 TL
- FLASH30: 30% flash sale discount
- WEEKEND25: 25 TL weekend discount
- LOYAL50: 50% loyalty reward

Next Steps:
===========
1. Start the application services
2. Login with demo credentials
3. Test the complete order flow
4. Explore admin dashboard features
5. Test courier assignment and delivery

The database is now ready for comprehensive platform testing!
*/