
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Category } from '@/types';
import { storage } from '@/lib/localStorage';

export function QuickCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = () => {
      const data = storage.getCategories();
      setCategories(data.filter((cat: Category) => cat.level === 0 && cat.isActive).slice(0, 8));
    };

    loadCategories();
  }, []);

  return (
    <section className="py-6 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-xl font-bold mb-4 text-navy-900">Kategoriler</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group border border-gray-100">
                <CardContent className="p-3 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full overflow-hidden bg-gray-50">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center">
                        <span className="text-lg">📦</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xs font-medium text-center group-hover:text-navy-900 transition-colors text-gray-700">
                    {category.name}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
