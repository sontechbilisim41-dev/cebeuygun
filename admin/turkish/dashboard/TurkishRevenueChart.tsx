
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { mockDashboardData } from '@/data/mockData';

export function TurkishRevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Hizmet Bazında Gelir (₺)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockDashboardData.salesChart}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="name" 
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis 
                className="text-gray-600 dark:text-gray-400"
                tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                formatter={(value: number) => [`₺${value.toLocaleString('tr-TR')}`, '']}
                labelStyle={{ color: 'var(--foreground)' }}
                contentStyle={{ 
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="pazaryeri" 
                stroke="#06b6d4" 
                strokeWidth={3}
                name="Pazaryeri"
                dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="yemek" 
                stroke="#dc2626" 
                strokeWidth={3}
                name="Yemek Teslimatı"
                dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="market" 
                stroke="#16a34a" 
                strokeWidth={3}
                name="Hızlı Market"
                dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Pazaryeri</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Yemek Teslimatı</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Hızlı Market</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
