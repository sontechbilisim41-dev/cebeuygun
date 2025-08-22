
'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Package, ShoppingCart, DollarSign, Store, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { queries } from '@/lib/database/queries';

export function DashboardStats() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [pendingVendors, setPendingVendors] = useState<number>(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Get dashboard statistics
    const dashboardStats = queries.analytics.getDashboardStats();
    setStats(dashboardStats);

    // Get recent orders
    const orders = queries.orders.getRecent(5);
    setRecentOrders(orders);

    // Get top products
    const products = queries.analytics.getTopProducts(5);
    setTopProducts(products);

    // Mock pending vendors count
    setPendingVendors(3);
  };

  if (!stats) {
    return <div>Yükleniyor...</div>;
  }

  const statCards = [
    {
      title: 'Toplam Gelir',
      value: `₺${stats.totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
      change: '+12.5%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Toplam Sipariş',
      value: stats.totalOrders.toLocaleString('tr-TR'),
      change: '+8.2%',
      changeType: 'increase',
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      title: 'Toplam Müşteri',
      value: stats.totalCustomers.toLocaleString('tr-TR'),
      change: '+15.3%',
      changeType: 'increase',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Aktif Satıcı',
      value: stats.totalVendors.toLocaleString('tr-TR'),
      change: '+5.1%',
      changeType: 'increase',
      icon: Store,
      color: 'text-orange-600'
    }
  ];

  const getOrderStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'Bekliyor', variant: 'secondary' as const },
      'confirmed': { label: 'Onaylandı', variant: 'default' as const },
      'preparing': { label: 'Hazırlanıyor', variant: 'default' as const },
      'ready': { label: 'Hazır', variant: 'default' as const },
      'picked_up': { label: 'Alındı', variant: 'default' as const },
      'in_transit': { label: 'Yolda', variant: 'default' as const },
      'delivered': { label: 'Teslim Edildi', variant: 'default' as const },
      'cancelled': { label: 'İptal Edildi', variant: 'destructive' as const }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    
    return (
      <Badge variant={statusInfo.variant} className={statusInfo.variant === 'default' ? 'bg-green-500' : ''}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Pending Vendors Alert */}
      {pendingVendors > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium text-yellow-800">
                  {pendingVendors} satıcı başvurusu onay bekliyor
                </p>
                <p className="text-sm text-yellow-700">
                  Yeni satıcı başvurularını incelemek için Satıcı Yönetimi bölümüne gidin.
                </p>
              </div>
              <a href="/admin/vendors" className="text-yellow-800 hover:text-yellow-900 font-medium text-sm">
                İncele →
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.changeType === 'increase' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500">bu ay</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Son Siparişler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-gray-500">
                        {order.customer?.name || 'Müşteri'} • ₺{order.total_amount}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getOrderStatusBadge(order.status)}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              ))}
              
              {recentOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Henüz sipariş yok</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>En Çok Satan Ürünler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-orange-600">#{index + 1}</span>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {product.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {product.brand} • ₺{product.base_price}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{product.sold_count} satış</p>
                    <p className="text-sm text-gray-500">⭐ {product.rating_average}</p>
                  </div>
                </div>
              ))}
              
              {topProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Henüz satış verisi yok</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Ortalama Sipariş Tutarı</p>
              <p className="text-3xl font-bold text-blue-600">
                ₺{stats.averageOrderValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Bugünkü Siparişler</p>
              <p className="text-3xl font-bold text-green-600">{stats.todayOrders}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Onay Bekleyen Satıcı</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingVendors}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Stok Azalan Ürünler</p>
              <p className="text-3xl font-bold text-red-600">{stats.lowStockProducts}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
