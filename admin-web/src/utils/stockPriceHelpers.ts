// Stock & Price Management Utility Functions

export const formatCurrency = (amount: number, currency: string = 'TRY'): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
  }).format(amount / 100);
};

export const formatStock = (stock: number): string => {
  return new Intl.NumberFormat('tr-TR').format(stock);
};

export const validatePrice = (price: number): { valid: boolean; error?: string } => {
  if (price < 0) {
    return { valid: false, error: 'Fiyat negatif olamaz' };
  }
  
  if (price > 10000000) { // 100,000 TL limit
    return { valid: false, error: 'Fiyat çok yüksek' };
  }
  
  return { valid: true };
};

export const validateStock = (stock: number): { valid: boolean; error?: string } => {
  if (stock < 0) {
    return { valid: false, error: 'Stok negatif olamaz' };
  }
  
  if (stock > 999999) {
    return { valid: false, error: 'Stok miktarı çok yüksek' };
  }
  
  return { valid: true };
};

export const getStockStatus = (stock: number, isOutOfStock: boolean): {
  status: 'out_of_stock' | 'low_stock' | 'medium_stock' | 'high_stock';
  color: 'error' | 'warning' | 'info' | 'success';
  text: string;
  priority: number;
} => {
  if (isOutOfStock || stock === 0) {
    return {
      status: 'out_of_stock',
      color: 'error',
      text: isOutOfStock ? 'Tükendi' : 'Stok Yok',
      priority: 1,
    };
  }
  
  if (stock < 10) {
    return {
      status: 'low_stock',
      color: 'warning',
      text: 'Az Stok',
      priority: 2,
    };
  }
  
  if (stock < 50) {
    return {
      status: 'medium_stock',
      color: 'info',
      text: 'Orta Stok',
      priority: 3,
    };
  }
  
  return {
    status: 'high_stock',
    color: 'success',
    text: 'Bol Stok',
    priority: 4,
  };
};

export const calculatePriceChange = (currentPrice: number, originalPrice: number): {
  difference: number;
  percentage: number;
  isIncrease: boolean;
} => {
  const difference = currentPrice - originalPrice;
  const percentage = originalPrice > 0 ? (difference / originalPrice) * 100 : 0;
  
  return {
    difference,
    percentage,
    isIncrease: difference > 0,
  };
};

export const generateExcelTemplate = (products: any[]): string => {
  const headers = ['SKU', 'Ürün Adı', 'Kategori', 'Mevcut Fiyat (₺)', 'Yeni Fiyat (₺)', 'Mevcut Stok', 'Yeni Stok', 'Tükendi (true/false)'];
  
  const rows = products.map(product => [
    product.sku,
    product.name,
    product.category,
    (product.price / 100).toFixed(2),
    (product.price / 100).toFixed(2), // Default to current price
    product.stock.toString(),
    product.stock.toString(), // Default to current stock
    product.isOutOfStock.toString(),
  ]);

  return [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
};

export const parseExcelData = (csvContent: string): {
  products: Array<{
    sku: string;
    price: number;
    stock: number;
    isOutOfStock: boolean;
  }>;
  errors: string[];
} => {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  const products = [];
  const errors = [];

  // Validate headers
  const requiredHeaders = ['SKU', 'Yeni Fiyat (₺)', 'Yeni Stok', 'Tükendi (true/false)'];
  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
  
  if (missingHeaders.length > 0) {
    errors.push(`Eksik sütunlar: ${missingHeaders.join(', ')}`);
    return { products, errors };
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = line.split(',');
      const sku = values[0]?.trim();
      const priceStr = values[4]?.trim(); // Yeni Fiyat column
      const stockStr = values[6]?.trim(); // Yeni Stok column
      const outOfStockStr = values[7]?.trim(); // Tükendi column

      if (!sku) {
        errors.push(`Satır ${i + 1}: SKU eksik`);
        continue;
      }

      const price = parseFloat(priceStr);
      const stock = parseInt(stockStr);
      const isOutOfStock = outOfStockStr.toLowerCase() === 'true';

      if (isNaN(price) || price < 0) {
        errors.push(`Satır ${i + 1}: Geçersiz fiyat değeri`);
        continue;
      }

      if (isNaN(stock) || stock < 0) {
        errors.push(`Satır ${i + 1}: Geçersiz stok değeri`);
        continue;
      }

      products.push({
        sku,
        price: Math.round(price * 100), // Convert to cents
        stock,
        isOutOfStock,
      });
    } catch (error) {
      errors.push(`Satır ${i + 1}: Veri işleme hatası`);
    }
  }

  return { products, errors };
};

