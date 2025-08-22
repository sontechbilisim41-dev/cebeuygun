
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ShoppingBasket, 
  Search, 
  Plus, 
  Edit, 
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Package
} from 'lucide-react';

interface MarketStore {
  id: number;
  name: string;
  type: 'supermarket' | 'grocery' | 'pharmacy' | 'convenience';
  address: string;
  min_order_amount: number;
  delivery_fee: number;
  delivery_promise_minutes: number;
  is_active: boolean;
  is_24_hours: boolean;
  phone?: string;
  manager_name?: string;
  create_time: string;
}

interface MarketProduct {
  id: number;
  store_id: number;
  store_name: string;
  name: string;
  barcode?: string;
  category: string;
  brand?: string;
  price: number;
  unit: string;
  stock_quantity: number;
  min_stock_level: number;
  is_available: boolean;
}

export function QuickMarketService() {
  const [stores, setStores] = useState<MarketStore[]>([]);
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'stores' | 'products'>('stores');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Mock stores data
      const mockStores: MarketStore[] = [
        {
          id: 1,
          name: 'Fresh Market Kadıköy',
          type: 'supermarket',
          address: 'Kadıköy Mah. Bahariye Cad. No:123, Kadıköy, İstanbul',
          min_order_amount: 25.00,
          delivery_fee: 5.00,
          delivery_promise_minutes: 30,
          is_active: true,
          is_24_hours: false,
          phone: '+90 216 555 0201',
          manager_name: 'Ahmet Yılmaz',
          create_time: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'Quick Grocery Beşiktaş',
          type: 'grocery',
          address: 'Beşiktaş Mah. Barbaros Bulvarı No:45, Beşiktaş, İstanbul',
          min_order_amount: 20.00,
          delivery_fee: 4.50,
          delivery_promise_minutes: 25,
          is_active: true,
          is_24_hours: true,
          phone: '+90 212 555 0202',
          manager_name: 'Fatma Demir',
          create_time: '2024-01-02T00:00:00Z'
        },
        {
          id: 3,
          name: 'City Pharmacy',
          type: 'pharmacy',
          address: 'Şişli Mah. Nişantaşı Cad. No:67, Şişli, İstanbul',
          min_order_amount: 15.00,
          delivery_fee: 6.00,
          delivery_promise_minutes: 20,
          is_active: false,
          is_24_hours: false,
          phone: '+90 212 555 0203',
          create_time: '2024-01-03T00:00:00Z'
        }
      ];

      // Mock products data
      const mockProducts: MarketProduct[] = [
        {
          id: 1,
          store_id: 1,
          store_name: 'Fresh Market Kadıköy',
          name: 'Organic Milk 1L',
          barcode: '8690123456789',
          category: 'Dairy',
          brand: 'Organic Farm',
          price: 12.50,
          unit: 'piece',
          stock_quantity: 45,
          min_stock_level: 10,
          is_available: true
        },
        {
          id: 2,
          store_id: 1,
          store_name: 'Fresh Market Kadıköy',
          name: 'Whole Wheat Bread',
          barcode: '8690987654321',
          category: 'Bakery',
          brand: 'Daily Bread',
          price: 8.75,
          unit: 'piece',
          stock_quantity: 5,
          min_stock_level: 15,
          is_available: true
        },
        {
          id: 3,
          store_id: 2,
          store_name: 'Quick Grocery Beşiktaş',
          name: 'Fresh Bananas',
          category: 'Fruits',
          price: 15.90,
          unit: 'kg',
          stock_quantity: 0,
          min_stock_level: 5,
          is_available: false
        },
        {
          id: 4,
          store_id: 3,
          store_name: 'City Pharmacy',
          name: 'Vitamin C Tablets',
          barcode: '8690555666777',
          category: 'Health',
          brand: 'HealthPlus',
          price: 45.00,
          unit: 'box',
          stock_quantity: 25,
          min_stock_level: 5,
          is_available: true
        }
      ];
      
      setTimeout(() => {
        setStores(mockStores);
        setProducts(mockProducts);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const getStoreTypeBadge = (type: MarketStore['type']) => {
    const typeConfig = {
      supermarket: { label: 'Supermarket', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      grocery: { label: 'Grocery', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      pharmacy: { label: 'Pharmacy', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      convenience: { label: 'Convenience', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' }
    };

    const config = typeConfig[type];

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getStockStatus = (quantity: number, minLevel: number) => {
    if (quantity === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: AlertTriangle };
    } else if (quantity <= minLevel) {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: AlertTriangle };
    } else {
      return { label: 'In Stock', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Quick Market Service
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage grocery stores, inventory, and rapid delivery operations
          </p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-red-500 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add New Store
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center">
                <ShoppingBasket className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Stores
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  45
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Stores
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  38
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  12,450
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg. Delivery
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  25min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('stores')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'stores'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Stores
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'products'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Products
        </button>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'stores' ? 'Store Management' : 'Product Inventory'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={
                  activeTab === 'stores' 
                    ? "Search stores by name, type, or address..." 
                    : "Search products by name, store, category, or brand..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              Filter
            </Button>
            <Button variant="outline">
              Export
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : activeTab === 'stores' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Delivery Info</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {store.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          ID: {store.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStoreTypeBadge(store.type)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {store.address}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div>
                          Min: {formatPrice(store.min_order_amount)}
                        </div>
                        <div>
                          Fee: {formatPrice(store.delivery_fee)}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          {store.delivery_promise_minutes} min
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge 
                          variant={store.is_active ? 'default' : 'secondary'}
                          className={store.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                        >
                          {store.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {store.is_24_hours && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            24/7
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {store.manager_name && (
                          <div className="text-sm font-medium">
                            {store.manager_name}
                          </div>
                        )}
                        {store.phone && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {store.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock_quantity, product.min_stock_level);
                  const Icon = stockStatus.icon;
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {product.brand && `${product.brand} • `}
                            {product.barcode && `Barcode: ${product.barcode}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {product.store_name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatPrice(product.price)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            per {product.unit}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {product.stock_quantity} {product.unit}
                          </div>
                          <Badge className={stockStatus.color}>
                            {Icon && <Icon className="w-3 h-3 mr-1" />}
                            {stockStatus.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={product.is_available ? 'default' : 'secondary'}
                          className={product.is_available ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}
                        >
                          {product.is_available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
