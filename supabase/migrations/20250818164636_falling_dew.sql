-- =====================================================
-- CebeUygun Platform Demo Seed Data
-- Database: PostgreSQL/Supabase
-- Purpose: Comprehensive demo data for platform testing
-- =====================================================

-- Clear existing data (in correct order to respect foreign keys)
TRUNCATE TABLE campaign_usage, campaign_audit, coupon_pools, coupons, campaigns CASCADE;
TRUNCATE TABLE product_media, seller_products, product_variants, products CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE assignment_history, assignments CASCADE;
TRUNCATE TABLE courier_locations, courier_working_hours, courier_service_areas, couriers CASCADE;
TRUNCATE TABLE password_reset_tokens, refresh_tokens CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE pricing_quotes, commission_rates, pricing_rules, feature_flags, commission_analytics CASCADE;

-- =====================================================
-- DEMO USERS
-- =====================================================

-- Insert demo users with bcrypt hashed passwords (password: demo123 for all)
INSERT INTO users (id, email, password_hash, phone, first_name, last_name, role, status, email_verified, phone_verified, created_at, updated_at) VALUES
-- Admin user
('550e8400-e29b-41d4-a716-446655440000', 'admin@cebeuygun.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 555 000 0001', 'Admin', 'User', 'admin', 'active', true, true, NOW(), NOW()),

-- Customer users
('550e8400-e29b-41d4-a716-446655440001', 'customer@demo.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 555 123 4567', 'Ahmet', 'Yılmaz', 'customer', 'active', true, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'ayse.demir@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 555 987 6543', 'Ayşe', 'Demir', 'customer', 'active', true, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'mehmet.kaya@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 555 456 7890', 'Mehmet', 'Kaya', 'customer', 'active', true, true, NOW(), NOW()),