export const filterProducts = (products: any[], searchQuery: string): any[] => {
  if (!searchQuery.trim()) return products;
  
  const query = searchQuery.toLowerCase();
  
  return products.filter(product =>
    product.name.toLowerCase().includes(query) ||
    product.sku.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query)
  );
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
        // Sort by stock status priority
        const getStatusPriority = (product: any) => {
          if (product.isOutOfStock || product.stock === 0) return 1;
          if (product.stock < 10) return 2;
          if (product.stock < 50) return 3;
          return 4;
        };
        aValue = getStatusPriority(a);
        bValue = getStatusPriority(b);
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
  const outOfStockProducts = products.filter(p => p.isOutOfStock || p.stock === 0).length;
  const lowStockProducts = products.filter(p => !p.isOutOfStock && p.stock > 0 && p.stock < 10).length;
  const modifiedProducts = products.filter(p => p.isModified).length;
  
  const totalValue = products.reduce((sum, product) => {
    return sum + (product.price * product.stock);
  }, 0);
  
  const averagePrice = totalProducts > 0 
    ? products.reduce((sum, product) => sum + product.price, 0) / totalProducts 
    : 0;
  
  const averageStock = totalProducts > 0
    ? products.reduce((sum, product) => sum + product.stock, 0) / totalProducts
    : 0;

  return {
    totalProducts,
    outOfStockProducts,
    lowStockProducts,
    modifiedProducts,
    totalValue,
    averagePrice,
    averageStock,
    stockHealthPercentage: totalProducts > 0 
      ? ((totalProducts - outOfStockProducts - lowStockProducts) / totalProducts) * 100 
      : 0,
  };
};

export const validateBulkUpdate = (updates: any[]): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  updates.forEach((update, index) => {
    const rowNumber = index + 1;

    // Validate SKU
    if (!update.sku || update.sku.trim() === '') {
      errors.push(`Satır ${rowNumber}: SKU boş olamaz`);
    }

    // Validate price
    const priceValidation = validatePrice(update.price);
    if (!priceValidation.valid) {
      errors.push(`Satır ${rowNumber}: ${priceValidation.error}`);
    }

    // Validate stock
    const stockValidation = validateStock(update.stock);
    if (!stockValidation.valid) {
      errors.push(`Satır ${rowNumber}: ${stockValidation.error}`);
    }

    // Warnings
    if (update.stock === 0 && !update.isOutOfStock) {
      warnings.push(`Satır ${rowNumber}: Stok 0 ama "Tükendi" işaretli değil`);
    }

    if (update.stock > 0 && update.isOutOfStock) {
      warnings.push(`Satır ${rowNumber}: Stok var ama "Tükendi" işaretli`);
    }

    if (update.price > 1000000) { // 10,000 TL
      warnings.push(`Satır ${rowNumber}: Yüksek fiyat (${formatCurrency(update.price)})`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

export const exportProductsToCSV = (products: any[]): string => {
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
    product.sku,
    `"${product.name}"`, // Quote to handle commas in names
    product.category,
    (product.price / 100).toFixed(2),
    (product.price / 100).toFixed(2),
    product.stock.toString(),
    product.stock.toString(),
    product.isOutOfStock.toString(),
    new Date(product.lastUpdated).toLocaleString('tr-TR'),
  ]);

  return [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
};