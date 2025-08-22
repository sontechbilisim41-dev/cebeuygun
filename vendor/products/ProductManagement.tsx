
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
  AlertTriangle,
  CheckCircle,
  Clock,
  Upload,
  Download,
  Filter
} from 'lucide-react';
import { ProductWizard } from './ProductWizard';
import { BulkProductActions } from './BulkProductActions';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchProducts, setFilters, setPagination } from '@/store/slices/productsSlice';

export function ProductManagement() {
  const dispatch = useAppDispatch();
  const { products, loading, filters, pagination } = useAppSelector(state => state.products);
  const [showWizard, setShowWizard] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  
  // Mock vendor ID
  const vendorId = 1;

  useEffect(() => {
    dispatch(fetchProducts({ vendorId, filters, pagination }));
  }, [dispatch, vendorId, filters, pagination]);

  const handleSearch = (value: string) => {
    dispatch(setFilters({ search: value }));
    dispatch(setPagination({ page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    dispatch(setFilters({ status }));
    dispatch(setPagination({ page: 1 }));
  };

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
      day: 'numeric'
    });
  };

  const getApprovalStatusBadge = (status: string) => {
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
        icon: AlertTriangle 
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getStockStatus = (quantity: number, minLevel: number) => {
    if (quantity === 0) {
      return { 
        label: 'Stokta Yok', 
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        icon: AlertTriangle
      };
    } else if (quantity <= minLevel) {
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

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  // Mock stats
  const stats = {
    total: products.length,
    pending: products.filter(p => p.approval_status === 'pending').length,
    approved: products.filter(p => p.approval_status === 'approved').length,
    lowStock: products.filter(p => p.stock_quantity <= p.min_stock_level).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Ürün Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Mağazanızdaki ürünleri yönetin ve stok takibi yapın
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBulkActions(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Toplu İşlemler
          </Button>
          <Button 
            onClick={() => setShowWizard(true)}
            className="bg-gradient-to-r from-cyan-500 to-red-500 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Ürün Ekle
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
                  {stats.total}
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
                  {stats.pending}
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
                  {stats.approved}
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
                  {stats.lowStock}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ürün Listesi</CardTitle>
            {selectedProducts.length > 0 && (
              <Badge variant="outline">
                {selectedProducts.length} ürün seçildi
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Ürün adı veya SKU ara..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="pending">Onay Bekleyen</option>
              <option value="approved">Onaylanan</option>
              <option value="rejected">Reddedilen</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtrele
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Dışa Aktar
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
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={toggleAllProducts}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead>Ürün</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.stock_quantity, product.min_stock_level);
                  const StockIcon = stockStatus.icon;
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="rounded"
                        />
                      </TableCell>
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
                          {product.category_name || 'Kategori'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getApprovalStatusBadge(product.approval_status)}
                          {!product.is_active && (
                            <Badge variant="secondary">
                              Pasif
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

      {/* Modals */}
      {showWizard && (
        <ProductWizard 
          onClose={() => setShowWizard(false)}
          onSuccess={() => {
            setShowWizard(false);
            dispatch(fetchProducts({ vendorId, filters, pagination }));
          }}
        />
      )}

      {showBulkActions && (
        <BulkProductActions
          selectedProducts={selectedProducts}
          onClose={() => setShowBulkActions(false)}
          onSuccess={() => {
            setShowBulkActions(false);
            setSelectedProducts([]);
            dispatch(fetchProducts({ vendorId, filters, pagination }));
          }}
        />
      )}
    </div>
  );
}
