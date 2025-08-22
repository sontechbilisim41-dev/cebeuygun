
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface VendorSalesChartProps {
  data: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

export function VendorSalesChart({ data }: VendorSalesChartProps) {
  // Mock data if no data provided
  const chartData = data.length > 0 ? data : [
    { date: 'Pzt', sales: 12500, orders: 15 },
    { date: 'Sal', sales: 18200, orders: 22 },
    { date: 'Çar', sales: 15800, orders: 19 },
    { date: 'Per', sales: 22100, orders: 28 },
    { date: 'Cum', sales: 28500, orders: 35 },
    { date: 'Cmt', sales: 31200, orders: 42 },
    { date: 'Paz', sales: 25800, orders: 31 }
  ];

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Son 7 Gün Satış Performansı
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="date" 
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis 
                yAxisId="sales"
                orientation="left"
                className="text-gray-600 dark:text-gray-400"
                tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`}
              />
              <YAxis 
                yAxisId="orders"
                orientation="right"
                className="text-gray-600 dark:text-gray-400"
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'sales') {
                    return [formatPrice(value), 'Satış'];
                  }
                  return [value, 'Sipariş'];
                }}
                labelStyle={{ color: 'var(--foreground)' }}
                contentStyle={{ 
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
              <Line 
                yAxisId="sales"
                type="monotone" 
                dataKey="sales" 
                stroke="#10b981" 
                strokeWidth={3}
                name="sales"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                yAxisId="orders"
                type="monotone" 
                dataKey="orders" 
                stroke="#06b6d4" 
                strokeWidth={3}
                name="orders"
                dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Satış (₺)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Sipariş Sayısı</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
