
// Database Query Helper Functions for Cebeuygun.com Platform
// This provides high-level query functions for common operations

import { mockDB } from './mockDatabase';
import type { 
  User, 
  Product, 
  Order, 
  Category, 
  Vendor, 
  Courier,
  Campaign,
  Coupon,
  Notification
} from './schema';

// User Queries
export const userQueries = {
  // Get user by email (for login)
  findByEmail: (email: string): User | null => {
    const users = mockDB.getTable<User>('users');
    return users.find(user => user.email === email) || null;
  },

  // Get user profile with addresses and preferences
  getProfile: (userId: string) => {
    const user = mockDB.findById<User>('users', userId);
    if (!user) return null;

    const profile = mockDB.findByForeignKey('user_profiles', 'user_id', userId)[0];
    const addresses = mockDB.findByForeignKey('user_addresses', 'user_id', userId);
    const preferences = mockDB.findByForeignKey('user_preferences', 'user_id', userId)[0];

    return {
      ...user,
      profile,
      addresses,
      preferences
    };
  },

  // Get user's order history
  getOrderHistory: (userId: string) => {
    return mockDB.findOrdersWithDetails(userId);
  },

  // Get user's notifications
  getNotifications: (userId: string) => {
    const userNotifications = mockDB.findByForeignKey('user_notifications', 'user_id', userId);
    const notifications = mockDB.getTable('notifications');
    
    return userNotifications.map(un => ({
      ...un,
      notification: notifications.find(n => n.id === un.notification_id)
    })).filter(n => n.notification);
  }
};

// Product Queries
export const productQueries = {
  // Get products with full details (category, brand, images, variants)
  getWithDetails: (filters?: {
    categoryId?: string;
    vendorId?: string;
    isActive?: boolean;
    inStock?: boolean;
    featured?: boolean;
    search?: string;
  }) => {
    return mockDB.findProductsWithDetails(filters);
  },

  // Get product by ID with full details
  getById: (productId: string) => {
    const products = mockDB.findProductsWithDetails();
    return products.find(p => p.id === productId) || null;
  },

  // Get featured products
  getFeatured: (limit: number = 8) => {
    const products = mockDB.findProductsWithDetails({ isActive: true });
    return products.filter(p => p.is_featured).slice(0, limit);
  },

  // Get best selling products
  getBestSellers: (limit: number = 8) => {
    const products = mockDB.findProductsWithDetails({ isActive: true });
    return products.sort((a, b) => b.sold_count - a.sold_count).slice(0, limit);
  },

  // Get new arrivals
  getNewArrivals: (limit: number = 8) => {
    const products = mockDB.findProductsWithDetails({ isActive: true });
    return products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, limit);
  },

  // Get products on sale
  getOnSale: (limit: number = 8) => {
    const products = mockDB.findProductsWithDetails({ isActive: true });
    return products.filter(p => p.sale_price && p.sale_price < p.base_price).slice(0, limit);
  },

  // Search products
  search: (query: string, filters?: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
  }) => {
    const products = mockDB.findProductsWithDetails({ isActive: true, ...filters });
    
    if (!query) return products;
    
    const searchTerm = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.tags?.toLowerCase().includes(searchTerm) ||
      product.brand?.name.toLowerCase().includes(searchTerm)
    );
  }
};

// Category Queries
export const categoryQueries = {
  // Get all active categories with hierarchy
  getHierarchy: () => {
    const categories = mockDB.getTable<Category>('categories').filter(c => c.is_active);
    const rootCategories = categories.filter(c => c.level === 0);
    
    return rootCategories.map(root => ({
      ...root,
      children: categories.filter(c => c.parent_id === root.id)
    }));
  },

  // Get category with products
  getWithProducts: (categoryId: string) => {
    const category = mockDB.findById<Category>('categories', categoryId);
    if (!category) return null;

    const products = mockDB.findProductsWithDetails({ categoryId, isActive: true });
    
    return {
      ...category,
      products
    };
  }
};

