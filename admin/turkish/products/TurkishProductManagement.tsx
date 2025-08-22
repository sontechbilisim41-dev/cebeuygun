
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
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Upload
} from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  category_id: number;
  vendor_id: number;
  approval_status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
  is_featured: boolean;
  images: string[];
  create_time: string;
  // Ek alanlar (join'den gelecek)
  category?: string;
  vendor?: string;
}

export function TurkishProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') {
        params.approval_status = statusFilter;
      }
      
      const data = await api.get<Product[]>('/products', params);
      setProducts(data);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Ürünler yüklenemedi: ${error.message}`);
      } else {
        toast.error('Beklenmeyen bir hata oluştu');
      }
      // Hata durumunda mock data kullan
      const mockProducts: Product[] = [
        {
          id: 1,
          name: 'iPhone 15 Pro Max 256GB',
          sku: 'IPH15PM-256-BLU',
          price: 45999.99,
          stock_quantity: 25,
          category_id: 1,
          vendor_id: 1,
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
          category_id: 1,
          vendor_id: 2,
          category: 'Elektronik',
          vendor: 'MobileWorld',
          approval_status: 'approved',
          is_active: true,
          is_featured: false,
          images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400'],
          create_time: '2024-01-14T15:20:00Z'
        }
      ];
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.vendor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const updateProductStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      setActionLoading(id);
      
      await api.put(`/products?id=${id}`, {
        approval_status: status,
        is_active: status === 'approved',
        approved_at: status === 'approved' ? new Date().toISOString() : undefined,
        modify_time: new Date().toISOString()
      });

      // Local state'i güncelle
      setProducts(products.map(product => 
        product.id === id 
          ? { ...product, approval_status: status, is_active: status === 'approved' }
          : product
      ));

      const statusText = {
        approved: 'onaylandı',
        rejected: 'reddedildi'
      };

      toast.success(`Ürün ${statusText[status]}`);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`İşlem başarısız: ${error.message}`);
      } else {
        toast.error('Beklenmeyen bir hata oluştu');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const approveProduct = (id: number) => updateProductStatus(id, 'approved');
  const rejectProduct = (id: number) => updateProductStatus(id, 'rejected');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getApprovalStatusBadge = (status: Product['approval_status']) => {
    const statusConfig = {
      pending: { 
        label: 'Onay Bekliyor', 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', 
        icon: Clock 
      },
      approved: { 
        label: 'Onaylandı', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', 
        icon: CheckCircle 
      },
      rejected: { 
        label: 'Reddedildi', 
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', 
        icon: XCircle 
      }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return { 
        label: 'Stokta Yok', 
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        icon: XCircle
      };
    } else if (quantity < 10) {
      return { 
        label: 'Az Stok', 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        icon: AlertTriangle
      };
    } else {
      return { 
        label: 'Stokta Var', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        icon: CheckCircle
      };
    }
  };

  const pendingCount = products.filter(p => p.approval_status === 'pending').length;
  const approvedCount = products.filter(p => p.approval_status === 'approved').length;
  const lowStockCount = products.filter(p => p.stock_quantity < 10).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Ürün Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Ürün onay süreci ve katalog yönetimi
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Excel İçe Aktar
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Excel Dışa Aktar
          </Button>
          <Button className="bg-gradient-to-r from-cyan-500 to-red-500 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Ürün
          </Button>
        </div>
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
                  Toplam Ürün
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {products.length.toLocaleString('tr-TR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Onay Bekleyen
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingCount}
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
                  Onaylanan
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {approvedCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Az Stok
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {lowStockCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Management */}
      <Card>
        <CardHeader>
          <CardTitle>Ürün Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Ürün adı, SKU veya satıcı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="pending">Onay Bekleyen</option>
              <option value="approved">Onaylanan</option>
              <option value="rejected">Reddedilen</option>
            </select>
            <Button variant="outline" onClick={fetchProducts} disabled={loading}>
              {loading ? 'Yükleniyor...' : 'Yenile'}
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
                  <TableHead>Ürün</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Satıcı</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock_quantity);
                  const StockIcon = stockStatus.icon;
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              SKU: {product.sku}
                            </div>
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
                            {product.stock_quantity} adet
                          </div>
                          <Badge className={stockStatus.color}>
                            <StockIcon className="w-3 h-3 mr-1" />
                            {stockStatus.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.category || 'Kategori'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {product.vendor || 'Satıcı'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getApprovalStatusBadge(product.approval_status)}
                          {product.is_featured && (
                            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              Öne Çıkan
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(product.create_time)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          {product.approval_status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => approveProduct(product.id)}
                                disabled={actionLoading === product.id}
                                className="text-green-600 hover:text-green-700"
                              >
                                {actionLoading === product.id ? (
                                  <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3 h-3" />
                                )}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => rejectProduct(product.id)}
                                disabled={actionLoading === product.id}
                                className="text-red-600 hover:text-red-700"
                              >
                                {actionLoading === product.id ? (
                                  <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <XCircle className="w-3 h-3" />
                                )}
                              </Button>
                            </>
                          )}
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
