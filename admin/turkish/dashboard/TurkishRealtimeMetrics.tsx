
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, ShoppingCart, Truck } from 'lucide-react';

interface RealtimeData {
  onlineUsers: number;
  activeOrders: number;
  availableCouriers: number;
  systemLoad: number;
}

export function TurkishRealtimeMetrics() {
  const [data, setData] = useState<RealtimeData>({
    onlineUsers: 0,
    activeOrders: 0,
    availableCouriers: 0,
    systemLoad: 0
  });

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setData({
        onlineUsers: Math.floor(Math.random() * 500) + 1200,
        activeOrders: Math.floor(Math.random() * 50) + 25,
        availableCouriers: Math.floor(Math.random() * 30) + 80,
        systemLoad: Math.floor(Math.random() * 30) + 45
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const metrics = [
    {
      title: 'Çevrimiçi Kullanıcı',
      value: data.onlineUsers.toLocaleString('tr-TR'),
      icon: Users,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900'
    },
    {
      title: 'Aktif Siparişler',
      value: data.activeOrders.toString(),
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      title: 'Müsait Kuryeler',
      value: data.availableCouriers.toString(),
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      title: 'Sistem Yükü',
      value: `%${data.systemLoad}`,
      icon: Activity,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-500" />
            Gerçek Zamanlı Metrikler
          </CardTitle>
          <Badge variant="outline" className="text-green-600 border-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Canlı
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {metric.title}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {metric.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
