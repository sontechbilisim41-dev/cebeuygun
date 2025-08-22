
'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  AlertTriangle,
  Star,
  Plus,
  Eye,
  RefreshCw
} from 'lucide-react';
import { VendorSalesChart } from './VendorSalesChart';
import { VendorQuickActions } from './VendorQuickActions';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchVendorStats, fetchSalesChart } from '@/store/slices/vendorSlice';

export function VendorDashboard() {
  const dispatch = useAppDispatch();
  const { stats, salesChart, loading } = useAppSelector(state => state.vendor);
  
  // Mock vendor ID - gerçek uygulamada auth'dan gelecek
  const vendorId = 1;

  useEffect(() => {
    dispatch(fetchVendorStats(vendorId));
    dispatch(fetchSalesChart({ vendorId, period: '7d' }));
  }, [dispatch, vendorId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const statCards = [
    {
      title: 'Bugünkü Satış',
      value: formatPrice(stats.todaySales),
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      change: '+%12.5',
      changeColor: 'text-green-600'
    },
    {
      title: 'Aylık Satış',
      value: formatPrice(stats.monthlySales),
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600',
      change: '+%8.2',
      changeColor: 'text-blue-600'
    },
    {
      title: 'Bekleyen Siparişler',
      value: stats.pendingOrders.toString(),
      icon: ShoppingCart,
      color: 'from-yellow-500 to-yellow-600',
      change: stats.pendingOrders > 0 ? 'Acil' : 'Normal',
      changeColor: stats.pendingOrders > 0 ? 'text-red-600' : 'text-green-600'
    },
    {
      title: 'Düşük Stok Ürünleri',
      value: stats.lowStockProducts.toString(),
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      change: stats.lowStockProducts > 0 ? 'Dikkat' : 'İyi',
      changeColor: stats.lowStockProducts > 0 ? 'text-red-600' : 'text-green-600'
    }
  ];

  const performanceCards = [
    {
      title: 'Toplam Ürün',
      value: stats.totalProducts,
      subtitle: `${stats.activeProducts} aktif`
    },
    {
      title: 'Toplam Sipariş',
      value: stats.totalOrders,
      subtitle: 'Bu ay'
    },
    {
      title: 'Mağaza Puanı',
      value: stats.averageRating.toFixed(1),
      subtitle: '5 üzerinden',
      icon: Star
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mağaza Özeti
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Satış performansınız ve mağaza durumunuz
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            dispatch(fetchVendorStats(vendorId));
            dispatch(fetchSalesChart({ vendorId, period: '7d' }));
          }}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stat.value}
                    </p>
                    <p className={`text-sm mt-1 ${stat.changeColor}`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {performanceCards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {card.value}
                    </p>
                    {card.icon && <card.icon className="w-5 h-5 text-yellow-500" />}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VendorSalesChart data={salesChart} />
        </div>
        <div>
          <VendorQuickActions />
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Son Aktiviteler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Yeni sipariş alındı</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Sipariş #12345 - 2 dakika önce</p>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Yeni
              </Badge>
            </div>

            <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Stok uyarısı</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">iPhone 15 Pro Max - Stok azalıyor</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Uyarı
              </Badge>
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Ürün onaylandı</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Samsung Galaxy S24 - Admin tarafından onaylandı</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Onaylandı
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
