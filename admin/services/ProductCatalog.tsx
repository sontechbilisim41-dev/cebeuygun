
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
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  category: string;
  vendor: string;
  is_active: boolean;
  is_featured: boolean;
  create_time: string;
}

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Simulate API call
      const mockProducts: Product[] = [
        {
          id: 1,
          name: 'iPhone 15 Pro Max',
          sku: 'IPH15PM-256-BLU',
          price: 45999.99,
          stock_quantity: 25,
          category: 'Electronics',
          vendor: 'TechStore',
          is_active: true,
          is_featured: true,
          create_time: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'Samsung Galaxy S24 Ultra',
          sku: 'SGS24U-512-BLK',
          price: 42999.99,
          stock_quantity: 15,
          category: 'Electronics',
          vendor: 'MobileWorld',
          is_active: true,
          is_featured: false,
          create_time: '2024-01-02T00:00:00Z'
        },
        {
          id: 3,
          name: 'MacBook Pro 16"',
          sku: 'MBP16-M3-1TB',
          price: 89999.99,
          stock_quantity: 5,
          category: 'Computers',
          vendor: 'AppleStore',
          is_active: true,
          is_featured: true,
          create_time: '2024-01-03T00:00:00Z'
        },
        {
          id: 4,
          name: 'Nike Air Max 270',
          sku: 'NAM270-42-WHT',
          price: 1299.99,
          stock_quantity: 0,
          category: 'Fashion',
          vendor: 'SportShop',
          is_active: false,
          is_featured: false,
          create_time: '2024-01-04T00:00:00Z'
        }
      ];
      
      setTimeout(() => {
        setProducts(mockProducts);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
    } else if (quantity < 10) {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    } else {
      return { label: 'In Stock', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Product Catalog Service
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage marketplace products, inventory, and categories
          </p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-red-500 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add New Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  8,750
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
                  Active Products
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  7,892
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Low Stock
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  156
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Featured
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  245
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Management */}
      <Card>
        <CardHeader>
          <CardTitle>Product Database</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products by name, SKU, or category..."
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
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock_quantity);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            SKU: {product.sku}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatPrice(product.price)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {product.stock_quantity} units
                          </div>
                          <Badge className={stockStatus.color}>
                            {stockStatus.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {product.vendor}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge 
                            variant={product.is_active ? 'default' : 'secondary'}
                            className={product.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                          >
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {product.is_featured && (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              Featured
                            </Badge>
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
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-3 h-3" />
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
