
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const data = [
  { name: 'Jan', marketplace: 120000, food: 80000, market: 45000 },
  { name: 'Feb', marketplace: 135000, food: 85000, market: 52000 },
  { name: 'Mar', marketplace: 148000, food: 92000, market: 58000 },
  { name: 'Apr', marketplace: 162000, food: 98000, market: 65000 },
  { name: 'May', marketplace: 175000, food: 105000, market: 72000 },
  { name: 'Jun', marketplace: 188000, food: 112000, market: 78000 },
  { name: 'Jul', marketplace: 195000, food: 118000, market: 85000 }
];

export function RevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Revenue by Service (₺)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
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
                formatter={(value: number) => [`₺${value.toLocaleString()}`, '']}
                labelStyle={{ color: 'var(--foreground)' }}
                contentStyle={{ 
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="marketplace" 
                stroke="#06b6d4" 
                strokeWidth={3}
                name="Marketplace"
                dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="food" 
                stroke="#dc2626" 
                strokeWidth={3}
                name="Food Delivery"
                dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="market" 
                stroke="#16a34a" 
                strokeWidth={3}
                name="Quick Market"
                dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Marketplace</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Food Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Quick Market</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
