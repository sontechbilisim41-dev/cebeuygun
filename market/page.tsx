
'use client';

import { useState, useEffect } from 'react';
import { CustomerHeader } from '@/components/layout/CustomerHeader';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Truck, Search, Filter, Zap } from 'lucide-react';
import { Product } from '@/types';
import { storage } from '@/lib/localStorage';

// Market categories
const marketCategories = [
  { id: 'fruits', name: 'Meyve & Sebze', icon: '🥕', color: 'bg-green-100 text-green-700' },
  { id: 'dairy', name: 'Süt & Kahvaltı', icon: '🥛', color: 'bg-blue-100 text-blue-700' },
  { id: 'meat', name: 'Et & Tavuk', icon: '🥩', color: 'bg-red-100 text-red-700' },
  { id: 'bakery', name: 'Fırın & Pastane', icon: '🍞', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'snacks', name: 'Atıştırmalık', icon: '🍿', color: 'bg-orange-100 text-orange-700' },
  { id: 'beverages', name: 'İçecekler', icon: '🥤', color: 'bg-purple-100 text-purple-700' },
  { id: 'cleaning', name: 'Temizlik', icon: '🧽', color: 'bg-teal-100 text-teal-700' },
  { id: 'personal', name: 'Kişisel Bakım', icon: '🧴', color: 'bg-pink-100 text-pink-700' }
];

export default function MarketPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadProducts = () => {
      const data = storage.getProducts();
      // Filter for market products (groceries and daily essentials)
      const marketProducts = data.filter((product: Product) => 
        product.isActive && 
        (product.categoryId === '1' || product.categoryId === '1-1' || product.categoryId === '1-2')
      );
      setProducts(marketProducts);
    };

    loadProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by delivery time (fastest first)
    filtered.sort((a, b) => a.deliveryTime.express - b.deliveryTime.express);

    setFilteredProducts(filtered);
  }, [products, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <CustomerHeader />
      
      <main className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-600">Hızlı Market</h1>
          </div>
          <p className="text-gray-600">Günlük ihtiyaçlarınız 10-30 dakikada kapınızda!</p>
        </div>

        {/* Delivery Promise */}
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-full">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">Süper Hızlı Teslimat</h3>
                  <p className="text-sm text-green-700">10-30 dakikada teslim garantisi</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">10-30</div>
                <div className="text-sm text-green-700">dakika</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Market ürünleri ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Kategoriler</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {marketCategories.map((category) => (
              <Card 
                key={category.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-3 text-center">
                  <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <h3 className="text-xs font-medium text-center">
                    {category.name}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
            ⚡ 10 Dk Teslimat
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
            🆕 Taze Ürünler
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
            💰 İndirimli
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
            ❄️ Soğuk Zincir
          </Badge>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-gray-600">
            {filteredProducts.length} ürün bulundu
          </span>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Clock className="h-4 w-4" />
            <span>En hızlı teslimat sürelerine göre sıralandı</span>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard product={product} compact />
              {/* Express Delivery Badge */}
              {product.deliveryTime.express <= 15 && (
                <Badge className="absolute -top-2 -left-2 bg-green-500 text-white z-10">
                  ⚡ {product.deliveryTime.express}dk
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ürün bulunamadı
            </h3>
            <p className="text-gray-600 mb-4">
              Arama kriterlerinizi değiştirmeyi deneyin
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery('')}
            >
              Aramayı Temizle
            </Button>
          </div>
        )}

        {/* Load More */}
        {filteredProducts.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Daha Fazla Ürün Yükle
            </Button>
          </div>
        )}

        {/* Market Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">10-30 Dakika Teslimat</h3>
              <p className="text-sm text-gray-600">
                Siparişiniz en geç 30 dakika içinde kapınızda
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❄️</span>
              </div>
              <h3 className="font-semibold mb-2">Soğuk Zincir</h3>
              <p className="text-sm text-gray-600">
                Taze ve dondurulmuş ürünler güvenle teslim edilir
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏪</span>
              </div>
              <h3 className="font-semibold mb-2">Yerel Marketler</h3>
              <p className="text-sm text-gray-600">
                Mahallenizdeki güvenilir marketlerden alışveriş
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
