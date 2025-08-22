// Seller Product Management Utility Functions

export const formatCurrency = (amount: number, currency: string = 'TRY'): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
  }).format(amount / 100);
};

export const formatStock = (stock: number): string => {
  return new Intl.NumberFormat('tr-TR').format(stock);
};

export const validateProductData = (productData: any): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Name validation
  if (!productData.name || productData.name.trim().length === 0) {
    errors.name = 'Ürün adı gerekli';
  } else if (productData.name.length > 200) {
    errors.name = 'Ürün adı 200 karakterden uzun olamaz';
  }

  // Description validation
  if (!productData.description || productData.description.trim().length === 0) {
    errors.description = 'Ürün açıklaması gerekli';
  } else if (productData.description.length > 500) {
    errors.description = 'Açıklama 500 karakterden uzun olamaz';
  }

  // Category validation
  if (!productData.category) {
    errors.category = 'Kategori seçimi gerekli';
  }

  // Price validation
  if (!productData.price || productData.price <= 0) {
    errors.price = 'Geçerli bir fiyat girin';
  } else if (productData.price > 10000000) { // 100,000 TL limit
    errors.price = 'Fiyat çok yüksek (maksimum 100,000 ₺)';
  }

  // Stock validation
  if (productData.stock < 0) {
    errors.stock = 'Stok miktarı negatif olamaz';
  } else if (productData.stock > 999999) {
    errors.stock = 'Stok miktarı çok yüksek';
  }

  // Images validation
  if (!productData.images || productData.images.length === 0) {
    errors.images = 'En az bir ürün görseli gerekli';
  } else if (productData.images.length > 5) {
    errors.images = 'En fazla 5 görsel ekleyebilirsiniz';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const getProductStatus = (product: any): {
  status: 'active' | 'inactive' | 'out_of_stock' | 'low_stock';
  color: 'success' | 'error' | 'warning' | 'info';
  text: string;
} => {
  if (!product.isActive) {
    return {
      status: 'inactive',
      color: 'error',
      text: 'Yayında Değil',
    };
  }
  
  if (product.isOutOfStock || product.stock === 0) {
    return {
      status: 'out_of_stock',
      color: 'error',
      text: 'Tükendi',
    };
  }
  
  if (product.stock < 10) {
    return {
      status: 'low_stock',
      color: 'warning',
      text: 'Az Stok',
    };
  }
  
  return {
    status: 'active',
    color: 'success',
    text: 'Yayında',
  };
};

export const searchProducts = (products: any[], searchQuery: string): any[] => {
  if (!searchQuery.trim()) return products;
  
  const query = searchQuery.toLowerCase();
  
  return products.filter(product =>
    product.name.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query) ||
    (product.menuCategory && product.menuCategory.toLowerCase().includes(query))
  );
};

export const filterProductsByCategory = (products: any[], categoryFilter: string, categories: any[]): any[] => {
  if (categoryFilter === 'all') return products;
  
  const selectedCategory = categories.find(c => c.id === categoryFilter);
  if (!selectedCategory) return products;
  
  return products.filter(product => product.category === selectedCategory.name);
};

export const sortProducts = (products: any[], sortBy: string, sortDirection: 'asc' | 'desc' = 'asc'): any[] => {
  return [...products].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'stock':
        aValue = a.stock;
        bValue = b.stock;
        break;
      case 'category':
        aValue = a.category.toLowerCase();
        bValue = b.category.toLowerCase();
        break;
      case 'status':
        // Sort by status priority
        const getStatusPriority = (product: any) => {
          if (!product.isActive) return 1;
          if (product.isOutOfStock || product.stock === 0) return 2;
          if (product.stock < 10) return 3;
          return 4;
        };
        aValue = getStatusPriority(a);
        bValue = getStatusPriority(b);
        break;
      case 'lastUpdated':
        aValue = new Date(a.lastUpdated).getTime();
        bValue = new Date(b.lastUpdated).getTime();
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
};

export const getProductStatistics = (products: any[]) => {
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;
  const outOfStockProducts = products.filter(p => p.isOutOfStock || p.stock === 0).length;
  const lowStockProducts = products.filter(p => !p.isOutOfStock && p.stock > 0 && p.stock < 10).length;
  const modifiedProducts = products.filter(p => p.isModified).length;
  
  const totalValue = products.reduce((sum, product) => {
    return sum + (product.price * product.stock);
  }, 0);
  
  const averagePrice = totalProducts > 0 
    ? products.reduce((sum, product) => sum + product.price, 0) / totalProducts 
    : 0;

  return {
    totalProducts,
    activeProducts,
    outOfStockProducts,
    lowStockProducts,
    modifiedProducts,
    totalValue,
    averagePrice,
    inactiveProducts: totalProducts - activeProducts,
    stockHealthPercentage: totalProducts > 0 
      ? ((totalProducts - outOfStockProducts - lowStockProducts) / totalProducts) * 100 
      : 0,
  };
};

