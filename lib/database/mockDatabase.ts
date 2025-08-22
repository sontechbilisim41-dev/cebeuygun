
// Mock Database Implementation for Cebeuygun.com Platform
// This simulates a complete database with all tables and relationships

import { DatabaseSchema } from './schema';
import { storage } from '@/lib/localStorage';

export class MockDatabase {
  private static instance: MockDatabase;
  
  static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  // Initialize all database tables with sample data
  initializeDatabase(): void {
    this.initializeUsers();
    this.initializeCategories();
    this.initializeBrands();
    this.initializeVendors();
    this.initializeProducts();
    this.initializeRestaurants();
    this.initializeCouriers();
    this.initializeOrders();
    this.initializeCampaigns();
    this.initializeCoupons();
    this.initializeNotifications();
    this.initializeSystemSettings();
    this.initializeAnalytics();
  }

  private initializeUsers(): void {
    const users = [
      {
        id: 'user_1',
        email: 'customer@example.com',
        password_hash: 'hashed_password',
        name: 'Ahmet Yılmaz',
        phone: '+905551234567',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        role: 'customer' as const,
        status: 'active' as const,
        email_verified: true,
        phone_verified: true,
        last_login: '2024-01-20T10:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      },
      {
        id: 'user_2',
        email: 'vendor@example.com',
        password_hash: 'hashed_password',
        name: 'Mehmet Market',
        phone: '+905551234568',
        role: 'vendor' as const,
        status: 'active' as const,
        email_verified: true,
        phone_verified: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      },
      {
        id: 'user_3',
        email: 'courier@example.com',
        password_hash: 'hashed_password',
        name: 'Ali Kurye',
        phone: '+905551234569',
        role: 'courier' as const,
        status: 'active' as const,
        email_verified: true,
        phone_verified: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      },
      {
        id: 'user_4',
        email: 'admin@cebeuygun.com',
        password_hash: 'hashed_password',
        name: 'System Admin',
        phone: '+905551234570',
        role: 'admin' as const,
        status: 'active' as const,
        email_verified: true,
        phone_verified: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      }
    ];

    const userProfiles = [
      {
        id: 'profile_1',
        user_id: 'user_1',
        first_name: 'Ahmet',
        last_name: 'Yılmaz',
        date_of_birth: '1990-05-15',
        gender: 'male' as const,
        nationality: 'Turkish',
        language: 'tr',
        timezone: 'Europe/Istanbul',
        loyalty_points: 1250,
        total_spent: 2500.75,
        order_count: 15,
        referral_code: 'AHMET123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      }
    ];

    const userAddresses = [
      {
        id: 'addr_1',
        user_id: 'user_1',
        title: 'Ev',
        full_name: 'Ahmet Yılmaz',
        phone: '+905551234567',
        address_line_1: 'Atatürk Caddesi No:123',
        address_line_2: 'Daire 5',
        district: 'Kadıköy',
        city: 'İstanbul',
        state: 'İstanbul',
        postal_code: '34710',
        country: 'Turkey',
        latitude: 40.9903,
        longitude: 29.0275,
        is_default: true,
        type: 'home' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    const userPreferences = [
      {
        id: 'pref_1',
        user_id: 'user_1',
        email_notifications: true,
        sms_notifications: true,
        push_notifications: true,
        marketing_emails: false,
        order_updates: true,
        promotional_offers: true,
        language: 'tr',
        currency: 'TRY',
        theme: 'light' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    storage.set('users', users);
    storage.set('user_profiles', userProfiles);
    storage.set('user_addresses', userAddresses);
    storage.set('user_preferences', userPreferences);
  }

  private initializeCategories(): void {
    const categories = [
      {
        id: 'cat_1',
        name: 'Market Ürünleri',
        slug: 'market-urunleri',
        description: 'Günlük ihtiyaçlarınız için market ürünleri',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
        icon: '🛒',
        level: 0,
        sort_order: 1,
        is_active: true,
        meta_title: 'Market Ürünleri - Cebeuygun.com',
        meta_description: 'Taze ve kaliteli market ürünleri 10-30 dakikada kapınızda',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'cat_2',
        name: 'Meyve & Sebze',
        slug: 'meyve-sebze',
        description: 'Taze meyve ve sebzeler',
        image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400',
        icon: '🥕',
        parent_id: 'cat_1',
        level: 1,
        sort_order: 1,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'cat_3',
        name: 'Süt Ürünleri',
        slug: 'sut-urunleri',
        description: 'Süt, peynir, yoğurt ve diğer süt ürünleri',
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
        icon: '🥛',
        parent_id: 'cat_1',
        level: 1,
        sort_order: 2,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'cat_4',
        name: 'Elektronik',
        slug: 'elektronik',
        description: 'Teknoloji ürünleri ve elektronik cihazlar',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
        icon: '📱',
        level: 0,
        sort_order: 2,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'cat_5',
        name: 'Giyim',
        slug: 'giyim',
        description: 'Kadın, erkek ve çocuk giyim ürünleri',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
        icon: '👕',
        level: 0,
        sort_order: 3,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    storage.set('categories', categories);
  }

  private initializeBrands(): void {
    const brands = [
      {
        id: 'brand_1',
        name: 'FreshFarm',
        slug: 'freshfarm',
        description: 'Organik ve taze ürünler',
        logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
        website: 'https://freshfarm.com',
        is_active: true,
        sort_order: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'brand_2',
        name: 'Apple',
        slug: 'apple',
        description: 'Premium teknoloji ürünleri',
        logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
        website: 'https://apple.com',
        is_active: true,
        sort_order: 2,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'brand_3',
        name: 'StyleCo',
        slug: 'styleco',
        description: 'Modern ve şık giyim',
        logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
        website: 'https://styleco.com',
        is_active: true,
        sort_order: 3,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    storage.set('brands', brands);
  }

  private initializeVendors(): void {
    const vendors = [
      {
        id: 'vendor_1',
        user_id: 'user_2',
        business_name: 'Mehmet Market',
        business_type: 'market' as const,
        tax_number: '1234567890',
        trade_registry_number: '123456',
        commission_rate: 15.0,
        is_verified: true,
        verification_date: '2024-01-05T00:00:00Z',
        status: 'active' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-05T00:00:00Z'
      }
    ];

    const vendorProfiles = [
      {
        id: 'vprofile_1',
        vendor_id: 'vendor_1',
        description: 'Mahallenizdeki güvenilir market',
        logo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200',
        banner_image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
        contact_email: 'vendor@example.com',
        contact_phone: '+905551234568',
        address: 'Market Caddesi No:45',
        city: 'İstanbul',
        state: 'İstanbul',
        postal_code: '34710',
        country: 'Turkey',
        latitude: 40.9903,
        longitude: 29.0275,
        business_hours: JSON.stringify({
          monday: { open: '08:00', close: '22:00', isOpen: true },
          tuesday: { open: '08:00', close: '22:00', isOpen: true },
          wednesday: { open: '08:00', close: '22:00', isOpen: true },
          thursday: { open: '08:00', close: '22:00', isOpen: true },
          friday: { open: '08:00', close: '22:00', isOpen: true },
          saturday: { open: '08:00', close: '22:00', isOpen: true },
          sunday: { open: '09:00', close: '21:00', isOpen: true }
        }),
        delivery_zones: JSON.stringify(['34710', '34711', '34712']),
        minimum_order_amount: 25.0,
        delivery_fee: 5.0,
        free_delivery_threshold: 100.0,
        average_preparation_time: 15,
        rating_average: 4.8,
        rating_count: 1250,
        total_orders: 5000,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      }
    ];

    storage.set('vendors', vendors);
    storage.set('vendor_profiles', vendorProfiles);
  }

  private initializeProducts(): void {
    const products = [
      {
        id: 'prod_1',
        vendor_id: 'vendor_1',
        category_id: 'cat_2',
        brand_id: 'brand_1',
        name: 'Organik Elma',
        slug: 'organik-elma',
        description: 'Taze ve organik elma, yerel üreticilerden',
        short_description: 'Organik elma - 1kg',
        sku: 'APPLE-ORG-001',
        barcode: '1234567890123',
        base_price: 25.99,
        sale_price: 22.99,
        cost_price: 15.00,
        stock_quantity: 100,
        min_stock_level: 10,
        max_stock_level: 500,
        weight: 1.0,
        length: 20,
        width: 15,
        height: 10,
        is_active: true,
        is_featured: true,
        is_digital: false,
        requires_shipping: true,
        requires_prescription: false,
        cold_chain_required: true,
        rating_average: 4.8,
        rating_count: 156,
        sold_count: 1250,
        view_count: 5000,
        tags: 'organik,taze,sağlıklı,yerel',
        meta_title: 'Organik Elma - Taze ve Sağlıklı',
        meta_description: 'Organik elma satın al, 10-30 dakikada teslim',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T15:30:00Z'
      },
      {
        id: 'prod_2',
        vendor_id: 'vendor_1',
        category_id: 'cat_4',
        brand_id: 'brand_2',
        name: 'iPhone 15 Pro Max',
        slug: 'iphone-15-pro-max',
        description: 'En yeni iPhone 15 Pro Max, gelişmiş kamera sistemi ve A17 Pro çip',
        short_description: 'iPhone 15 Pro Max - 256GB',
        sku: 'IPHONE-15-PRO-MAX-256',
        base_price: 1299.99,
        stock_quantity: 25,
        min_stock_level: 5,
        weight: 0.221,
        length: 16,
        width: 7.7,
        height: 0.83,
        is_active: true,
        is_featured: true,
        is_digital: false,
        requires_shipping: true,
        requires_prescription: false,
        cold_chain_required: false,
        rating_average: 4.9,
        rating_count: 89,
        sold_count: 234,
        view_count: 15000,
        tags: 'smartphone,apple,premium,yeni',
        created_at: '2024-01-10T08:00:00Z',
        updated_at: '2024-01-18T12:00:00Z'
      }
    ];

    const productImages = [
      {
        id: 'img_1',
        product_id: 'prod_1',
        url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600',
        alt_text: 'Organik Elma',
        is_primary: true,
        sort_order: 1,
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 'img_2',
        product_id: 'prod_2',
        url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
        alt_text: 'iPhone 15 Pro Max',
        is_primary: true,
        sort_order: 1,
        created_at: '2024-01-10T08:00:00Z'
      }
    ];

    const productVariants = [
      {
        id: 'var_1',
        product_id: 'prod_1',
        name: 'Ağırlık',
        type: 'weight' as const,
        value: '1kg',
        price_modifier: 0,
        stock_quantity: 50,
        is_active: true,
        sort_order: 1,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 'var_2',
        product_id: 'prod_1',
        name: 'Ağırlık',
        type: 'weight' as const,
        value: '2kg',
        price_modifier: 15.0,
        stock_quantity: 30,
        is_active: true,
        sort_order: 2,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      }
    ];

    storage.set('products', products);
    storage.set('product_images', productImages);
    storage.set('product_variants', productVariants);
  }

  private initializeRestaurants(): void {
    const restaurants = [
      {
        id: 'rest_1',
        vendor_id: 'vendor_1',
        cuisine_type: 'Turkish',
        price_range: 2 as const,
        accepts_reservations: false,
        has_delivery: true,
        has_takeout: true,
        alcohol_served: false,
        outdoor_seating: false,
        wifi_available: true,
        parking_available: false,
        wheelchair_accessible: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    const restaurantMenus = [
      {
        id: 'menu_1',
        restaurant_id: 'rest_1',
        name: 'Ana Menü',
        description: 'Günlük menümüz',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    const menuCategories = [
      {
        id: 'mcat_1',
        menu_id: 'menu_1',
        name: 'Ana Yemekler',
        description: 'Doyurucu ana yemekler',
        sort_order: 1,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'mcat_2',
        menu_id: 'menu_1',
        name: 'İçecekler',
        description: 'Sıcak ve soğuk içecekler',
        sort_order: 2,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    const menuItems = [
      {
        id: 'item_1',
        menu_category_id: 'mcat_1',
        name: 'Adana Kebap',
        description: 'Geleneksel Adana kebap, pilav ve salata ile',
        price: 45.00,
        image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
        ingredients: 'Dana kıyma, biber, soğan, baharat',
        allergens: 'Gluten',
        calories: 650,
        preparation_time: 20,
        is_vegetarian: false,
        is_vegan: false,
        is_gluten_free: false,
        is_spicy: true,
        spice_level: 3,
        is_available: true,
        sort_order: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'item_2',
        menu_category_id: 'mcat_2',
        name: 'Ayran',
        description: 'Geleneksel Türk ayranı',
        price: 8.00,
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
        ingredients: 'Yoğurt, su, tuz',
        calories: 120,
        preparation_time: 2,
        is_vegetarian: true,
        is_vegan: false,
        is_gluten_free: true,
        is_spicy: false,
        is_available: true,
        sort_order: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    storage.set('restaurants', restaurants);
    storage.set('restaurant_menus', restaurantMenus);
    storage.set('menu_categories', menuCategories);
    storage.set('menu_items', menuItems);
  }

  private initializeCouriers(): void {
    const couriers = [
      {
        id: 'courier_1',
        user_id: 'user_3',
        vehicle_type: 'motorcycle' as const,
        license_number: 'ABC123456',
        vehicle_registration: '34ABC123',
        insurance_number: 'INS123456',
        is_online: true,
        current_latitude: 40.9903,
        current_longitude: 29.0275,
        max_delivery_distance: 15,
        hourly_rate: 25.0,
        commission_rate: 10.0,
        rating_average: 4.9,
        rating_count: 500,
        total_deliveries: 1200,
        total_earnings: 15000.0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      }
    ];

    const courierProfiles = [
      {
        id: 'cprofile_1',
        courier_id: 'courier_1',
        emergency_contact_name: 'Fatma Kurye',
        emergency_contact_phone: '+905551234570',
        bank_account_number: 'TR123456789012345678901234',
        bank_name: 'Ziraat Bankası',
        tax_number: '9876543210',
        working_hours: JSON.stringify({
          monday: { start: '09:00', end: '18:00' },
          tuesday: { start: '09:00', end: '18:00' },
          wednesday: { start: '09:00', end: '18:00' },
          thursday: { start: '09:00', end: '18:00' },
          friday: { start: '09:00', end: '18:00' },
          saturday: { start: '10:00', end: '16:00' },
          sunday: { start: '10:00', end: '16:00' }
        }),
        preferred_zones: JSON.stringify(['34710', '34711', '34712']),
        languages_spoken: 'Türkçe, İngilizce',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    const deliveryZones = [
      {
        id: 'zone_1',
        name: 'Kadıköy Merkez',
        description: 'Kadıköy merkez ve çevresi',
        polygon_coordinates: JSON.stringify([
          [40.9903, 29.0275],
          [40.9950, 29.0300],
          [40.9900, 29.0350],
          [40.9850, 29.0275]
        ]),
        delivery_fee: 5.0,
        minimum_order_amount: 25.0,
        estimated_delivery_time: 20,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    storage.set('couriers', couriers);
    storage.set('courier_profiles', courierProfiles);
    storage.set('delivery_zones', deliveryZones);
  }

  private initializeOrders(): void {
    const orders = [
      {
        id: 'order_1',
        order_number: 'ORD-2024-001',
        user_id: 'user_1',
        vendor_id: 'vendor_1',
        courier_id: 'courier_1',
        order_type: 'market' as const,
        status: 'delivered' as const,
        payment_status: 'paid' as const,
        subtotal: 45.98,
        tax_amount: 4.14,
        delivery_fee: 5.0,
        service_fee: 2.0,
        discount_amount: 5.0,
        total_amount: 52.12,
        currency: 'TRY',
        delivery_address_id: 'addr_1',
        delivery_type: 'express' as const,
        estimated_delivery_time: '2024-01-20T11:30:00Z',
        actual_delivery_time: '2024-01-20T11:25:00Z',
        special_instructions: 'Kapı zilini çalmayın, arayın',
        created_at: '2024-01-20T10:00:00Z',
        updated_at: '2024-01-20T11:25:00Z'
      }
    ];

    const orderItems = [
      {
        id: 'oitem_1',
        order_id: 'order_1',
        product_id: 'prod_1',
        variant_id: 'var_1',
        name: 'Organik Elma',
        description: '1kg organik elma',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200',
        quantity: 2,
        unit_price: 22.99,
        total_price: 45.98,
        created_at: '2024-01-20T10:00:00Z'
      }
    ];

    const orderTracking = [
      {
        id: 'track_1',
        order_id: 'order_1',
        status: 'confirmed',
        message: 'Siparişiniz onaylandı',
        created_at: '2024-01-20T10:05:00Z'
      },
      {
        id: 'track_2',
        order_id: 'order_1',
        status: 'preparing',
        message: 'Siparişiniz hazırlanıyor',
        created_at: '2024-01-20T10:10:00Z'
      },
      {
        id: 'track_3',
        order_id: 'order_1',
        status: 'picked_up',
        message: 'Kurye siparişinizi aldı',
        latitude: 40.9903,
        longitude: 29.0275,
        created_at: '2024-01-20T10:15:00Z'
      },
      {
        id: 'track_4',
        order_id: 'order_1',
        status: 'delivered',
        message: 'Siparişiniz teslim edildi',
        latitude: 40.9903,
        longitude: 29.0275,
        created_at: '2024-01-20T11:25:00Z'
      }
    ];

    const orderPayments = [
      {
        id: 'payment_1',
        order_id: 'order_1',
        payment_method: 'credit_card' as const,
        payment_provider: 'iyzico',
        transaction_id: 'TXN123456789',
        amount: 52.12,
        currency: 'TRY',
        status: 'completed' as const,
        gateway_response: JSON.stringify({
          status: 'success',
          transaction_id: 'TXN123456789',
          authorization_code: 'AUTH123'
        }),
        created_at: '2024-01-20T10:00:00Z',
        updated_at: '2024-01-20T10:01:00Z'
      }
    ];

    storage.set('orders', orders);
    storage.set('order_items', orderItems);
    storage.set('order_tracking', orderTracking);
    storage.set('order_payments', orderPayments);
  }

  private initializeCampaigns(): void {
    const campaigns = [
      {
        id: 'camp_1',
        name: 'Yeni Üye İndirimi',
        description: 'Yeni üyelere özel %20 indirim',
        type: 'discount' as const,
        target_audience: 'new_customers' as const,
        discount_type: 'percentage' as const,
        discount_value: 20,
        maximum_discount_amount: 50,
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-12-31T23:59:59Z',
        usage_limit: 1000,
        usage_count: 156,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      },
      {
        id: 'camp_2',
        name: 'Flash Sale - Elektronik',
        description: 'Elektronik ürünlerde %50 indirim',
        type: 'discount' as const,
        target_audience: 'all' as const,
        discount_type: 'percentage' as const,
        discount_value: 50,
        minimum_order_amount: 100,
        maximum_discount_amount: 200,
        applicable_categories: JSON.stringify(['cat_4']),
        start_date: '2024-01-20T00:00:00Z',
        end_date: '2024-01-22T23:59:59Z',
        usage_limit: 500,
        usage_count: 245,
        is_active: true,
        created_at: '2024-01-19T10:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      }
    ];

    const flashDeals = [
      {
        id: 'flash_1',
        product_id: 'prod_2',
        original_price: 1299.99,
        deal_price: 999.99,
        discount_percentage: 23,
        quantity_available: 50,
        quantity_sold: 12,
        start_time: '2024-01-20T10:00:00Z',
        end_time: '2024-01-20T22:00:00Z',
        is_active: true,
        created_at: '2024-01-20T09:00:00Z',
        updated_at: '2024-01-20T15:00:00Z'
      }
    ];

    storage.set('campaigns', campaigns);
    storage.set('flash_deals', flashDeals);
  }

  private initializeCoupons(): void {
    const coupons = [
      {
        id: 'coupon_1',
        code: 'WELCOME20',
        name: 'Hoş Geldin İndirimi',
        description: 'Yeni üyelere özel %20 indirim',
        type: 'percentage' as const,
        value: 20,
        maximum_discount_amount: 50,
        usage_limit: 1000,
        usage_limit_per_user: 1,
        usage_count: 156,
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-12-31T23:59:59Z',
        is_active: true,
        created_by: 'user_4',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      },
      {
        id: 'coupon_2',
        code: 'SAVE10',
        name: '10 TL İndirim',
        description: '100 TL üzeri siparişlerde 10 TL indirim',
        type: 'fixed_amount' as const,
        value: 10,
        minimum_order_amount: 100,
        usage_limit: 500,
        usage_count: 89,
        start_date: '2024-01-15T00:00:00Z',
        end_date: '2024-02-15T23:59:59Z',
        is_active: true,
        created_by: 'user_4',
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      }
    ];

    const userCoupons = [
      {
        id: 'ucoupon_1',
        user_id: 'user_1',
        coupon_id: 'coupon_1',
        usage_count: 1,
        first_used_at: '2024-01-20T10:00:00Z',
        last_used_at: '2024-01-20T10:00:00Z',
        created_at: '2024-01-01T00:00:00Z'
      }
    ];

    storage.set('coupons', coupons);
    storage.set('user_coupons', userCoupons);
  }

  private initializeNotifications(): void {
    const notifications = [
      {
        id: 'notif_1',
        type: 'order_update' as const,
        title: 'Siparişiniz Teslim Edildi',
        message: 'ORD-2024-001 numaralı siparişiniz başarıyla teslim edildi.',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200',
        action_url: '/orders/order_1',
        target_audience: 'specific_users' as const,
        target_user_ids: JSON.stringify(['user_1']),
        send_via_email: true,
        send_via_sms: true,
        send_via_push: true,
        sent_at: '2024-01-20T11:25:00Z',
        is_active: true,
        created_by: 'system',
        created_at: '2024-01-20T11:25:00Z',
        updated_at: '2024-01-20T11:25:00Z'
      },
      {
        id: 'notif_2',
        type: 'promotion' as const,
        title: 'Flash Sale Başladı!',
        message: 'Elektronik ürünlerde %50 indirim! Kaçırmayın!',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200',
        action_url: '/flash-deals',
        target_audience: 'all' as const,
        send_via_email: false,
        send_via_sms: false,
        send_via_push: true,
        sent_at: '2024-01-20T10:00:00Z',
        is_active: true,
        created_by: 'user_4',
        created_at: '2024-01-20T09:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      }
    ];

    const userNotifications = [
      {
        id: 'unotif_1',
        user_id: 'user_1',
        notification_id: 'notif_1',
        is_read: true,
        read_at: '2024-01-20T11:30:00Z',
        is_clicked: true,
        clicked_at: '2024-01-20T11:30:00Z',
        delivered_at: '2024-01-20T11:25:00Z'
      },
      {
        id: 'unotif_2',
        user_id: 'user_1',
        notification_id: 'notif_2',
        is_read: false,
        is_clicked: false,
        delivered_at: '2024-01-20T10:00:00Z'
      }
    ];

    storage.set('notifications', notifications);
    storage.set('user_notifications', userNotifications);
  }

  private initializeSystemSettings(): void {
    const systemSettings = [
      {
        id: 'setting_1',
        key: 'platform_name',
        value: 'cebeuygun.com',
        type: 'string' as const,
        description: 'Platform adı',
        is_public: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'setting_2',
        key: 'default_currency',
        value: 'TRY',
        type: 'string' as const,
        description: 'Varsayılan para birimi',
        is_public: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'setting_3',
        key: 'min_order_amount',
        value: '25',
        type: 'number' as const,
        description: 'Minimum sipariş tutarı',
        is_public: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'setting_4',
        key: 'free_delivery_threshold',
        value: '100',
        type: 'number' as const,
        description: 'Ücretsiz kargo limiti',
        is_public: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'setting_5',
        key: 'express_delivery_time',
        value: '30',
        type: 'number' as const,
        description: 'Hızlı teslimat süresi (dakika)',
        is_public: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    const paymentMethods = [
      {
        id: 'pm_1',
        name: 'Kredi Kartı',
        type: 'credit_card' as const,
        provider: 'iyzico',
        is_active: true,
        configuration: JSON.stringify({
          api_key: 'sandbox-api-key',
          secret_key: 'sandbox-secret-key',
          base_url: 'https://sandbox-api.iyzipay.com'
        }),
        supported_currencies: JSON.stringify(['TRY', 'USD', 'EUR']),
        processing_fee_percentage: 2.5,
        processing_fee_fixed: 0.5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'pm_2',
        name: 'Kapıda Ödeme',
        type: 'cash_on_delivery' as const,
        provider: 'internal',
        is_active: true,
        supported_currencies: JSON.stringify(['TRY']),
        processing_fee_percentage: 0,
        processing_fee_fixed: 2.0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    const shippingMethods = [
      {
        id: 'sm_1',
        name: 'Hızlı Teslimat',
        description: '10-30 dakikada teslim',
        type: 'express' as const,
        base_cost: 5.0,
        cost_per_km: 0.5,
        free_shipping_threshold: 100.0,
        estimated_delivery_time_min: 10,
        estimated_delivery_time_max: 30,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'sm_2',
        name: 'Standart Teslimat',
        description: '1-3 saat içinde teslim',
        type: 'standard' as const,
        base_cost: 3.0,
        cost_per_km: 0.3,
        free_shipping_threshold: 75.0,
        estimated_delivery_time_min: 60,
        estimated_delivery_time_max: 180,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    const taxRates = [
      {
        id: 'tax_1',
        name: 'KDV %18',
        rate: 18.0,
        type: 'percentage' as const,
        applicable_to: 'all' as const,
        country: 'Turkey',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'tax_2',
        name: 'KDV %8 (Gıda)',
        rate: 8.0,
        type: 'percentage' as const,
        applicable_to: 'products' as const,
        country: 'Turkey',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    storage.set('system_settings', systemSettings);
    storage.set('payment_methods', paymentMethods);
    storage.set('shipping_methods', shippingMethods);
    storage.set('tax_rates', taxRates);
  }

  private initializeAnalytics(): void {
    const analyticsEvents = [
      {
        id: 'event_1',
        user_id: 'user_1',
        session_id: 'sess_123456',
        event_type: 'page_view',
        event_name: 'product_view',
        properties: JSON.stringify({
          product_id: 'prod_1',
          product_name: 'Organik Elma',
          category: 'Meyve & Sebze',
          price: 22.99
        }),
        page_url: '/product/organik-elma',
        referrer: 'https://google.com',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ip_address: '192.168.1.1',
        country: 'Turkey',
        city: 'Istanbul',
        device_type: 'desktop',
        browser: 'Chrome',
        os: 'Windows',
        created_at: '2024-01-20T10:00:00Z'
      },
      {
        id: 'event_2',
        user_id: 'user_1',
        session_id: 'sess_123456',
        event_type: 'action',
        event_name: 'add_to_cart',
        properties: JSON.stringify({
          product_id: 'prod_1',
          quantity: 2,
          price: 22.99,
          total: 45.98
        }),
        page_url: '/product/organik-elma',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ip_address: '192.168.1.1',
        country: 'Turkey',
        city: 'Istanbul',
        device_type: 'desktop',
        browser: 'Chrome',
        os: 'Windows',
        created_at: '2024-01-20T10:05:00Z'
      }
    ];

    const salesReports = [
      {
        id: 'report_1',
        report_date: '2024-01-20',
        vendor_id: 'vendor_1',
        total_orders: 25,
        total_revenue: 1250.75,
        total_items_sold: 85,
        average_order_value: 50.03,
        new_customers: 5,
        returning_customers: 20,
        cancellation_rate: 2.5,
        refund_rate: 1.0,
        created_at: '2024-01-21T00:00:00Z'
      },
      {
        id: 'report_2',
        report_date: '2024-01-20',
        category_id: 'cat_2',
        total_orders: 15,
        total_revenue: 450.25,
        total_items_sold: 35,
        average_order_value: 30.02,
        new_customers: 3,
        returning_customers: 12,
        cancellation_rate: 1.5,
        refund_rate: 0.5,
        created_at: '2024-01-21T00:00:00Z'
      }
    ];

    const userActivities = [
      {
        id: 'activity_1',
        user_id: 'user_1',
        activity_type: 'login' as const,
        description: 'Kullanıcı sisteme giriş yaptı',
        metadata: JSON.stringify({
          login_method: 'email',
          device: 'desktop',
          browser: 'Chrome'
        }),
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: '2024-01-20T09:00:00Z'
      },
      {
        id: 'activity_2',
        user_id: 'user_1',
        activity_type: 'order_placed' as const,
        description: 'Kullanıcı sipariş verdi',
        metadata: JSON.stringify({
          order_id: 'order_1',
          order_total: 52.12,
          payment_method: 'credit_card'
        }),
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: '2024-01-20T10:00:00Z'
      }
    ];

    storage.set('analytics_events', analyticsEvents);
    storage.set('sales_reports', salesReports);
    storage.set('user_activities', userActivities);
  }

  // Database query methods
  getTable<T>(tableName: keyof DatabaseSchema): T[] {
    return storage.get(tableName) || [];
  }

  setTable<T>(tableName: keyof DatabaseSchema, data: T[]): void {
    storage.set(tableName, data);
  }

  // Generic CRUD operations
  insert<T extends { id: string }>(tableName: keyof DatabaseSchema, record: T): T {
    const table = this.getTable<T>(tableName);
    table.push(record);
    this.setTable(tableName, table);
    return record;
  }

  findById<T extends { id: string }>(tableName: keyof DatabaseSchema, id: string): T | null {
    const table = this.getTable<T>(tableName);
    return table.find(record => record.id === id) || null;
  }

  findMany<T>(tableName: keyof DatabaseSchema, filter?: (record: T) => boolean): T[] {
    const table = this.getTable<T>(tableName);
    return filter ? table.filter(filter) : table;
  }

  update<T extends { id: string }>(tableName: keyof DatabaseSchema, id: string, updates: Partial<T>): T | null {
    const table = this.getTable<T>(tableName);
    const index = table.findIndex(record => record.id === id);
    
    if (index === -1) return null;
    
    table[index] = { ...table[index], ...updates };
    this.setTable(tableName, table);
    return table[index];
  }

  delete<T extends { id: string }>(tableName: keyof DatabaseSchema, id: string): boolean {
    const table = this.getTable<T>(tableName);
    const index = table.findIndex(record => record.id === id);
    
    if (index === -1) return false;
    
    table.splice(index, 1);
    this.setTable(tableName, table);
    return true;
  }

  // Relationship queries
  findByForeignKey<T extends Record<string, any>>(
    tableName: keyof DatabaseSchema, 
    foreignKey: string, 
    value: string
  ): T[] {
    const table = this.getTable<T>(tableName);
    return table.filter(record => record[foreignKey] === value);
  }

  // Complex queries
  findProductsWithDetails(filters?: {
    categoryId?: string;
    vendorId?: string;
    isActive?: boolean;
    inStock?: boolean;
  }) {
    const products = this.getTable('products');
    const categories = this.getTable('categories');
    const brands = this.getTable('brands');
    const productImages = this.getTable('product_images');
    const productVariants = this.getTable('product_variants');

    let filteredProducts = products;

    if (filters) {
      if (filters.categoryId) {
        filteredProducts = filteredProducts.filter(p => p.category_id === filters.categoryId);
      }
      if (filters.vendorId) {
        filteredProducts = filteredProducts.filter(p => p.vendor_id === filters.vendorId);
      }
      if (filters.isActive !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.is_active === filters.isActive);
      }
      if (filters.inStock) {
        filteredProducts = filteredProducts.filter(p => p.stock_quantity > 0);
      }
    }

    return filteredProducts.map(product => ({
      ...product,
      category: categories.find(c => c.id === product.category_id),
      brand: brands.find(b => b.id === product.brand_id),
      images: productImages.filter(img => img.product_id === product.id),
      variants: productVariants.filter(v => v.product_id === product.id)
    }));
  }

  findOrdersWithDetails(userId?: string) {
    const orders = this.getTable('orders');
    const orderItems = this.getTable('order_items');
    const orderTracking = this.getTable('order_tracking');
    const orderPayments = this.getTable('order_payments');
    const users = this.getTable('users');
    const vendors = this.getTable('vendors');
    const couriers = this.getTable('couriers');

    let filteredOrders = orders;
    if (userId) {
      filteredOrders = filteredOrders.filter(o => o.user_id === userId);
    }

    return filteredOrders.map(order => ({
      ...order,
      items: orderItems.filter(item => item.order_id === order.id),
      tracking: orderTracking.filter(track => track.order_id === order.id),
      payments: orderPayments.filter(payment => payment.order_id === order.id),
      customer: users.find(u => u.id === order.user_id),
      vendor: vendors.find(v => v.id === order.vendor_id),
      courier: order.courier_id ? couriers.find(c => c.id === order.courier_id) : null
    }));
  }

  // Analytics queries
  getDashboardStats() {
    const orders = this.getTable('orders');
    const users = this.getTable('users');
    const products = this.getTable('products');
    const vendors = this.getTable('vendors');

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const totalCustomers = users.filter(u => u.role === 'customer').length;
    const totalVendors = vendors.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.created_at.startsWith(today));
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total_amount, 0);

    return {
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalVendors,
      averageOrderValue,
      todayOrders: todayOrders.length,
      todayRevenue,
      activeProducts: products.filter(p => p.is_active).length,
      lowStockProducts: products.filter(p => p.stock_quantity <= p.min_stock_level).length
    };
  }
}

// Export singleton instance
export const mockDB = MockDatabase.getInstance();
