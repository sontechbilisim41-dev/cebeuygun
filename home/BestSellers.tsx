
'use client';

import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/types';
import { storage } from '@/lib/localStorage';

export function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = () => {
      const data = storage.getProducts();
      // Sort by sold count and get best sellers
      const sortedProducts = data
        .filter((product: Product) => product.isActive)
        .sort((a: Product, b: Product) => b.soldCount - a.soldCount)
        .slice(0, 8);
      setProducts(sortedProducts);
    };

    loadProducts();
  }, []);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Best Sellers
          </h2>
          <a href="/bestsellers" className="text-primary hover:underline">
            View All
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div key={product.id} className="relative">
              <ProductCard product={product} />
              {index < 3 && (
                <div className="absolute -top-2 -left-2 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-10">
                  #{index + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