export const generateProductSKU = (productName: string, category: string): string => {
  const nameCode = productName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 3);
  
  const categoryCode = category
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
  
  const randomCode = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${categoryCode}-${nameCode}-${randomCode}`;
};

export const validateBulkUploadData = (data: any[]): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  validProducts: any[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const validProducts: any[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 1;
    const product: any = {};

    // Validate SKU
    if (!row.SKU || row.SKU.trim() === '') {
      errors.push(`Satır ${rowNumber}: SKU boş olamaz`);
      return;
    }
    product.sku = row.SKU.trim();

    // Validate price
    const newPrice = parseFloat(row['Yeni Fiyat (₺)']);
    if (isNaN(newPrice) || newPrice < 0) {
      errors.push(`Satır ${rowNumber}: Geçersiz fiyat değeri`);
      return;
    }
    if (newPrice > 100000) {
      warnings.push(`Satır ${rowNumber}: Yüksek fiyat (${newPrice} ₺)`);
    }
    product.price = Math.round(newPrice * 100);

    // Validate stock
    const newStock = parseInt(row['Yeni Stok']);
    if (isNaN(newStock) || newStock < 0) {
      errors.push(`Satır ${rowNumber}: Geçersiz stok değeri`);
      return;
    }
    product.stock = newStock;

    // Validate out of stock flag
    const outOfStockStr = row['Tükendi (true/false)'];
    if (outOfStockStr !== 'true' && outOfStockStr !== 'false') {
      errors.push(`Satır ${rowNumber}: Tükendi değeri 'true' veya 'false' olmalı`);
      return;
    }
    product.isOutOfStock = outOfStockStr === 'true';

    // Warnings
    if (product.stock === 0 && !product.isOutOfStock) {
      warnings.push(`Satır ${rowNumber}: Stok 0 ama "Tükendi" false`);
    }
    
    if (product.stock > 0 && product.isOutOfStock) {
      warnings.push(`Satır ${rowNumber}: Stok var ama "Tükendi" true`);
    }

    validProducts.push(product);
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    validProducts,
  };
};

export const exportProductsToExcel = (products: any[]): string => {
  const headers = [
    'SKU',
    'Ürün Adı',
    'Kategori',
    'Mevcut Fiyat (₺)',
    'Yeni Fiyat (₺)',
    'Mevcut Stok',
    'Yeni Stok',
    'Tükendi (true/false)',
    'Son Güncelleme'
  ];

  const rows = products.map(product => [
    product.sku || generateProductSKU(product.name, product.category),
    `"${product.name}"`, // Quote to handle commas
    product.category,
    (product.price / 100).toFixed(2),
    (product.price / 100).toFixed(2), // Default to current price
    product.stock.toString(),
    product.stock.toString(), // Default to current stock
    product.isOutOfStock.toString(),
    new Date(product.lastUpdated).toLocaleString('tr-TR'),
  ]);

  return [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
};

export const getMenuCategoriesByType = (categoryType: string): string[] => {
  switch (categoryType) {
    case 'food':
      return [
        'Çorbalar',
        'Salatalar', 
        'Ana Yemekler',
        'Kebaplar',
        'Pideler',
        'Pizzalar',
        'Tatlılar',
        'Sıcak İçecekler',
        'Soğuk İçecekler',
        'Aperatifler',
        'Kahvaltı',
        'Atıştırmalıklar',
      ];
    case 'grocery':
      return [
        'Meyve & Sebze',
        'Et & Tavuk',
        'Süt Ürünleri',
        'Fırın & Pastane',
        'Donuk Ürünler',
        'Temizlik',
        'Kişisel Bakım',
        'Bebek Ürünleri',
      ];
    default:
      return [];
  }
};

export const calculateProfitMargin = (costPrice: number, sellingPrice: number): number => {
  if (costPrice === 0) return 0;
  return ((sellingPrice - costPrice) / sellingPrice) * 100;
};

export const suggestOptimalPrice = (costPrice: number, targetMargin: number = 30): number => {
  return Math.round((costPrice / (1 - targetMargin / 100)) * 100);
};

export const getStockRecommendation = (
  currentStock: number,
  averageDailySales: number,
  leadTimeDays: number = 7
): {
  recommendation: string;
  suggestedStock: number;
  urgency: 'low' | 'medium' | 'high';
} => {
  const daysOfStock = averageDailySales > 0 ? currentStock / averageDailySales : 999;
  const suggestedStock = Math.ceil(averageDailySales * (leadTimeDays + 3)); // Lead time + buffer
  
  if (daysOfStock < 3) {
    return {
      recommendation: 'Acil stok yenileme gerekli',
      suggestedStock,
      urgency: 'high',
    };
  }
  
  if (daysOfStock < 7) {
    return {
      recommendation: 'Stok yenileme önerilir',
      suggestedStock,
      urgency: 'medium',
    };
  }
  
  return {
    recommendation: 'Stok durumu iyi',
    suggestedStock: currentStock,
    urgency: 'low',
  };
};