// Vendor Queries
export const vendorQueries = {
  // Get vendor with profile and products
  getWithDetails: (vendorId: string) => {
    const vendor = mockDB.findById<Vendor>('vendors', vendorId);
    if (!vendor) return null;

    const profile = mockDB.findByForeignKey('vendor_profiles', 'vendor_id', vendorId)[0];
    const products = mockDB.findProductsWithDetails({ vendorId, isActive: true });
    const user = mockDB.findById<User>('users', vendor.user_id);

    return {
      ...vendor,
      profile,
      products,
      user
    };
  },

  // Get all active vendors
  getActive: () => {
    const vendors = mockDB.getTable<Vendor>('vendors').filter(v => v.status === 'active');
    const vendorProfiles = mockDB.getTable('vendor_profiles');
    const users = mockDB.getTable<User>('users');

    return vendors.map(vendor => ({
      ...vendor,
      profile: vendorProfiles.find(p => p.vendor_id === vendor.id),
      user: users.find(u => u.id === vendor.user_id)
    }));
  }
};

// Order Queries
export const orderQueries = {
  // Get order with full details
  getWithDetails: (orderId: string) => {
    const orders = mockDB.findOrdersWithDetails();
    return orders.find(o => o.id === orderId) || null;
  },

  // Get orders by status
  getByStatus: (status: string, vendorId?: string) => {
    let orders = mockDB.findOrdersWithDetails();
    
    orders = orders.filter(o => o.status === status);
    
    if (vendorId) {
      orders = orders.filter(o => o.vendor_id === vendorId);
    }
    
    return orders;
  },

  // Get orders for courier
  getCourierOrders: (courierId: string, status?: string) => {
    let orders = mockDB.findOrdersWithDetails();
    
    orders = orders.filter(o => o.courier_id === courierId);
    
    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    
    return orders;
  },

  // Get recent orders
  getRecent: (limit: number = 10, vendorId?: string) => {
    let orders = mockDB.findOrdersWithDetails();
    
    if (vendorId) {
      orders = orders.filter(o => o.vendor_id === vendorId);
    }
    
    return orders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }
};

// Courier Queries
export const courierQueries = {
  // Get available couriers in area
  getAvailableInArea: (latitude: number, longitude: number, maxDistance: number = 10) => {
    const couriers = mockDB.getTable<Courier>('couriers').filter(c => c.is_online);
    const courierProfiles = mockDB.getTable('courier_profiles');
    const users = mockDB.getTable<User>('users');

    // Simple distance calculation (in real app, use proper geospatial queries)
    return couriers
      .filter(courier => {
        if (!courier.current_latitude || !courier.current_longitude) return false;
        
        const distance = Math.sqrt(
          Math.pow(courier.current_latitude - latitude, 2) + 
          Math.pow(courier.current_longitude - longitude, 2)
        ) * 111; // Rough km conversion
        
        return distance <= maxDistance;
      })
      .map(courier => ({
        ...courier,
        profile: courierProfiles.find(p => p.courier_id === courier.id),
        user: users.find(u => u.id === courier.user_id)
      }));
  },

  // Get courier with details
  getWithDetails: (courierId: string) => {
    const courier = mockDB.findById<Courier>('couriers', courierId);
    if (!courier) return null;

    const profile = mockDB.findByForeignKey('courier_profiles', 'courier_id', courierId)[0];
    const user = mockDB.findById<User>('users', courier.user_id);
    const activeDeliveries = mockDB.findByForeignKey('deliveries', 'courier_id', courierId)
      .filter(d => ['assigned', 'picked_up', 'in_transit'].includes(d.status));

    return {
      ...courier,
      profile,
      user,
      activeDeliveries
    };
  }
};

