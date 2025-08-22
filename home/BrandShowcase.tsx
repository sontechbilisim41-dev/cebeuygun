
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types';
import { storage } from '@/lib/localStorage';

interface Brand {
  name: string;
  logo: string;
  productCount: number;
}

export function BrandShowcase() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    const loadBrands = () => {
      const products = storage.getProducts();
      const brandMap = new Map<string, number>();
      
      products.forEach((product: Product) => {
        if (product.isActive) {
          brandMap.set(product.brand, (brandMap.get(product.brand) || 0) + 1);
        }
      });

      const topBrands = Array.from(brandMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({
          name,
          logo: `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop&q=80&text=${encodeURIComponent(name)}`,
          productCount: count
        }));

      setBrands(topBrands);
    };

    loadBrands();
  }, []);

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Popular Brands</h2>
          <a href="/brands" className="text-primary hover:underline">
            View All Brands
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {brands.map((brand) => (
            <Link key={brand.name} href={`/brand/${encodeURIComponent(brand.name.toLowerCase())}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <div className="w-full h-16 mb-3 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-600 group-hover:text-primary transition-colors">
                      {brand.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {brand.productCount} products
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
