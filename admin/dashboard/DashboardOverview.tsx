
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
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { RealtimeMetrics } from './RealtimeMetrics';
import { ServiceHealthStatus } from './ServiceHealthStatus';
import { RevenueChart } from './RevenueChart';
import { OrdersChart } from './OrdersChart';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeVendors: number;
  activeCouriers: number;
  pendingOrders: number;
  completedOrders: number;
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeVendors: 0,
    activeCouriers: 0,
    pendingOrders: 0,
    completedOrders: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    const timer = setTimeout(() => {
      setStats({
        totalUsers: 15420,
        totalProducts: 8750,
        totalOrders: 3240,
        totalRevenue: 1250000,
        activeVendors: 340,
        activeCouriers: 125,
        pendingOrders: 45,
        completedOrders: 3195
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'from-cyan-500 to-cyan-600',
      change: '+12.5%'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      change: '+8.2%'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'from-green-500 to-green-600',
      change: '+15.3%'
    },
    {
      title: 'Total Revenue',
      value: `₺${(stats.totalRevenue / 1000).toFixed(0)}K`,
      icon: TrendingUp,
      color: 'from-red-500 to-red-600',
      change: '+23.1%'
    }
  ];

  const serviceMetrics = [
    {
      service: 'User Management',
      status: 'healthy',
      responseTime: '45ms',
      uptime: '99.9%'
    },
    {
      service: 'Product Catalog',
      status: 'healthy',
      responseTime: '32ms',
      uptime: '99.8%'
    },
    {
      service: 'Order Processing',
      status: 'warning',
      responseTime: '120ms',
      uptime: '99.5%'
    },
    {
      service: 'Food Service',
      status: 'healthy',
      responseTime: '28ms',
      uptime: '99.9%'
    },
    {
      service: 'Quick Market',
      status: 'healthy',
      responseTime: '35ms',
      uptime: '99.7%'
    },
    {
      service: 'Logistics',
      status: 'healthy',
      responseTime: '42ms',
      uptime: '99.6%'
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
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time platform analytics and microservices monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            All Systems Operational
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
                      {stat.change} from last month
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
      <RealtimeMetrics />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <OrdersChart />
      </div>

      {/* Service Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-500" />
            Microservices Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceMetrics.map((service, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {service.service}
                  </h4>
                  <Badge 
                    variant={service.status === 'healthy' ? 'default' : 'destructive'}
                    className={
                      service.status === 'healthy' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : service.status === 'warning'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : ''
                    }
                  >
                    {service.status === 'healthy' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {service.status === 'warning' && <AlertCircle className="w-3 h-3 mr-1" />}
                    {service.status === 'healthy' ? 'Healthy' : 'Warning'}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Response Time:</span>
                    <span className="font-medium">{service.responseTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uptime:</span>
                    <span className="font-medium">{service.uptime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Pending Orders
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.pendingOrders} orders waiting
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Active Vendors
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.activeVendors} vendors online
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Active Couriers
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.activeCouriers} couriers available
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
