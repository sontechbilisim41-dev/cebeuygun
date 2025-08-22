
'use client';

import { useState, useEffect } from 'react';
import { Clock, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/types';
import { storage } from '@/lib/localStorage';

export function FlashDeals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const loadProducts = () => {
      const data = storage.getProducts();
      // Get products with discounts
      setProducts(data.filter((product: Product) => 
        product.salePrice && product.salePrice < product.basePrice && product.isActive
      ).slice(0, 6));
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
      <div className="container mx-auto px-4">
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Flame className="h-6 w-6" />
                Flash Deals
              </CardTitle>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <div className="flex gap-1 text-sm font-mono">
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </Badge>
                  <span>:</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </Badge>
                  <span>:</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {products.map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} compact />
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                    -{product.discountPercentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
