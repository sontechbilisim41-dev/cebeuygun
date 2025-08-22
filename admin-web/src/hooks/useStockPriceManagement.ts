import { useState, useEffect, useCallback } from 'react';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  isOutOfStock: boolean;
  category: string;
  image?: string;
  lastUpdated: string;
  isModified?: boolean;
}

interface UseStockPriceManagementReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  hasChanges: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  saveChanges: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  exportTemplate: () => Promise<void>;
  importFromExcel: (file: File) => Promise<void>;
}

export const useStockPriceManagement = (): UseStockPriceManagementReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load products from API
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call with mock data
      const mockProducts: Product[] = [
        {
          id: 'prod-001',
          name: 'Big Mac Menü',
          sku: 'MCD-BIGMAC-001',
          price: 4500, // 45.00 TL in cents
          stock: 100,
          isOutOfStock: false,
          category: 'Fast Food',
          image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=150',
          lastUpdated: '2024-01-20T10:30:00Z',
        },
        {
          id: 'prod-002',
          name: 'Margherita Pizza (Büyük)',
          sku: 'DOM-MARG-L-001',
          price: 3800, // 38.00 TL
          stock: 25,
          isOutOfStock: false,
          category: 'Pizza',
          image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=150',
          lastUpdated: '2024-01-20T09:15:00Z',
        },
        {
          id: 'prod-003',
          name: 'Chicken Döner Porsiyon',
          sku: 'DK-CHICK-001',
          price: 2800, // 28.00 TL
          stock: 5,
          isOutOfStock: false,
          category: 'Türk Mutfağı',
          image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=150',
          lastUpdated: '2024-01-20T11:45:00Z',
        },
        {
          id: 'prod-004',
          name: 'iPhone 15 Pro Max 256GB',
          sku: 'APL-IP15PM-256',
          price: 6499900, // 64,999.00 TL
          stock: 0,
          isOutOfStock: true,
          category: 'Elektronik',
          image: 'https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg?auto=compress&cs=tinysrgb&w=150',
          lastUpdated: '2024-01-19T16:20:00Z',
        },
        {
          id: 'prod-005',
          name: 'Taze Sıkılmış Portakal Suyu',
          sku: 'FJ-ORANGE-001',
          price: 1200, // 12.00 TL
          stock: 150,
          isOutOfStock: false,
          category: 'İçecekler',
          image: 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=150',
          lastUpdated: '2024-01-20T08:30:00Z',
        },
        {
          id: 'prod-006',
          name: 'Levi\'s 501 Original Jean',
          sku: 'LEV-501-BLUE',
          price: 89900, // 899.00 TL
          stock: 25,
          isOutOfStock: false,
          category: 'Moda',
          image: 'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=150',
          lastUpdated: '2024-01-20T07:10:00Z',
        },
        {
          id: 'prod-007',
          name: 'Türk Kahvesi',
          sku: 'KD-TURK-001',
          price: 800, // 8.00 TL
          stock: 200,
          isOutOfStock: false,
          category: 'İçecekler',
          image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=150',
          lastUpdated: '2024-01-20T12:00:00Z',
        },
        {
          id: 'prod-008',
          name: 'Samsung Galaxy S24 Ultra',
          sku: 'SAM-S24U-512',
          price: 5799900, // 57,999.00 TL
          stock: 8,
          isOutOfStock: false,
          category: 'Elektronik',
          image: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=150',
          lastUpdated: '2024-01-20T14:25:00Z',
        },
        {
          id: 'prod-009',
          name: 'Adana Kebap',
          sku: 'KH-ADANA-001',
          price: 4200, // 42.00 TL
          stock: 60,
          isOutOfStock: false,
          category: 'Türk Mutfağı',
          image: 'https://images.pexels.com/photos/6419733/pexels-photo-6419733.jpeg?auto=compress&cs=tinysrgb&w=150',
          lastUpdated: '2024-01-20T13:40:00Z',
        },
        {
          id: 'prod-010',
          name: 'MacBook Air M3 13"',
          sku: 'APL-MBA-M3-512',
          price: 4999900, // 49,999.00 TL
          stock: 3,
          isOutOfStock: false,
          category: 'Elektronik',
          image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=150',
          lastUpdated: '2024-01-20T15:15:00Z',
        },
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProducts(mockProducts);
      setOriginalProducts(JSON.parse(JSON.stringify(mockProducts)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ürünler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if there are any changes
  const hasChanges = products.some(product => product.isModified);

  // Update a single product
  const updateProduct = useCallback((productId: string, updates: Partial<Product>) => {
    setProducts(prevProducts => 
      prevProducts.map(product => {
        if (product.id === productId) {
          const updatedProduct = { ...product, ...updates };
          
          // Check if product has been modified from original
          const original = originalProducts.find(p => p.id === productId);
          const isModified = original ? (
            updatedProduct.price !== original.price ||
            updatedProduct.stock !== original.stock ||
            updatedProduct.isOutOfStock !== original.isOutOfStock
          ) : false;

          return { ...updatedProduct, isModified };
        }
        return product;
      })
    );
  }, [originalProducts]);

  // Save all changes
  const saveChanges = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const changedProducts = products.filter(p => p.isModified);
      
      // Simulate API call to save changes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real implementation, this would be:
      // await fetch('/api/seller/products/bulk-update', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ products: changedProducts }),
      // });

      // Update original products and clear modified flags
      const updatedProducts = products.map(product => ({
        ...product,
        isModified: false,
        lastUpdated: new Date().toISOString(),
      }));

      setProducts(updatedProducts);
      setOriginalProducts(JSON.parse(JSON.stringify(updatedProducts)));

      console.log(`${changedProducts.length} ürün başarıyla güncellendi`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Değişiklikler kaydedilirken hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [products]);

  // Refresh products from server
  const refreshProducts = useCallback(async () => {
    await loadProducts();
  }, [loadProducts]);

  // Export Excel template
  const exportTemplate = useCallback(async () => {
    try {
      // Simulate template download
      const csvContent = [
        'SKU,Ürün Adı,Fiyat (TL),Stok Adedi,Tükendi (true/false)',
        'MCD-BIGMAC-001,Big Mac Menü,45.00,100,false',
        'DOM-MARG-L-001,Margherita Pizza (Büyük),38.00,25,false',
        'DK-CHICK-001,Chicken Döner Porsiyon,28.00,5,false',
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', 'stok_fiyat_sablonu.csv');
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Şablon dosyası indirildi');
    } catch (err) {
      setError('Şablon dosyası indirilemedi');
      throw err;
    }
  }, []);

  // Import from Excel
  const importFromExcel = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would parse the Excel file
      // and update products accordingly
      
      console.log(`Excel dosyası işlendi: ${file.name}`);
      
      // Refresh products after import
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Excel dosyası işlenirken hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadProducts]);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    hasChanges,
    searchQuery,
    setSearchQuery,
    updateProduct,
    saveChanges,
    refreshProducts,
    exportTemplate,
    importFromExcel,
  };
};