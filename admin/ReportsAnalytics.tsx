
'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { queries } from '@/lib/database/queries';

export function ReportsAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [salesReports, setSalesReports] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = () => {
    // Get dashboard statistics
    const dashboardStats = queries.analytics.getDashboardStats();
    setStats(dashboardStats);

    // Get sales reports
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const reports = queries.analytics.getSalesReport(startDate, endDate);
    setSalesReports(reports);

    // Get top products
    const products = queries.analytics.getTopProducts(10);
    setTopProducts(products);
  };

  if (!stats) {
    return <div>Yükleniyor...</div>;
  }

  const revenueCards = [
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
      title: 'Ortalama Sipariş Tutarı',
      value: `₺${stats.averageOrderValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
      change: '+3.1%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Aktif Müşteri',
      value: stats.totalCustomers.toLocaleString('tr-TR'),
      change: '+15.3%',
      changeType: 'increase',
      icon: Users,
      color: 'text-orange-600'
    }
  ];

  const categoryPerformance = [
    { name: 'Elektronik', revenue: 125000, orders: 450, growth: '+18%' },
    { name: 'Giyim', revenue: 89000, orders: 320, growth: '+12%' },
    { name: 'Ev & Yaşam', revenue: 67000, orders: 280, growth: '+8%' },
    { name: 'Spor', revenue: 45000, orders: 190, growth: '+22%' },
    { name: 'Kitap', revenue: 23000, orders: 150, growth: '+5%' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Raporlar & Analitik</h2>
          <p className="text-gray-600">Platform performansını analiz edin</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Dönem seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Son 7 Gün</SelectItem>
              <SelectItem value="30days">Son 30 Gün</SelectItem>
              <SelectItem value="90days">Son 3 Ay</SelectItem>
              <SelectItem value="1year">Son 1 Yıl</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            Rapor İndir
          </Button>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {revenueCards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {card.changeType === 'increase' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.change}
                    </span>
                    <span className="text-sm text-gray-500">bu dönem</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-gray-100 ${card.color}`}>
                  <card.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>En Çok Satan Ürünler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.slice(0, 8).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {product.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        {product.brand} • ₺{product.base_price}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{product.sold_count} satış</p>
                    <p className="text-xs text-gray-500">⭐ {product.rating_average}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Kategori Performansı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryPerformance.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-gray-500">{category.orders} sipariş</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₺{category.revenue.toLocaleString('tr-TR')}</p>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      {category.growth}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Müşteri Analizi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Yeni Müşteri</span>
              <span className="font-medium">+{Math.floor(stats.totalCustomers * 0.15)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tekrar Eden Müşteri</span>
              <span className="font-medium">{Math.floor(stats.totalCustomers * 0.65)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Müşteri Memnuniyeti</span>
              <span className="font-medium">4.8/5.0</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sipariş Analizi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tamamlanan</span>
              <span className="font-medium text-green-600">{Math.floor(stats.totalOrders * 0.92)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">İptal Edilen</span>
              <span className="font-medium text-red-600">{Math.floor(stats.totalOrders * 0.05)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">İade Edilen</span>
              <span className="font-medium text-orange-600">{Math.floor(stats.totalOrders * 0.03)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stok Durumu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Stokta Var</span>
              <span className="font-medium text-green-600">{stats.activeProducts - stats.lowStockProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Stok Azalıyor</span>
              <span className="font-medium text-yellow-600">{stats.lowStockProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Stokta Yok</span>
              <span className="font-medium text-red-600">12</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
