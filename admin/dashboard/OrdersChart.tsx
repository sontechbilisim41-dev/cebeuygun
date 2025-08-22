
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingCart } from 'lucide-react';

const data = [
  { name: 'Mon', orders: 245 },
  { name: 'Tue', orders: 312 },
  { name: 'Wed', orders: 289 },
  { name: 'Thu', orders: 356 },
  { name: 'Fri', orders: 423 },
  { name: 'Sat', orders: 498 },
  { name: 'Sun', orders: 387 }
];

export function OrdersChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-cyan-500" />
          Daily Orders (This Week)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="name" 
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis 
                className="text-gray-600 dark:text-gray-400"
              />
              <Tooltip 
                formatter={(value: number) => [value, 'Orders']}
                labelStyle={{ color: 'var(--foreground)' }}
                contentStyle={{ 
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="orders" 
                fill="url(#orderGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
