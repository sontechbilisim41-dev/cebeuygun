import { useState, useEffect, useCallback } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  menuCategory?: string;
  price: number;
  stock: number;
  isActive: boolean;
  isOutOfStock: boolean;
  images: string[];
  variants?: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
  }>;
  lastUpdated: string;
  isModified?: boolean;
}

interface Category {
  id: string;
  name: string;
  type?: string;
}

interface UseSellerProductManagementReturn {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  hasChanges: boolean;
  searchQuery: string;
  categoryFilter: string;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  saveChanges: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  addProduct: (productData: any) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
}

export const useSellerProductManagement = (): UseSellerProductManagementReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Mock categories
  const mockCategories: Category[] = [
    { id: 'cat-fastfood', name: 'Fast Food', type: 'food' },
    { id: 'cat-turkish', name: 'Türk Mutfağı', type: 'food' },
    { id: 'cat-beverages', name: 'İçecekler', type: 'food' },
    { id: 'cat-electronics', name: 'Elektronik', type: 'product' },
    { id: 'cat-fashion', name: 'Moda', type: 'product' },
    { id: 'cat-home', name: 'Ev & Yaşam', type: 'product' },
    { id: 'cat-grocery', name: 'Market', type: 'grocery' },
  ];

  // Mock products
  const mockProducts: Product[] = [
    {
      id: 'prod-001',
      name: 'Big Mac Menü',
      description: 'İki köfte, özel sos, marul, peynir, turşu, soğan ile sesam ekmekte. Patates kızartması ve içecek dahil.',
      category: 'Fast Food',
      menuCategory: 'Ana Yemekler',
      price: 4500,
      stock: 100,
      isActive: true,
      isOutOfStock: false,
      images: ['https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400'],
      lastUpdated: '2024-01-20T10:30:00Z',
    },
    {
      id: 'prod-002',
      name: 'Margherita Pizza (Büyük)',
      description: 'Taze mozzarella, domates sosu ve fesleğen ile klasik İtalyan pizzası.',
      category: 'Fast Food',
      menuCategory: 'Pizzalar',
      price: 3800,
      stock: 25,
      isActive: true,
      isOutOfStock: false,
      images: ['https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400'],
      lastUpdated: '2024-01-20T09:15:00Z',
    },
    {
      id: 'prod-003',
      name: 'Chicken Döner Porsiyon',
      description: 'Taze tavuk döner, pilav, salata ve ayran ile servis edilir.',
      category: 'Türk Mutfağı',
      menuCategory: 'Ana Yemekler',
      price: 2800,
      stock: 5,
      isActive: true,
      isOutOfStock: false,
      images: ['https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=400'],
      lastUpdated: '2024-01-20T11:45:00Z',
    },
    {
      id: 'prod-004',
      name: 'iPhone 15 Pro Max 256GB',
      description: 'Apple iPhone 15 Pro Max, 256GB depolama, ProRAW kamera sistemi.',
      category: 'Elektronik',
      price: 6499900,
      stock: 0,
      isActive: false,
      isOutOfStock: true,
      images: ['https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg?auto=compress&cs=tinysrgb&w=400'],
      lastUpdated: '2024-01-19T16:20:00Z',
    },
    {
      id: 'prod-005',
      name: 'Taze Sıkılmış Portakal Suyu',
      description: 'Günlük taze sıkılmış portakal suyu, %100 doğal.',
      category: 'İçecekler',
      menuCategory: 'Soğuk İçecekler',
      price: 1200,
      stock: 150,
      isActive: true,
      isOutOfStock: false,
      images: ['https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=400'],
      lastUpdated: '2024-01-20T08:30:00Z',
    },
    {
      id: 'prod-006',
      name: 'Adana Kebap',
      description: 'Acılı kıyma kebabı, bulgur pilavı, közlenmiş domates ve biber ile.',
      category: 'Türk Mutfağı',
      menuCategory: 'Kebaplar',
      price: 4200,
      stock: 60,
      isActive: true,
      isOutOfStock: false,
      images: ['https://images.pexels.com/photos/6419733/pexels-photo-6419733.jpeg?auto=compress&cs=tinysrgb&w=400'],
      lastUpdated: '2024-01-20T13:40:00Z',
    },
  ];

  // Load products from API
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProducts(mockProducts);
      setOriginalProducts(JSON.parse(JSON.stringify(mockProducts)));
      setCategories(mockCategories);
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
            updatedProduct.isActive !== original.isActive ||
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

  // Add new product
  const addProduct = useCallback(async (productData: any) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        ...productData,
        lastUpdated: new Date().toISOString(),
        isModified: false,
      };

      setProducts(prev => [newProduct, ...prev]);
      setOriginalProducts(prev => [newProduct, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ürün eklenirken hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete product
  const deleteProduct = useCallback(async (productId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setProducts(prev => prev.filter(p => p.id !== productId));
      setOriginalProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ürün silinirken hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh products
  const refreshProducts = useCallback(async () => {
    await loadProducts();
  }, [loadProducts]);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || 
      product.category === categories.find(c => c.id === categoryFilter)?.name;

    return matchesSearch && matchesCategory;
  });

  return {
    products: filteredProducts,
    categories,
    loading,
    error,
    hasChanges,
    searchQuery,
    categoryFilter,
    setSearchQuery,
    setCategoryFilter,
    updateProduct,
    saveChanges,
    refreshProducts,
    addProduct,
    deleteProduct,
  };
};