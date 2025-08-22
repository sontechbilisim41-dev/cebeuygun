
'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/types';
import { storage } from '@/lib/localStorage';

export function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = () => {
      const data = storage.getProducts();
      // Sort by creation date and get newest products
      const sortedProducts = data
        .filter((product: Product) => product.isActive)
        .sort((a: Product, b: Product) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8);
      setProducts(sortedProducts);
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
          <h2 className="text-2xl font-bold">New Arrivals</h2>
          <a href="/new-arrivals" className="text-primary hover:underline">
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