// Campaign and Coupon Queries
export const promotionQueries = {
  // Get active campaigns
  getActiveCampaigns: () => {
    const now = new Date().toISOString();
    return mockDB.getTable<Campaign>('campaigns').filter(c => 
      c.is_active && 
      c.start_date <= now && 
      c.end_date >= now
    );
  },

  // Get active coupons
  getActiveCoupons: () => {
    const now = new Date().toISOString();
    return mockDB.getTable<Coupon>('coupons').filter(c => 
      c.is_active && 
      c.start_date <= now && 
      c.end_date >= now
    );
  },

  // Validate coupon
  validateCoupon: (code: string, userId: string, orderAmount: number) => {
    const coupon = mockDB.getTable<Coupon>('coupons').find(c => c.code === code);
    
    if (!coupon || !coupon.is_active) {
      return { valid: false, error: 'Coupon not found or inactive' };
    }

    const now = new Date().toISOString();
    if (coupon.start_date > now || coupon.end_date < now) {
      return { valid: false, error: 'Coupon expired' };
    }

    if (coupon.minimum_order_amount && orderAmount < coupon.minimum_order_amount) {
      return { valid: false, error: `Minimum order amount is ${coupon.minimum_order_amount}` };
    }

    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return { valid: false, error: 'Coupon usage limit reached' };
    }

    // Check user-specific usage
    if (coupon.usage_limit_per_user) {
      const userUsage = mockDB.findByForeignKey('user_coupons', 'user_id', userId)
        .find(uc => uc.coupon_id === coupon.id);
      
      if (userUsage && userUsage.usage_count >= coupon.usage_limit_per_user) {
        return { valid: false, error: 'User usage limit reached' };
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (orderAmount * coupon.value) / 100;
      if (coupon.maximum_discount_amount) {
        discountAmount = Math.min(discountAmount, coupon.maximum_discount_amount);
      }
    } else {
      discountAmount = coupon.value;
    }

    return { 
      valid: true, 
      coupon, 
      discountAmount: Math.min(discountAmount, orderAmount)
    };
  }
};

// Analytics Queries
export const analyticsQueries = {
  // Get dashboard statistics
  getDashboardStats: () => {
    return mockDB.getDashboardStats();
  },

  // Get sales report for date range
  getSalesReport: (startDate: string, endDate: string, vendorId?: string) => {
    let reports = mockDB.getTable('sales_reports').filter(r => 
      r.report_date >= startDate && r.report_date <= endDate
    );

    if (vendorId) {
      reports = reports.filter(r => r.vendor_id === vendorId);
    }

    return reports;
  },

  // Get top products
  getTopProducts: (limit: number = 10, vendorId?: string) => {
    let products = mockDB.findProductsWithDetails({ isActive: true });
    
    if (vendorId) {
      products = products.filter(p => p.vendor_id === vendorId);
    }

    return products
      .sort((a, b) => b.sold_count - a.sold_count)
      .slice(0, limit);
  },

  // Get user activity
  getUserActivity: (userId: string, limit: number = 50) => {
    return mockDB.findByForeignKey('user_activities', 'user_id', userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }
};

// System Queries
export const systemQueries = {
  // Get system settings
  getSettings: () => {
    const settings = mockDB.getTable('system_settings');
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
  },

  // Get payment methods
  getPaymentMethods: () => {
    return mockDB.getTable('payment_methods').filter(pm => pm.is_active);
  },

  // Get shipping methods
  getShippingMethods: () => {
    return mockDB.getTable('shipping_methods').filter(sm => sm.is_active);
  },

  // Get delivery zones
  getDeliveryZones: () => {
    return mockDB.getTable('delivery_zones').filter(dz => dz.is_active);
  }
};

// Export all query modules
export const queries = {
  users: userQueries,
  products: productQueries,
  categories: categoryQueries,
  vendors: vendorQueries,
  orders: orderQueries,
  couriers: courierQueries,
  promotions: promotionQueries,
  analytics: analyticsQueries,
  system: systemQueries
};
