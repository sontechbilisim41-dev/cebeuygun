
// Seed Data Generator for Cebeuygun.com Platform
// This generates realistic sample data for development and testing

import { mockDB } from './mockDatabase';

export class SeedDataGenerator {
  private static instance: SeedDataGenerator;
  
  static getInstance(): SeedDataGenerator {
    if (!SeedDataGenerator.instance) {
      SeedDataGenerator.instance = new SeedDataGenerator();
    }
    return SeedDataGenerator.instance;
  }

  // Generate additional sample data
  generateSampleData(): void {
    this.generateMoreUsers();
    this.generateMoreProducts();
    this.generateMoreOrders();
    this.generateMoreReviews();
    this.generateMoreNotifications();
    this.generateAnalyticsData();
  }

  private generateMoreUsers(): void {
    const additionalUsers = [
      // More customers
      {
        id: 'user_5',
        email: 'ayse.kaya@example.com',
        password_hash: 'hashed_password',
        name: 'Ayşe Kaya',
        phone: '+905551234571',
        role: 'customer' as const,
        status: 'active' as const,
        email_verified: true,
        phone_verified: true,
        created_at: '2024-01-05T00:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      },
      {
        id: 'user_6',
        email: 'mehmet.demir@example.com',
        password_hash: 'hashed_password',
        name: 'Mehmet Demir',
        phone: '+905551234572',
        role: 'customer' as const,
        status: 'active' as const,
        email_verified: true,
        phone_verified: false,
        created_at: '2024-01-08T00:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      },
      // More vendors
      {
        id: 'user_7',
        email: 'pizza.palace@example.com',
        password_hash: 'hashed_password',
        name: 'Pizza Palace Restaurant',
        phone: '+905551234573',
        role: 'vendor' as const,
        status: 'active' as const,
        email_verified: true,
        phone_verified: true,
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      },
      {
        id: 'user_8',
        email: 'tech.store@example.com',
        password_hash: 'hashed_password',
        name: 'Tech Store Electronics',
        phone: '+905551234574',
        role: 'vendor' as const,
        status: 'active' as const,
        email_verified: true,
        phone_verified: true,
        created_at: '2024-01-04T00:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      },
      // More couriers
      {
        id: 'user_9',
        email: 'fatma.courier@example.com',
        password_hash: 'hashed_password',
        name: 'Fatma Özkan',
        phone: '+905551234575',
        role: 'courier' as const,
        status: 'active' as const,
        email_verified: true,
        phone_verified: true,
        created_at: '2024-01-06T00:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      }
    ];

    const existingUsers = mockDB.getTable('users');
    mockDB.setTable('users', [...existingUsers, ...additionalUsers]);

    // Add user profiles
    const additionalProfiles = [
      {
        id: 'profile_2',
        user_id: 'user_5',
        first_name: 'Ayşe',
        last_name: 'Kaya',
        date_of_birth: '1985-03-20',
        gender: 'female' as const,
        nationality: 'Turkish',
        language: 'tr',
        timezone: 'Europe/Istanbul',
        loyalty_points: 850,
        total_spent: 1200.50,
        order_count: 8,
        referral_code: 'AYSE456',
        created_at: '2024-01-05T00:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      },
      {
        id: 'profile_3',
        user_id: 'user_6',
        first_name: 'Mehmet',
        last_name: 'Demir',
        date_of_birth: '1992-07-10',
        gender: 'male' as const,
        nationality: 'Turkish',
        language: 'tr',
        timezone: 'Europe/Istanbul',
        loyalty_points: 320,
        total_spent: 450.25,
        order_count: 3,
        referral_code: 'MEHMET789',
        created_at: '2024-01-08T00:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      }
    ];

    const existingProfiles = mockDB.getTable('user_profiles');
    mockDB.setTable('user_profiles', [...existingProfiles, ...additionalProfiles]);
  }

  private generateMoreProducts(): void {
    const additionalProducts = [
      // More grocery products
      {
        id: 'prod_3',
        vendor_id: 'vendor_1',
        category_id: 'cat_2',
        brand_id: 'brand_1',
        name: 'Organik Domates',
        slug: 'organik-domates',
        description: 'Taze organik domates, salata ve yemeklik',
        short_description: 'Organik domates - 1kg',
        sku: 'TOMATO-ORG-001',
        base_price: 18.99,
        sale_price: 16.99,
        stock_quantity: 75,
        min_stock_level: 15,
        weight: 1.0,
        is_active: true,
        is_featured: false,
        rating_average: 4.6,
        rating_count: 89,
        sold_count: 456,
        view_count: 2100,
        tags: 'organik,domates,taze,sebze',
        created_at: '2024-01-16T10:00:00Z',
        updated_at: '2024-01-20T15:30:00Z'
      },
      {
        id: 'prod_4',
        vendor_id: 'vendor_1',
        category_id: 'cat_3',
        brand_id: 'brand_1',
        name: 'Organik Süt',
        slug: 'organik-sut',
        description: 'Çiftlikten taze organik süt, 1 litre',
        short_description: 'Organik süt - 1L',
        sku: 'MILK-ORG-001',
        base_price: 12.99,
        stock_quantity: 50,
        min_stock_level: 10,
        weight: 1.0,
        is_active: true,
        is_featured: true,
        cold_chain_required: true,
        rating_average: 4.9,
        rating_count: 234,
        sold_count: 1890,
        view_count: 5600,
        tags: 'organik,süt,taze,soğuk',
        created_at: '2024-01-14T10:00:00Z',
        updated_at: '2024-01-20T15:30:00Z'
      },
      // Electronics
      {
        id: 'prod_5',
        vendor_id: 'vendor_1',
        category_id: 'cat_4',
        brand_id: 'brand_2',
        name: 'MacBook Air M2',
        slug: 'macbook-air-m2',
        description: 'Apple MacBook Air 13" M2 çip, 8GB RAM, 256GB SSD',
        short_description: 'MacBook Air M2 - 256GB',
        sku: 'MACBOOK-AIR-M2-256',
        base_price: 1199.99,
        stock_quantity: 15,
        min_stock_level: 3,
        weight: 1.24,
        is_active: true,
        is_featured: true,
        rating_average: 4.8,
        rating_count: 156,
        sold_count: 89,
        view_count: 8900,
        tags: 'laptop,apple,macbook,m2',
        created_at: '2024-01-12T10:00:00Z',
        updated_at: '2024-01-20T15:30:00Z'
      }
    ];

    const existingProducts = mockDB.getTable('products');
    mockDB.setTable('products', [...existingProducts, ...additionalProducts]);

    // Add product images
    const additionalImages = [
      {
        id: 'img_3',
        product_id: 'prod_3',
        url: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=600',
        alt_text: 'Organik Domates',
        is_primary: true,
        sort_order: 1,
        created_at: '2024-01-16T10:00:00Z'
      },
      {
        id: 'img_4',
        product_id: 'prod_4',
        url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600',
        alt_text: 'Organik Süt',
        is_primary: true,
        sort_order: 1,
        created_at: '2024-01-14T10:00:00Z'
      },
      {
        id: 'img_5',
        product_id: 'prod_5',
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
        alt_text: 'MacBook Air M2',
        is_primary: true,
        sort_order: 1,
        created_at: '2024-01-12T10:00:00Z'
      }
    ];

    const existingImages = mockDB.getTable('product_images');
    mockDB.setTable('product_images', [...existingImages, ...additionalImages]);
  }

  private generateMoreOrders(): void {
    const additionalOrders = [
      {
        id: 'order_2',
        order_number: 'ORD-2024-002',
        user_id: 'user_5',
        vendor_id: 'vendor_1',
        courier_id: 'courier_1',
        order_type: 'market' as const,
        status: 'in_transit' as const,
        payment_status: 'paid' as const,
        subtotal: 29.98,
        tax_amount: 2.70,
        delivery_fee: 5.0,
        service_fee: 2.0,
        discount_amount: 0,
        total_amount: 39.68,
        currency: 'TRY',
        delivery_address_id: 'addr_1',
        delivery_type: 'express' as const,
        estimated_delivery_time: '2024-01-21T14:30:00Z',
        special_instructions: 'Apartman kapısından arayın',
        created_at: '2024-01-21T13:00:00Z',
        updated_at: '2024-01-21T13:45:00Z'
      },
      {
        id: 'order_3',
        order_number: 'ORD-2024-003',
        user_id: 'user_6',
        vendor_id: 'vendor_1',
        order_type: 'marketplace' as const,
        status: 'confirmed' as const,
        payment_status: 'paid' as const,
        subtotal: 1199.99,
        tax_amount: 216.00,
        delivery_fee: 0,
        service_fee: 5.0,
        discount_amount: 50.0,
        total_amount: 1370.99,
        currency: 'TRY',
        delivery_address_id: 'addr_1',
        delivery_type: 'standard' as const,
        estimated_delivery_time: '2024-01-22T16:00:00Z',
        created_at: '2024-01-21T10:00:00Z',
        updated_at: '2024-01-21T10:15:00Z'
      }
    ];

    const existingOrders = mockDB.getTable('orders');
    mockDB.setTable('orders', [...existingOrders, ...additionalOrders]);

    // Add order items
    const additionalOrderItems = [
      {
        id: 'oitem_2',
        order_id: 'order_2',
        product_id: 'prod_3',
        name: 'Organik Domates',
        description: '1kg organik domates',
        image: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=200',
        quantity: 1,
        unit_price: 16.99,
        total_price: 16.99,
        created_at: '2024-01-21T13:00:00Z'
      },
      {
        id: 'oitem_3',
        order_id: 'order_2',
        product_id: 'prod_4',
        name: 'Organik Süt',
        description: '1L organik süt',
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200',
        quantity: 1,
        unit_price: 12.99,
        total_price: 12.99,
        created_at: '2024-01-21T13:00:00Z'
      },
      {
        id: 'oitem_4',
        order_id: 'order_3',
        product_id: 'prod_5',
        name: 'MacBook Air M2',
        description: 'MacBook Air 13" M2 çip, 256GB',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200',
        quantity: 1,
        unit_price: 1199.99,
        total_price: 1199.99,
        created_at: '2024-01-21T10:00:00Z'
      }
    ];

    const existingOrderItems = mockDB.getTable('order_items');
    mockDB.setTable('order_items', [...existingOrderItems, ...additionalOrderItems]);
  }

  private generateMoreReviews(): void {
    const additionalReviews = [
      {
        id: 'review_1',
        product_id: 'prod_1',
        user_id: 'user_5',
        order_id: 'order_1',
        rating: 5,
        title: 'Çok taze ve lezzetli',
        comment: 'Elmalar gerçekten çok taze ve organik olduğu belli. Kesinlikle tekrar alacağım.',
        is_verified: true,
        is_approved: true,
        helpful_count: 12,
        created_at: '2024-01-21T10:00:00Z',
        updated_at: '2024-01-21T10:00:00Z'
      },
      {
        id: 'review_2',
        product_id: 'prod_4',
        user_id: 'user_1',
        rating: 5,
        title: 'Harika süt',
        comment: 'Tadı çok güzel, çocuklarım çok seviyor. Organik olması da büyük artı.',
        is_verified: false,
        is_approved: true,
        helpful_count: 8,
        created_at: '2024-01-20T15:00:00Z',
        updated_at: '2024-01-20T15:00:00Z'
      },
      {
        id: 'review_3',
        product_id: 'prod_2',
        user_id: 'user_6',
        rating: 4,
        title: 'Güzel telefon ama pahalı',
        comment: 'Telefon gerçekten çok iyi ama fiyatı biraz yüksek. Kamera kalitesi mükemmel.',
        is_verified: false,
        is_approved: true,
        helpful_count: 15,
        created_at: '2024-01-19T12:00:00Z',
        updated_at: '2024-01-19T12:00:00Z'
      }
    ];

    const existingReviews = mockDB.getTable('product_reviews');
    mockDB.setTable('product_reviews', [...existingReviews, ...additionalReviews]);
  }

  private generateMoreNotifications(): void {
    const additionalNotifications = [
      {
        id: 'notif_3',
        type: 'promotion' as const,
        title: 'Organik Ürünlerde %25 İndirim',
        message: 'Tüm organik ürünlerde geçerli %25 indirim fırsatını kaçırmayın!',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200',
        action_url: '/category/organic',
        target_audience: 'all' as const,
        send_via_email: true,
        send_via_sms: false,
        send_via_push: true,
        sent_at: '2024-01-21T09:00:00Z',
        is_active: true,
        created_by: 'user_4',
        created_at: '2024-01-21T08:00:00Z',
        updated_at: '2024-01-21T09:00:00Z'
      },
      {
        id: 'notif_4',
        type: 'order_update' as const,
        title: 'Siparişiniz Yolda',
        message: 'ORD-2024-002 numaralı siparişiniz kurye tarafından alındı ve size doğru yola çıktı.',
        action_url: '/orders/order_2',
        target_audience: 'specific_users' as const,
        target_user_ids: JSON.stringify(['user_5']),
        send_via_email: true,
        send_via_sms: true,
        send_via_push: true,
        sent_at: '2024-01-21T13:45:00Z',
        is_active: true,
        created_by: 'system',
        created_at: '2024-01-21T13:45:00Z',
        updated_at: '2024-01-21T13:45:00Z'
      }
    ];

    const existingNotifications = mockDB.getTable('notifications');
    mockDB.setTable('notifications', [...existingNotifications, ...additionalNotifications]);

    // Add user notifications
    const additionalUserNotifications = [
      {
        id: 'unotif_3',
        user_id: 'user_1',
        notification_id: 'notif_3',
        is_read: false,
        is_clicked: false,
        delivered_at: '2024-01-21T09:00:00Z'
      },
      {
        id: 'unotif_4',
        user_id: 'user_5',
        notification_id: 'notif_3',
        is_read: true,
        read_at: '2024-01-21T09:30:00Z',
        is_clicked: true,
        clicked_at: '2024-01-21T09:30:00Z',
        delivered_at: '2024-01-21T09:00:00Z'
      },
      {
        id: 'unotif_5',
        user_id: 'user_5',
        notification_id: 'notif_4',
        is_read: false,
        is_clicked: false,
        delivered_at: '2024-01-21T13:45:00Z'
      }
    ];

    const existingUserNotifications = mockDB.getTable('user_notifications');
    mockDB.setTable('user_notifications', [...existingUserNotifications, ...additionalUserNotifications]);
  }

  private generateAnalyticsData(): void {
    // Generate more analytics events
    const additionalEvents = [
      {
        id: 'event_3',
        user_id: 'user_5',
        session_id: 'sess_789012',
        event_type: 'page_view',
        event_name: 'category_view',
        properties: JSON.stringify({
          category_id: 'cat_2',
          category_name: 'Meyve & Sebze'
        }),
        page_url: '/category/meyve-sebze',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        ip_address: '192.168.1.2',
        country: 'Turkey',
        city: 'Istanbul',
        device_type: 'mobile',
        browser: 'Safari',
        os: 'iOS',
        created_at: '2024-01-21T12:00:00Z'
      },
      {
        id: 'event_4',
        user_id: 'user_6',
        session_id: 'sess_345678',
        event_type: 'action',
        event_name: 'purchase',
        properties: JSON.stringify({
          order_id: 'order_3',
          total_amount: 1370.99,
          items_count: 1,
          payment_method: 'credit_card'
        }),
        page_url: '/checkout/success',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ip_address: '192.168.1.3',
        country: 'Turkey',
        city: 'Ankara',
        device_type: 'desktop',
        browser: 'Chrome',
        os: 'Windows',
        created_at: '2024-01-21T10:15:00Z'
      }
    ];

    const existingEvents = mockDB.getTable('analytics_events');
    mockDB.setTable('analytics_events', [...existingEvents, ...additionalEvents]);

    // Generate more sales reports
    const additionalReports = [
      {
        id: 'report_3',
        report_date: '2024-01-21',
        vendor_id: 'vendor_1',
        total_orders: 18,
        total_revenue: 890.45,
        total_items_sold: 45,
        average_order_value: 49.47,
        new_customers: 3,
        returning_customers: 15,
        cancellation_rate: 1.8,
        refund_rate: 0.5,
        created_at: '2024-01-22T00:00:00Z'
      },
      {
        id: 'report_4',
        report_date: '2024-01-21',
        category_id: 'cat_4',
        total_orders: 5,
        total_revenue: 1370.99,
        total_items_sold: 5,
        average_order_value: 274.20,
        new_customers: 2,
        returning_customers: 3,
        cancellation_rate: 0.0,
        refund_rate: 0.0,
        created_at: '2024-01-22T00:00:00Z'
      }
    ];

    const existingReports = mockDB.getTable('sales_reports');
    mockDB.setTable('sales_reports', [...existingReports, ...additionalReports]);
  }

  // Clear all data (for testing)
  clearAllData(): void {
    const tables = [
      'users', 'user_profiles', 'user_addresses', 'user_preferences',
      'categories', 'products', 'product_images', 'product_variants', 'product_reviews', 'brands',
      'vendors', 'vendor_profiles', 'restaurants', 'restaurant_menus', 'menu_items', 'menu_categories',
      'orders', 'order_items', 'order_tracking', 'order_payments',
      'carts', 'cart_items', 'wishlists', 'wishlist_items',
      'couriers', 'courier_profiles', 'deliveries', 'delivery_tracking', 'delivery_zones',
      'campaigns', 'coupons', 'user_coupons', 'flash_deals',
      'notifications', 'user_notifications', 'support_tickets', 'support_messages',
      'analytics_events', 'sales_reports', 'user_activities',
      'system_settings', 'payment_methods', 'shipping_methods', 'tax_rates'
    ];

    tables.forEach(table => {
      mockDB.setTable(table as any, []);
    });
  }

  // Reset to initial state
  resetToInitialState(): void {
    this.clearAllData();
    mockDB.initializeDatabase();
  }
}

// Export singleton instance
export const seedGenerator = SeedDataGenerator.getInstance();