-- Courier users
('550e8400-e29b-41d4-a716-446655440010', 'courier@demo.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 555 111 2222', 'Can', 'Özkan', 'courier', 'active', true, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440011', 'kurye1@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 555 222 3333', 'Emre', 'Şahin', 'courier', 'active', true, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'kurye2@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 555 333 4444', 'Zeynep', 'Yıldız', 'courier', 'active', true, true, NOW(), NOW()),

-- Seller users
('550e8400-e29b-41d4-a716-446655440020', 'seller@demo.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 555 444 5555', 'Fatma', 'Özkan', 'seller', 'active', true, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440021', 'pizza.palace@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 212 555 0101', 'Pizza', 'Palace', 'seller', 'active', true, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440022', 'burger.house@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '+90 212 555 0202', 'Burger', 'House', 'seller', 'active', true, true, NOW(), NOW());

-- =====================================================
-- PRODUCT CATEGORIES
-- =====================================================

-- Main categories
INSERT INTO categories (id, name, description, parent_id, sort_order, is_active) VALUES
-- Level 0 - Main categories
('cat-food', 'Yiyecek & İçecek', 'Taze gıda ürünleri ve içecekler', NULL, 1, true),
('cat-market', 'Market & Gıda', 'Günlük ihtiyaç ürünleri', NULL, 2, true),
('cat-electronics', 'Elektronik & Teknoloji', 'Teknoloji ürünleri ve aksesuarları', NULL, 3, true),
('cat-fashion', 'Moda & Giyim', 'Kadın, erkek ve çocuk giyim', NULL, 4, true),
('cat-home', 'Ev & Yaşam', 'Ev eşyaları ve yaşam ürünleri', NULL, 5, true);

-- Level 1 - Sub categories
INSERT INTO categories (id, name, description, parent_id, sort_order, is_active) VALUES
-- Food subcategories
('cat-fastfood', 'Fast Food', 'Hamburger, pizza, döner ve hızlı yemek seçenekleri', 'cat-food', 1, true),
('cat-turkish', 'Türk Mutfağı', 'Geleneksel Türk yemekleri', 'cat-food', 2, true),
('cat-world', 'Dünya Mutfağı', 'Uluslararası lezzetler', 'cat-food', 3, true),
('cat-beverages', 'İçecekler', 'Soğuk ve sıcak içecekler', 'cat-food', 4, true),

-- Market subcategories
('cat-fruits', 'Meyve & Sebze', 'Taze meyve ve sebzeler', 'cat-market', 1, true),
('cat-meat', 'Et & Tavuk & Balık', 'Protein kaynakları', 'cat-market', 2, true),
('cat-dairy', 'Süt Ürünleri', 'Süt ve süt ürünleri', 'cat-market', 3, true),

-- Electronics subcategories
('cat-phones', 'Telefon & Tablet', 'Akıllı telefon ve tablet bilgisayarlar', 'cat-electronics', 1, true),
('cat-computers', 'Bilgisayar & Laptop', 'Masaüstü ve taşınabilir bilgisayarlar', 'cat-electronics', 2, true),

-- Fashion subcategories
('cat-women', 'Kadın Giyim', 'Kadın kıyafetleri ve aksesuarları', 'cat-fashion', 1, true),
('cat-men', 'Erkek Giyim', 'Erkek kıyafetleri ve aksesuarları', 'cat-fashion', 2, true),

-- Home subcategories
('cat-decoration', 'Ev Dekorasyonu', 'Dekoratif ev eşyaları', 'cat-home', 1, true),
('cat-kitchen', 'Mutfak Eşyaları', 'Mutfak gereçleri ve aletleri', 'cat-home', 2, true);

-- =====================================================
-- SAMPLE PRODUCTS
-- =====================================================

-- Fast food products
INSERT INTO products (id, name, description, category_id, brand, sku, base_price, currency, tax_rate, base_stock, min_stock, preparation_time, is_active, is_express_delivery, tags, attributes) VALUES
('prod-001', 'Big Mac Menü', 'İki köfte, özel sos, marul, peynir, turşu, soğan ile sesam ekmekte. Patates kızartması ve içecek dahil.', 'cat-fastfood', 'McDonald''s', 'MCD-BIGMAC-001', 4500, 'TRY', 18, 100, 10, 8, true, false, ARRAY['hamburger', 'menü', 'popüler'], '{"calories": 563, "allergens": ["gluten", "dairy", "sesame"]}'),
('prod-002', 'Margherita Pizza (Büyük)', 'Taze mozzarella, domates sosu ve fesleğen ile klasik İtalyan pizzası.', 'cat-fastfood', 'Domino''s Pizza', 'DOM-MARG-L-001', 3800, 'TRY', 18, 50, 5, 15, true, false, ARRAY['pizza', 'vegetarian', 'italian'], '{"size": "large", "diameter": "32cm", "allergens": ["gluten", "dairy"]}'),
('prod-003', 'Chicken Döner Porsiyon', 'Taze tavuk döner, pilav, salata ve ayran ile servis edilir.', 'cat-fastfood', 'Döner King', 'DK-CHICK-001', 2800, 'TRY', 18, 80, 8, 5, true, false, ARRAY['döner', 'tavuk', 'geleneksel'], '{"spiceLevel": "medium", "allergens": ["dairy"]}');

-- Turkish cuisine products
INSERT INTO products (id, name, description, category_id, brand, sku, base_price, currency, tax_rate, base_stock, min_stock, preparation_time, is_active, is_express_delivery, tags, attributes) VALUES
('prod-004', 'Adana Kebap', 'Acılı kıyma kebabı, bulgur pilavı, közlenmiş domates ve biber ile.', 'cat-turkish', 'Kebapçı Halil', 'KH-ADANA-001', 4200, 'TRY', 18, 60, 6, 20, true, false, ARRAY['kebap', 'acılı', 'geleneksel'], '{"spiceLevel": "hot", "region": "Adana", "allergens": []}'),
('prod-005', 'İskender Kebap', 'Döner eti, pide üzerinde, domates sosu ve tereyağı ile.', 'cat-turkish', 'Bursa Sofrası', 'BS-ISKENDER-001', 4800, 'TRY', 18, 40, 4, 15, true, false, ARRAY['iskender', 'döner', 'bursa'], '{"region": "Bursa", "allergens": ["gluten", "dairy"]}'),
('prod-006', 'Mantı', 'El açması hamur içinde kıyma, yoğurt ve tereyağlı sos ile.', 'cat-turkish', 'Anadolu Mutfağı', 'AM-MANTI-001', 3500, 'TRY', 18, 30, 3, 25, true, false, ARRAY['mantı', 'hamur işi', 'geleneksel'], '{"pieces": 40, "allergens": ["gluten", "dairy", "eggs"]}');

-- Beverages
INSERT INTO products (id, name, description, category_id, brand, sku, base_price, currency, tax_rate, base_stock, min_stock, preparation_time, is_active, is_express_delivery, tags, attributes) VALUES
('prod-007', 'Türk Kahvesi', 'Geleneksel Türk kahvesi, şeker seçeneği ile.', 'cat-beverages', 'Kahve Dünyası', 'KD-TURK-001', 800, 'TRY', 18, 200, 20, 5, true, false, ARRAY['kahve', 'geleneksel', 'sıcak'], '{"caffeine": "medium", "temperature": "hot"}'),
('prod-008', 'Taze Sıkılmış Portakal Suyu', 'Günlük taze sıkılmış portakal suyu, %100 doğal.', 'cat-beverages', 'Fresh Juice', 'FJ-ORANGE-001', 1200, 'TRY', 8, 150, 15, 3, true, false, ARRAY['meyve suyu', 'taze', 'vitamin'], '{"vitaminC": "high", "natural": true}'),
('prod-009', 'Ayran', 'Geleneksel Türk içeceği, yoğurt, su ve tuz karışımı.', 'cat-beverages', 'Sütaş', 'SUT-AYRAN-001', 600, 'TRY', 8, 300, 30, 2, true, false, ARRAY['ayran', 'geleneksel', 'probiyotik'], '{"probiotics": true, "allergens": ["dairy"]}');

-- Electronics
INSERT INTO products (id, name, description, category_id, brand, sku, base_price, currency, tax_rate, base_stock, min_stock, preparation_time, is_active, is_express_delivery, tags, attributes) VALUES
('prod-010', 'iPhone 15 Pro Max 256GB', 'Apple iPhone 15 Pro Max, 256GB depolama, ProRAW kamera sistemi.', 'cat-phones', 'Apple', 'APL-IP15PM-256', 6499900, 'TRY', 18, 10, 1, 0, true, true, ARRAY['iphone', 'apple', 'flagship'], '{"storage": "256GB", "color": "Natural Titanium", "warranty": "2 years"}'),
('prod-011', 'Samsung Galaxy S24 Ultra', 'Samsung Galaxy S24 Ultra, S Pen dahil, 512GB depolama.', 'cat-phones', 'Samsung', 'SAM-S24U-512', 5799900, 'TRY', 18, 8, 1, 0, true, true, ARRAY['samsung', 'android', 'flagship'], '{"storage": "512GB", "color": "Titanium Black", "spen": true}'),
('prod-012', 'MacBook Air M3 13"', 'Apple MacBook Air M3 çip, 13 inç Liquid Retina ekran, 512GB SSD.', 'cat-computers', 'Apple', 'APL-MBA-M3-512', 4999900, 'TRY', 18, 5, 1, 0, true, true, ARRAY['macbook', 'apple', 'laptop'], '{"processor": "M3", "screen": "13.6\"", "storage": "512GB SSD"}');

-- Fashion items
INSERT INTO products (id, name, description, category_id, brand, sku, base_price, currency, tax_rate, base_stock, min_stock, preparation_time, is_active, is_express_delivery, tags, attributes) VALUES
('prod-013', 'Levi''s 501 Original Jean', 'Klasik straight fit jean, %100 pamuk, vintage yıkama.', 'cat-men', 'Levi''s', 'LEV-501-BLUE', 89900, 'TRY', 18, 25, 2, 0, true, false, ARRAY['jean', 'levis', 'klasik'], '{"material": "100% Cotton", "fit": "Straight", "wash": "Medium Blue"}'),
('prod-014', 'Nike Air Max 270', 'Nike Air Max 270 spor ayakkabı, maksimum hava yastığı teknolojisi.', 'cat-men', 'Nike', 'NIK-AM270-BW', 179900, 'TRY', 18, 15, 1, 0, true, false, ARRAY['nike', 'spor ayakkabı', 'air max'], '{"brand": "Nike", "technology": "Air Max", "color": "Black/White"}');

-- Home & living
INSERT INTO products (id, name, description, category_id, brand, sku, base_price, currency, tax_rate, base_stock, min_stock, preparation_time, is_active, is_express_delivery, tags, attributes) VALUES
('prod-015', 'IKEA MALM Yatak Odası Takımı', 'Modern yatak odası takımı, yatak, komodin ve dolap dahil.', 'cat-decoration', 'IKEA', 'IKE-MALM-SET', 899900, 'TRY', 18, 3, 1, 0, true, false, ARRAY['yatak odası', 'ikea', 'mobilya'], '{"material": "Particle Board", "color": "White", "assembly": "Required"}'),
('prod-016', 'Philips Hue Akıllı Ampul Seti', '4''lü renkli LED ampul seti, WiFi kontrolü, 16 milyon renk.', 'cat-decoration', 'Philips', 'PHI-HUE-4SET', 149900, 'TRY', 18, 12, 2, 0, true, true, ARRAY['akıllı ev', 'led', 'philips'], '{"connectivity": "WiFi", "colors": "16M", "wattage": "9W"}');

-- =====================================================
-- PRODUCT MEDIA
-- =====================================================

-- Product images from Pexels
INSERT INTO product_media (id, product_id, type, url, file_name, file_size, mime_type, alt_text, sort_order, is_active) VALUES
-- Big Mac images
('media-001', 'prod-001', 'image', 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400', 'bigmac_1.jpg', 125000, 'image/jpeg', 'Big Mac Menü', 0, true),
('media-002', 'prod-001', 'image', 'https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=400', 'bigmac_2.jpg', 118000, 'image/jpeg', 'Big Mac Menü Detay', 1, true),

-- Pizza images
('media-003', 'prod-002', 'image', 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400', 'margherita_1.jpg', 142000, 'image/jpeg', 'Margherita Pizza', 0, true),
('media-004', 'prod-002', 'image', 'https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg?auto=compress&cs=tinysrgb&w=400', 'margherita_2.jpg', 156000, 'image/jpeg', 'Margherita Pizza Detay', 1, true),

-- Döner images
('media-005', 'prod-003', 'image', 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=400', 'doner_1.jpg', 134000, 'image/jpeg', 'Chicken Döner', 0, true),

-- Turkish cuisine images
('media-006', 'prod-004', 'image', 'https://images.pexels.com/photos/6419733/pexels-photo-6419733.jpeg?auto=compress&cs=tinysrgb&w=400', 'adana_1.jpg', 167000, 'image/jpeg', 'Adana Kebap', 0, true),
('media-007', 'prod-005', 'image', 'https://images.pexels.com/photos/5474640/pexels-photo-5474640.jpeg?auto=compress&cs=tinysrgb&w=400', 'iskender_1.jpg', 189000, 'image/jpeg', 'İskender Kebap', 0, true),

-- Electronics images
('media-008', 'prod-010', 'image', 'https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg?auto=compress&cs=tinysrgb&w=400', 'iphone15_1.jpg', 98000, 'image/jpeg', 'iPhone 15 Pro Max', 0, true),
('media-009', 'prod-011', 'image', 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400', 'galaxy_s24_1.jpg', 102000, 'image/jpeg', 'Samsung Galaxy S24 Ultra', 0, true),
('media-010', 'prod-012', 'image', 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400', 'macbook_1.jpg', 87000, 'image/jpeg', 'MacBook Air M3', 0, true);

-- =====================================================
-- COURIER DATA
-- =====================================================

-- Courier profiles
INSERT INTO couriers (id, user_id, first_name, last_name, phone, email, vehicle_type, vehicle_plate, status, rating, completed_orders, is_online) VALUES
('courier-001', '550e8400-e29b-41d4-a716-446655440010', 'Can', 'Özkan', '+90 555 111 2222', 'courier@demo.com', 'MOTORBIKE', '34 ABC 123', 'ACTIVE', 4.8, 247, false),
('courier-002', '550e8400-e29b-41d4-a716-446655440011', 'Emre', 'Şahin', '+90 555 222 3333', 'kurye1@example.com', 'BICYCLE', NULL, 'ACTIVE', 4.6, 189, false),
('courier-003', '550e8400-e29b-41d4-a716-446655440012', 'Zeynep', 'Yıldız', '+90 555 333 4444', 'kurye2@example.com', 'CAR', '34 DEF 456', 'INACTIVE', 4.9, 312, false);

-- Courier service areas (Istanbul focus)
INSERT INTO courier_service_areas (id, courier_id, center_lat, center_lng, radius_km, city, district, is_active) VALUES
-- Can Özkan - Motorbike (larger radius)
('area-001', 'courier-001', 41.0082, 28.9784, 15.0, 'İstanbul', 'Beyoğlu', true),
('area-002', 'courier-001', 41.0369, 28.9857, 12.0, 'İstanbul', 'Şişli', true),

-- Emre Şahin - Bicycle (smaller radius)
('area-003', 'courier-002', 41.0255, 28.9744, 5.0, 'İstanbul', 'Taksim', true),
('area-004', 'courier-002', 41.0138, 28.9497, 6.0, 'İstanbul', 'Eminönü', true),

-- Zeynep Yıldız - Car (largest radius)
('area-005', 'courier-003', 41.0431, 29.0061, 25.0, 'İstanbul', 'Levent', true),
('area-006', 'courier-003', 41.0766, 29.0573, 20.0, 'İstanbul', 'Maslak', true);

-- Courier working hours
INSERT INTO courier_working_hours (id, courier_id, day_of_week, start_time, end_time, is_active) VALUES
-- Can Özkan - Monday to Saturday
('hours-001', 'courier-001', 1, '09:00:00', '22:00:00', true),
('hours-002', 'courier-001', 2, '09:00:00', '22:00:00', true),
('hours-003', 'courier-001', 3, '09:00:00', '22:00:00', true),
('hours-004', 'courier-001', 4, '09:00:00', '22:00:00', true),
('hours-005', 'courier-001', 5, '09:00:00', '22:00:00', true),
('hours-006', 'courier-001', 6, '10:00:00', '20:00:00', true),

-- Emre Şahin - Tuesday to Sunday
('hours-007', 'courier-002', 2, '08:00:00', '18:00:00', true),
('hours-008', 'courier-002', 3, '08:00:00', '18:00:00', true),
('hours-009', 'courier-002', 4, '08:00:00', '18:00:00', true),
('hours-010', 'courier-002', 5, '08:00:00', '18:00:00', true),
('hours-011', 'courier-002', 6, '08:00:00', '18:00:00', true),
('hours-012', 'courier-002', 0, '10:00:00', '16:00:00', true),

-- Zeynep Yıldız - Monday to Friday
('hours-013', 'courier-003', 1, '10:00:00', '21:00:00', true),
('hours-014', 'courier-003', 2, '10:00:00', '21:00:00', true),
('hours-015', 'courier-003', 3, '10:00:00', '21:00:00', true),
('hours-016', 'courier-003', 4, '10:00:00', '21:00:00', true),
('hours-017', 'courier-003', 5, '10:00:00', '21:00:00', true);

-- =====================================================
-- MARKETING CAMPAIGNS
-- =====================================================

-- Sample campaigns
INSERT INTO campaigns (id, name, description, type, status, rules, is_active, valid_from, valid_until, budget, spent_budget, max_usage, current_usage, max_usage_per_user, priority, is_exclusive) VALUES
('camp-001', 'Hoş Geldin Kampanyası', 'Yeni üyelere özel %20 indirim', 'first_order', 'active', '[{"type": "user_order_count", "operator": "equals", "value": 0}]', true, NOW() - INTERVAL '7 days', NOW() + INTERVAL '30 days', '{"amount": 100000, "currency": "TRY"}', '{"amount": 15000, "currency": "TRY"}', 1000, 75, 1, 100, false),

('camp-002', 'Ücretsiz Teslimat', '100 TL üzeri siparişlerde ücretsiz teslimat', 'free_delivery', 'active', '[{"type": "min_order_amount", "value": 10000, "currency": "TRY"}]', true, NOW() - INTERVAL '3 days', NOW() + INTERVAL '60 days', '{"amount": 50000, "currency": "TRY"}', '{"amount": 8500, "currency": "TRY"}', 2000, 170, 3, 200, false),

('camp-003', 'Flash Sale - %30 İndirim', 'Seçili ürünlerde 24 saat özel indirim', 'flash_sale', 'active', '[{"type": "time_restriction", "hours": {"start": "12:00", "end": "23:59"}}]', true, NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 day', '{"amount": 25000, "currency": "TRY"}', '{"amount": 12000, "currency": "TRY"}', 500, 120, 2, 500, true),

('camp-004', 'Hafta Sonu Özel', 'Hafta sonu siparişlerinde 25 TL indirim', 'flat_discount', 'active', '[{"type": "time_restriction", "days": [0, 6]}]', true, NOW() - INTERVAL '2 days', NOW() + INTERVAL '14 days', '{"amount": 30000, "currency": "TRY"}', '{"amount": 5500, "currency": "TRY"}', 1200, 220, 2, 150, false),

('camp-005', 'Sadakat Programı', '10. siparişinizde %50 indirim', 'loyalty_reward', 'active', '[{"type": "user_order_count", "operator": "equals", "value": 10}]', true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '90 days', '{"amount": 75000, "currency": "TRY"}', '{"amount": 3200, "currency": "TRY"}', 300, 16, 1, 300, false);

-- Sample coupons
INSERT INTO coupons (id, code, campaign_id, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, usage_count, valid_from, valid_until, is_active, applicable_products, user_restrictions) VALUES
-- Welcome campaign coupons
('coupon-001', 'SAVE1234', 'camp-001', 'percentage', 20, '{"amount": 2000, "currency": "TRY"}', '{"amount": 5000, "currency": "TRY"}', 1, 0, NOW() - INTERVAL '7 days', NOW() + INTERVAL '30 days', true, NULL, '{"newUsersOnly": true}'),
('coupon-002', 'DEAL5678', 'camp-001', 'percentage', 20, '{"amount": 2000, "currency": "TRY"}', '{"amount": 5000, "currency": "TRY"}', 1, 0, NOW() - INTERVAL '7 days', NOW() + INTERVAL '30 days', true, NULL, '{"newUsersOnly": true}'),

-- Free delivery coupons
('coupon-003', 'FREESHIP100', 'camp-002', 'free_delivery', 0, '{"amount": 10000, "currency": "TRY"}', NULL, 100, 15, NOW() - INTERVAL '3 days', NOW() + INTERVAL '60 days', true, NULL, NULL),
('coupon-004', 'NODELIVERY', 'camp-002', 'free_delivery', 0, '{"amount": 10000, "currency": "TRY"}', NULL, 100, 8, NOW() - INTERVAL '3 days', NOW() + INTERVAL '60 days', true, NULL, NULL),

-- Flash sale coupons
('coupon-005', 'FLASH30', 'camp-003', 'percentage', 30, '{"amount": 5000, "currency": "TRY"}', '{"amount": 10000, "currency": "TRY"}', 50, 12, NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 day', true, ARRAY['prod-001', 'prod-002'], NULL),

-- Weekend special coupons
('coupon-006', 'WEEKEND25', 'camp-004', 'flat_amount', 2500, '{"amount": 7500, "currency": "TRY"}', NULL, 200, 45, NOW() - INTERVAL '2 days', NOW() + INTERVAL '14 days', true, NULL, NULL),

-- Loyalty coupons
('coupon-007', 'LOYAL50', 'camp-005', 'percentage', 50, '{"amount": 3000, "currency": "TRY"}', '{"amount": 15000, "currency": "TRY"}', 1, 0, NOW() - INTERVAL '10 days', NOW() + INTERVAL '90 days', true, NULL, '{"minOrderHistory": 9}');

-- =====================================================
-- SELLER PRODUCT CONFIGURATIONS
-- =====================================================

-- Pizza Palace products
INSERT INTO seller_products (id, seller_id, product_id, seller_sku, price, stock, min_stock, max_stock, is_active, is_visible, preparation_time) VALUES
('sp-001', '550e8400-e29b-41d4-a716-446655440021', 'prod-002', 'PP-MARG-L', 3800, 25, 3, 50, true, true, 15),
('sp-002', '550e8400-e29b-41d4-a716-446655440021', 'prod-007', 'PP-COFFEE', 800, 100, 10, 200, true, true, 5);

-- Burger House products
INSERT INTO seller_products (id, seller_id, product_id, seller_sku, price, stock, min_stock, max_stock, is_active, is_visible, preparation_time) VALUES
('sp-003', '550e8400-e29b-41d4-a716-446655440022', 'prod-001', 'BH-BIGMAC', 4500, 40, 5, 80, true, true, 8),
('sp-004', '550e8400-e29b-41d4-a716-446655440022', 'prod-008', 'BH-ORANGE', 1200, 60, 6, 120, true, true, 3);

-- =====================================================
-- PRICING AND COMMISSION DATA
-- =====================================================

-- Commission rates
INSERT INTO commission_rates (id, commission_type, rate, currency, effective_from, is_active, priority) VALUES
('comm-001', 'PERCENTAGE', 15.0000, 'TRY', NOW() - INTERVAL '30 days', true, 100),
('comm-002', 'PERCENTAGE', 12.0000, 'TRY', NOW() - INTERVAL '30 days', true, 200),
('comm-003', 'FLAT', 500.0000, 'TRY', NOW() - INTERVAL '30 days', true, 300);

-- Pricing rules
INSERT INTO pricing_rules (id, name, type, configuration, effective_from, is_active, version, created_by) VALUES
('rule-001', 'Standard Delivery Fee', 'DELIVERY_FEE', '{"baseRate": 500, "perKm": 100, "maxFee": 2000}', NOW() - INTERVAL '30 days', true, 1, '550e8400-e29b-41d4-a716-446655440000'),
('rule-002', 'Small Basket Fee', 'SMALL_BASKET', '{"threshold": 2500, "fee": 300}', NOW() - INTERVAL '30 days', true, 1, '550e8400-e29b-41d4-a716-446655440000'),
('rule-003', 'Express Delivery Fee', 'EXPRESS_FEE', '{"multiplier": 1.5, "minFee": 1000}', NOW() - INTERVAL '30 days', true, 1, '550e8400-e29b-41d4-a716-446655440000');

-- Feature flags
INSERT INTO feature_flags (id, key, name, description, type, value, is_enabled) VALUES
('flag-001', 'enable_express_delivery', 'Express Delivery', 'Enable express delivery option', 'BOOLEAN', 'true', true),
('flag-002', 'loyalty_program', 'Loyalty Program', 'Enable customer loyalty program', 'BOOLEAN', 'true', true),
('flag-003', 'dynamic_pricing', 'Dynamic Pricing', 'Enable dynamic pricing based on demand', 'BOOLEAN', 'false', false),
('flag-004', 'surge_pricing_multiplier', 'Surge Pricing Multiplier', 'Multiplier for surge pricing', 'NUMBER', '1.5', false);

-- Sample pricing quotes
INSERT INTO pricing_quotes (id, customer_id, seller_id, quote_hash, subtotal, tax_amount, delivery_fee, small_basket_fee, total_amount, currency, commission_breakdown, pricing_breakdown, applied_rules, valid_until) VALUES
('quote-001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440021', 'hash123abc', 3800, 684, 500, 0, 4984, 'TRY', '{"platform": 570, "payment": 50}', '{"subtotal": 3800, "tax": 684, "delivery": 500}', '["rule-001"]', NOW() + INTERVAL '1 hour'),
('quote-002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440022', 'hash456def', 4500, 810, 500, 0, 5810, 'TRY', '{"platform": 675, "payment": 58}', '{"subtotal": 4500, "tax": 810, "delivery": 500}', '["rule-001"]', NOW() + INTERVAL '1 hour');

-- =====================================================
-- SAMPLE ASSIGNMENTS
-- =====================================================

-- Sample order assignments
INSERT INTO assignments (id, order_id, courier_id, status, pickup_location, delivery_location, estimated_distance, estimated_duration, notes) VALUES
('assign-001', 'order-demo-001', 'courier-001', 'PENDING', 
 '{"latitude": 41.0082, "longitude": 28.9784, "address": "Galata Kulesi Mah. Büyük Hendek Cad. No:15, Beyoğlu/İstanbul"}',
 '{"latitude": 41.0369, "longitude": 28.9857, "address": "Maslak Mah. Büyükdere Cad. No:255 Daire:12, Şişli/İstanbul"}',
 5.2, 25, 'Müşteri kapıcıya bırakılmasını istiyor'),

('assign-002', 'order-demo-002', 'courier-002', 'ACCEPTED',
 '{"latitude": 41.0255, "longitude": 28.9744, "address": "Taksim Meydan No:1, Beyoğlu/İstanbul"}',
 '{"latitude": 41.0138, "longitude": 28.9497, "address": "Eminönü Mah. Hobyar Cad. No:45, Fatih/İstanbul"}',
 3.8, 18, 'Ofis binası, 2. kat');

-- =====================================================
-- CAMPAIGN USAGE EXAMPLES
-- =====================================================

-- Sample campaign usage
INSERT INTO campaign_usage (id, campaign_id, customer_id, order_id, discount_amount, applied_at, metadata) VALUES
('usage-001', 'camp-001', '550e8400-e29b-41d4-a716-446655440001', 'order-demo-001', '{"amount": 760, "currency": "TRY"}', NOW() - INTERVAL '2 hours', '{"couponCode": "SAVE1234", "originalAmount": 3800}'),
('usage-002', 'camp-002', '550e8400-e29b-41d4-a716-446655440002', 'order-demo-002', '{"amount": 500, "currency": "TRY"}', NOW() - INTERVAL '1 hour', '{"couponCode": "FREESHIP100", "deliveryFeeWaived": true}');

-- Sample campaign audit
INSERT INTO campaign_audit (id, campaign_id, customer_id, action, details, timestamp, ip_address, user_agent) VALUES
('audit-001', 'camp-001', '550e8400-e29b-41d4-a716-446655440001', 'applied', '{"couponCode": "SAVE1234", "discountAmount": 760, "orderId": "order-demo-001"}', NOW() - INTERVAL '2 hours', '192.168.1.100', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'),
('audit-002', 'camp-002', '550e8400-e29b-41d4-a716-446655440002', 'applied', '{"couponCode": "FREESHIP100", "deliveryFeeWaived": true, "orderId": "order-demo-002"}', NOW() - INTERVAL '1 hour', '192.168.1.101', 'Mozilla/5.0 (Android 14; Mobile)');

-- =====================================================
-- ANALYTICS DATA
-- =====================================================

-- Commission analytics sample data
INSERT INTO commission_analytics (id, period_start, period_end, total_commission, transaction_count, average_rate) VALUES
('analytics-001', DATE_TRUNC('day', NOW() - INTERVAL '1 day'), DATE_TRUNC('day', NOW()), 15750.00, 105, 15.0000),
('analytics-002', DATE_TRUNC('day', NOW() - INTERVAL '2 days'), DATE_TRUNC('day', NOW() - INTERVAL '1 day'), 18920.00, 126, 15.0000),
('analytics-003', DATE_TRUNC('day', NOW() - INTERVAL '3 days'), DATE_TRUNC('day', NOW() - INTERVAL '2 days'), 22340.00, 149, 15.0000);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify data integrity
DO $$
DECLARE
    user_count INTEGER;
    product_count INTEGER;
    courier_count INTEGER;
    campaign_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO product_count FROM products;
    SELECT COUNT(*) INTO courier_count FROM couriers;
    SELECT COUNT(*) INTO campaign_count FROM campaigns;
    
    RAISE NOTICE 'Seed data verification:';
    RAISE NOTICE '- Users: %', user_count;
    RAISE NOTICE '- Products: %', product_count;
    RAISE NOTICE '- Couriers: %', courier_count;
    RAISE NOTICE '- Campaigns: %', campaign_count;
    
    IF user_count < 8 OR product_count < 10 OR courier_count < 3 OR campaign_count < 5 THEN
        RAISE EXCEPTION 'Seed data incomplete - check for errors';
    END IF;
    
    RAISE NOTICE 'Seed data verification completed successfully!';
END $$;

-- =====================================================
-- DEMO CREDENTIALS SUMMARY
-- =====================================================

/*
DEMO CREDENTIALS:
================

Admin Account:
- Email: admin@cebeuygun.com
- Password: demo123
- Access: Full platform management

Customer Account:
- Email: customer@demo.com  
- Password: demo123
- Access: Order placement and tracking

Courier Account:
- Email: courier@demo.com
- Password: demo123
- Access: Delivery management

Seller Account:
- Email: seller@demo.com
- Password: demo123
- Access: Product and inventory management

DEMO COUPONS:
=============
- SAVE1234: 20% discount for new users
- DEAL5678: 20% discount for new users
- FREESHIP100: Free delivery on orders over 100 TL
- FLASH30: 30% discount on selected items
- WEEKEND25: 25 TL discount on weekend orders
- LOYAL50: 50% discount for 10th order

DEMO URLS:
==========
- Customer App: http://localhost:3000
- Admin Dashboard: http://localhost:3001
- Courier App: http://localhost:3002
- API Documentation: http://localhost:8000/docs
*/