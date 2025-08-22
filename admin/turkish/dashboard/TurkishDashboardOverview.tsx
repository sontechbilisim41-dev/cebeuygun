
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Activity,
  CheckCircle,
  Clock,
  Store,
  Truck
} from 'lucide-react';
import { TurkishRevenueChart } from './TurkishRevenueChart';
import { TurkishOrdersChart } from './TurkishOrdersChart';
import { TurkishRealtimeMetrics } from './TurkishRealtimeMetrics';
import { mockDashboardData } from '@/data/mockData';

interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalCouriers: number;
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
  completedOrdersToday: number;
  pendingApprovals: number;
}

export function TurkishDashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>(mockDashboardData.stats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const statCards = [
    {
      title: 'Toplam Kullanıcı',
      value: stats.totalUsers.toLocaleString('tr-TR'),
      icon: Users,
      color: 'from-cyan-500 to-cyan-600',
      change: '+%12.5'
    },
    {
      title: 'Toplam Satıcı',
      value: stats.totalVendors.toLocaleString('tr-TR'),
      icon: Store,
      color: 'from-blue-500 to-blue-600',
      change: '+%8.2'
    },
    {
      title: 'Toplam Sipariş',
      value: stats.totalOrders.toLocaleString('tr-TR'),
      icon: ShoppingCart,
      color: 'from-green-500 to-green-600',
      change: '+%15.3'
    },
    {
      title: 'Toplam Gelir',
      value: `₺${(stats.totalRevenue / 1000).toFixed(0)}K`,
      icon: TrendingUp,
      color: 'from-red-500 to-red-600',
      change: '+%23.1'
    }
  ];

  const quickActions = [
    {
      title: 'Bekleyen Siparişler',
      value: stats.activeOrders,
      icon: Clock,
      color: 'bg-yellow-100 dark:bg-yellow-900',
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      title: 'Bugün Tamamlanan',
      value: stats.completedOrdersToday,
      icon: CheckCircle,
      color: 'bg-green-100 dark:bg-green-900',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Onay Bekleyen',
      value: stats.pendingApprovals,
      icon: Activity,
      color: 'bg-blue-100 dark:bg-blue-900',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Aktif Kuryeler',
      value: stats.totalCouriers,
      icon: Truck,
      color: 'bg-purple-100 dark:bg-purple-900',
      iconColor: 'text-purple-600 dark:text-purple-400'
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
            Ana Sayfa
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Platform genel durumu ve gerçek zamanlı istatistikler
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Tüm Sistemler Çalışıyor
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
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
                    <p className="text-sm text-green-600 mt-1">
                      {stat.change} geçen aydan
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

      {/* Real-time Metrics */}
      <TurkishRealtimeMetrics />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TurkishRevenueChart />
        <TurkishOrdersChart />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${action.iconColor}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {action.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {action.value} adet
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
