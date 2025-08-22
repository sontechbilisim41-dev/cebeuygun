
import { Product, Category, User, Order, Campaign, Coupon } from '@/types';
import { mockDB } from './database/mockDatabase';

// Mock data for the platform - now using the comprehensive database
export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Groceries',
    slug: 'groceries',
    description: 'Fresh groceries and daily essentials',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    level: 0,
    isActive: true,
    sortOrder: 1,
    children: [
      {
        id: '1-1',
        name: 'Fruits & Vegetables',
        slug: 'fruits-vegetables',
        parentId: '1',
        level: 1,
        isActive: true,
        sortOrder: 1,
        image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400'
      },
      {
        id: '1-2',
        name: 'Dairy & Eggs',
        slug: 'dairy-eggs',
        parentId: '1',
        level: 1,
        isActive: true,
        sortOrder: 2,
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'
      }
    ]
  },
  {
    id: '2',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest electronics and gadgets',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
    level: 0,
    isActive: true,
    sortOrder: 2,
    children: [
      {
        id: '2-1',
        name: 'Smartphones',
        slug: 'smartphones',
        parentId: '2',
        level: 1,
        isActive: true,
        sortOrder: 1,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'
      }
    ]
  },
  {
    id: '3',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Trendy clothing and accessories',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    level: 0,
    isActive: true,
    sortOrder: 3,
    children: []
  },
  {
    id: '4',
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Home improvement and garden supplies',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    level: 0,
    isActive: true,
    sortOrder: 4,
    children: []
  },
  {
    id: '5',
    name: 'Health & Beauty',
    slug: 'health-beauty',
    description: 'Health and beauty products',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
    level: 0,
    isActive: true,
    sortOrder: 5,
    children: []
  },
  {
    id: '6',
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Sports equipment and outdoor gear',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    level: 0,
    isActive: true,
    sortOrder: 6,
    children: []
  }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    vendorId: 'vendor1',
    name: 'Fresh Organic Apples',
    description: 'Premium quality organic apples, freshly picked from local orchards. Rich in vitamins and perfect for healthy snacking.',
    shortDescription: 'Fresh organic apples - 1kg pack',
    sku: 'APPLE-ORG-001',
    barcode: '1234567890123',
    categoryId: '1-1',
    brand: 'FreshFarm',
    images: [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600',
        alt: 'Fresh Organic Apples',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    variants: [
      {
        id: '1-1',
        name: 'Weight',
        type: 'other',
        value: '1kg',
        priceModifier: 0,
        stock: 50
      },
      {
        id: '1-2',
        name: 'Weight',
        type: 'other',
        value: '2kg',
        priceModifier: 15,
        stock: 30
      }
    ],
    basePrice: 25.99,
    salePrice: 22.99,
    discountPercentage: 12,
    stock: 80,
    minStock: 10,
    weight: 1,
    dimensions: { length: 20, width: 15, height: 10 },
    isActive: true,
    isFeatured: true,
    tags: ['organic', 'fresh', 'healthy', 'local'],
    seoTitle: 'Fresh Organic Apples - Premium Quality | TrendyolGo',
    seoDescription: 'Buy fresh organic apples online. Premium quality, locally sourced. Fast delivery in 10-30 minutes.',
    rating: 4.8,
    reviewCount: 156,
    soldCount: 1250,
    deliveryTime: { express: 15, standard: 2 },
    shippingCost: 0,
    freeShippingThreshold: 50,
    requiresPrescription: false,
    coldChain: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    vendorId: 'vendor1',
    name: 'iPhone 15 Pro Max',
    description: 'Latest iPhone 15 Pro Max with advanced camera system, A17 Pro chip, and titanium design. Available in multiple colors.',
    shortDescription: 'iPhone 15 Pro Max - 256GB',
    sku: 'IPHONE-15-PRO-MAX-256',
    categoryId: '2-1',
    brand: 'Apple',
    images: [
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
        alt: 'iPhone 15 Pro Max',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    variants: [
      {
        id: '2-1',
        name: 'Storage',
        type: 'other',
        value: '256GB',
        priceModifier: 0,
        stock: 15
      },
      {
        id: '2-2',
        name: 'Storage',
        type: 'other',
        value: '512GB',
        priceModifier: 200,
        stock: 8
      },
      {
        id: '2-3',
        name: 'Color',
        type: 'color',
        value: 'Natural Titanium',
        priceModifier: 0,
        stock: 12
      },
      {
        id: '2-4',
        name: 'Color',
        type: 'color',
        value: 'Blue Titanium',
        priceModifier: 0,
        stock: 10
      }
    ],
    basePrice: 1299.99,
    stock: 23,
    minStock: 5,
    weight: 0.221,
    dimensions: { length: 16, width: 7.7, height: 0.83 },
    isActive: true,
    isFeatured: true,
    tags: ['smartphone', 'apple', 'premium', 'latest'],
    rating: 4.9,
    reviewCount: 89,
    soldCount: 234,
    deliveryTime: { express: 30, standard: 4 },
    shippingCost: 0,
    requiresPrescription: false,
    coldChain: false,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-18T12:00:00Z'
  },
  {
    id: '3',
    vendorId: 'vendor2',
    name: 'Premium Cotton T-Shirt',
    description: 'Comfortable premium cotton t-shirt with modern fit. Perfect for casual wear and available in multiple colors.',
    shortDescription: 'Premium cotton t-shirt - unisex',
    sku: 'TSHIRT-COTTON-001',
    categoryId: '3',
    brand: 'StyleCo',
    images: [
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
        alt: 'Premium Cotton T-Shirt',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    variants: [
      {
        id: '3-1',
        name: 'Size',
        type: 'size',
        value: 'S',
        priceModifier: 0,
        stock: 25
      },
      {
        id: '3-2',
        name: 'Size',
        type: 'size',
        value: 'M',
        priceModifier: 0,
        stock: 40
      },
      {
        id: '3-3',
        name: 'Size',
        type: 'size',
        value: 'L',
        priceModifier: 0,
        stock: 35
      },
      {
        id: '3-4',
        name: 'Color',
        type: 'color',
        value: 'White',
        priceModifier: 0,
        stock: 50
      },
      {
        id: '3-5',
        name: 'Color',
        type: 'color',
        value: 'Black',
        priceModifier: 0,
        stock: 45
      },
      {
        id: '3-6',
        name: 'Color',
        type: 'color',
        value: 'Navy',
        priceModifier: 0,
        stock: 30
      }
    ],
    basePrice: 29.99,
    salePrice: 24.99,
    discountPercentage: 17,
    stock: 100,
    minStock: 20,
    weight: 0.2,
    dimensions: { length: 30, width: 25, height: 2 },
    isActive: true,
    isFeatured: false,
    tags: ['clothing', 'cotton', 'casual', 'unisex'],
    rating: 4.6,
    reviewCount: 203,
    soldCount: 856,
    deliveryTime: { express: 25, standard: 3 },
    shippingCost: 5.99,
    freeShippingThreshold: 75,
    requiresPrescription: false,
    coldChain: false,
    createdAt: '2024-01-12T14:00:00Z',
    updatedAt: '2024-01-19T09:15:00Z'
  }
];

export const mockUsers: User[] = [
  {
    id: 'user1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    phone: '+1234567890',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    role: 'customer',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'vendor1',
    email: 'vendor@freshfarm.com',
    name: 'Fresh Farm Store',
    phone: '+1234567891',
    role: 'vendor',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'courier1',
    email: 'courier@delivery.com',
    name: 'Mike Wilson',
    phone: '+1234567892',
    role: 'courier',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'admin1',
    email: 'admin@trendyolgo.com',
    name: 'Admin User',
    phone: '+1234567893',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  }
];

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Flash Sale - Electronics',
    description: '50% off on selected electronics for limited time',
    type: 'flash_sale',
    discountType: 'percentage',
    discountValue: 50,
    minOrderAmount: 100,
    maxDiscountAmount: 200,
    startDate: '2024-01-20T00:00:00Z',
    endDate: '2024-01-22T23:59:59Z',
    isActive: true,
    usageLimit: 1000,
    usageCount: 245,
    applicableCategories: ['2'],
    createdAt: '2024-01-19T10:00:00Z'
  },
  {
    id: '2',
    name: 'First Order Discount',
    description: 'Get 20% off on your first order',
    type: 'first_order',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscountAmount: 50,
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const mockCoupons: Coupon[] = [
  {
    id: '1',
    code: 'WELCOME20',
    name: 'Welcome Discount',
    description: '20% off for new customers',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscountAmount: 50,
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    isActive: true,
    usageLimit: 1000,
    usageCount: 156,
    userLimit: 1,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    code: 'SAVE10',
    name: 'Save $10',
    description: '$10 off on orders over $100',
    discountType: 'fixed',
    discountValue: 10,
    minOrderAmount: 100,
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-02-15T23:59:59Z',
    isActive: true,
    usageLimit: 500,
    usageCount: 89,
    createdAt: '2024-01-15T00:00:00Z'
  }
];

// Initialize localStorage with mock data and comprehensive database
export const initializeMockData = () => {
  if (typeof window === 'undefined') return;
  
  // Initialize the comprehensive database
  mockDB.initializeDatabase();
  
  // Dynamic import to avoid SSR issues
  import('./localStorage').then(({ storage }) => {
    // Only initialize if data doesn't exist
    if (!storage.getCategories().length) {
      storage.setCategories(mockCategories);
    }
    
    if (!storage.getProducts().length) {
      storage.setProducts(mockProducts);
    }
    
    if (!storage.getUsers().length) {
      storage.setUsers(mockUsers);
    }
    
    if (!storage.getCampaigns().length) {
      storage.setCampaigns(mockCampaigns);
    }
    
    if (!storage.getCoupons().length) {
      storage.setCoupons(mockCoupons);
    }
  });
};
