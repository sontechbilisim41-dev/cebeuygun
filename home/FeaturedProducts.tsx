
'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/types';
import { storage } from '@/lib/localStorage';

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = () => {
      const data = storage.getProducts();
      setProducts(data.filter((product: Product) => product.isFeatured && product.isActive).slice(0, 8));
    };

    loadProducts();
  }, []);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <a href="/products" className="text-primary hover:underline">
            View All
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
