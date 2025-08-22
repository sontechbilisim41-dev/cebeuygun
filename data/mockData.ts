
// Mock data for Turkish admin panel
export const mockDashboardData = {
  stats: {
    totalUsers: 15420,
    totalVendors: 340,
    totalCouriers: 125,
    totalOrders: 3240,
    totalRevenue: 1250000,
    activeOrders: 45,
    completedOrdersToday: 342,
    pendingApprovals: 15
  },
  salesChart: [
    { name: 'Ocak', pazaryeri: 120000, yemek: 80000, market: 45000 },
    { name: 'Şubat', pazaryeri: 135000, yemek: 85000, market: 52000 },
    { name: 'Mart', pazaryeri: 148000, yemek: 92000, market: 58000 },
    { name: 'Nisan', pazaryeri: 162000, yemek: 98000, market: 65000 },
    { name: 'Mayıs', pazaryeri: 175000, yemek: 105000, market: 72000 },
    { name: 'Haziran', pazaryeri: 188000, yemek: 112000, market: 78000 },
    { name: 'Temmuz', pazaryeri: 195000, yemek: 118000, market: 85000 }
  ],
  ordersChart: [
    { name: 'Pzt', siparisler: 245 },
    { name: 'Sal', siparisler: 312 },
    { name: 'Çar', siparisler: 289 },
    { name: 'Per', siparisler: 356 },
    { name: 'Cum', siparisler: 423 },
    { name: 'Cmt', siparisler: 498 },
    { name: 'Paz', siparisler: 387 }
  ]
};

export const mockCategories = [
  {
    id: 1,
    name: 'Elektronik',
    slug: 'elektronik',
    description: 'Telefon, bilgisayar ve elektronik ürünler',
    parent_id: null,
    image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
    is_active: true,
    sort_order: 1,
    product_count: 1250
  },
  {
    id: 2,
    name: 'Moda',
    slug: 'moda',
    description: 'Giyim, ayakkabı ve aksesuar',
    parent_id: null,
    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    is_active: true,
    sort_order: 2,
    product_count: 2340
  },
  {
    id: 3,
    name: 'Ev & Yaşam',
    slug: 'ev-yasam',
    description: 'Ev dekorasyonu ve yaşam ürünleri',
    parent_id: null,
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    is_active: true,
    sort_order: 3,
    product_count: 890
  }
];

export const mockProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max 256GB',
    sku: 'IPH15PM-256-BLU',
    price: 45999.99,
    stock_quantity: 25,
    category: 'Elektronik',
    vendor: 'TechStore',
    approval_status: 'pending',
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400'],
    create_time: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra 512GB',
    sku: 'SGS24U-512-BLK',
    price: 42999.99,
    stock_quantity: 15,
    category: 'Elektronik',
    vendor: 'MobileWorld',
    approval_status: 'approved',
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400'],
    create_time: '2024-01-14T15:20:00Z'
  }
];

export const mockVendors = [
  {
    id: 1,
    company_name: 'TechStore Elektronik',
    company_slug: 'techstore-elektronik',
    email: 'info@techstore.com',
    phone: '+90 212 555 0001',
    status: 'approved',
    is_active: true,
    rating: 4.8,
    total_sales: 1250000,
    commission_rate: 12.5,
    warning_count: 0,
    create_time: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    company_name: 'Moda Dünyası',
    company_slug: 'moda-dunyasi',
    email: 'iletisim@modadunyasi.com',
    phone: '+90 212 555 0002',
    status: 'pending',
    is_active: false,
    rating: 0,
    total_sales: 0,
    commission_rate: 15.0,
    warning_count: 0,
    create_time: '2024-01-15T12:00:00Z'
  }
];

export const mockOrders = [
  {
    id: 1,
    order_number: 'SIP-2024-001',
    customer_name: 'Ahmet Yılmaz',
    order_type: 'marketplace',
    status: 'confirmed',
    payment_status: 'paid',
    total_amount: 1299.99,
    vendor_name: 'TechStore',
    create_time: '2024-01-15T10:30:00Z',
    estimated_delivery: '2024-01-17T15:00:00Z'
  },
  {
    id: 2,
    order_number: 'SIP-2024-002',
    customer_name: 'Fatma Demir',
    order_type: 'food',
    status: 'preparing',
    payment_status: 'paid',
    total_amount: 89.50,
    vendor_name: 'Pizza Palace',
    create_time: '2024-01-15T11:15:00Z',
    estimated_delivery: '2024-01-15T12:00:00Z'
  }
];

export const mockCouriers = [
  {
    id: 1,
    first_name: 'Mehmet',
    last_name: 'Özkan',
    phone: '+90 555 123 4567',
    email: 'mehmet.ozkan@kurye.com',
    vehicle_type: 'motorcycle',
    license_plate: '34 ABC 123',
    is_active: true,
    is_available: true,
    rating: 4.8,
    total_deliveries: 1250,
    current_location: {
      lat: 41.0082,
      lng: 28.9784,
      address: 'Kadıköy, İstanbul'
    }
  },
  {
    id: 2,
    first_name: 'Ayşe',
    last_name: 'Kaya',
    phone: '+90 555 987 6543',
    email: 'ayse.kaya@kurye.com',
    vehicle_type: 'bicycle',
    is_active: true,
    is_available: false,
    rating: 4.9,
    total_deliveries: 890,
    current_location: {
      lat: 41.0369,
      lng: 28.9850,
      address: 'Beşiktaş, İstanbul'
    }
  }
];

export const mockCoupons = [
  {
    id: 1,
    code: 'HOSGELDIN50',
    name: 'Hoş Geldin İndirimi',
    type: 'percentage',
    value: 50,
    min_order_amount: 100,
    usage_limit: 1000,
    used_count: 245,
    start_date: '2024-01-01T00:00:00Z',
    end_date: '2024-12-31T23:59:59Z',
    is_active: true
  },
  {
    id: 2,
    code: 'KARGO0',
    name: 'Ücretsiz Kargo',
    type: 'free_shipping',
    value: 0,
    min_order_amount: 150,
    usage_limit: null,
    used_count: 1890,
    start_date: '2024-01-01T00:00:00Z',
    end_date: '2024-12-31T23:59:59Z',
    is_active: true
  }
];
