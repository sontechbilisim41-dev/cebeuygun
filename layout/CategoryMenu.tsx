
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Category } from '@/types';
import { storage } from '@/lib/localStorage';
import { cn } from '@/lib/utils';

export function CategoryMenu() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = () => {
      const data = storage.getCategories();
      setCategories(data.filter((cat: Category) => cat.level === 0 && cat.isActive));
    };

    loadCategories();
  }, []);

  return (
    <div className="flex h-12 items-center">
      <NavigationMenu>
        <NavigationMenuList>
          {/* All Categories */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="h-10">
              <Grid3X3 className="h-4 w-4 mr-2" />
              All Categories
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[600px] grid-cols-2 gap-4 p-6">
                {categories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <Link
                      href={`/category/${category.slug}`}
                      className="block font-medium text-sm hover:text-primary"
                    >
                      {category.name}
                    </Link>
                    {category.children && category.children.length > 0 && (
                      <div className="space-y-1">
                        {category.children.slice(0, 4).map((child) => (
                          <Link
                            key={child.id}
                            href={`/category/${child.slug}`}
                            className="block text-sm text-muted-foreground hover:text-primary"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Quick Categories */}
          {categories.slice(0, 6).map((category) => (
            <NavigationMenuItem key={category.id}>
              <Link href={`/category/${category.slug}`} legacyBehavior passHref>
                <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  {category.name}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Quick Links */}
      <div className="ml-auto hidden md:flex items-center gap-4 text-sm">
        <Link href="/deals" className="text-red-600 font-medium hover:underline">
          🔥 Flash Deals
        </Link>
        <Link href="/new-arrivals" className="text-green-600 font-medium hover:underline">
          ✨ New Arrivals
        </Link>
        <Link href="/bestsellers" className="text-blue-600 font-medium hover:underline">
          🏆 Best Sellers
        </Link>
      </div>
    </div>
  );
}
