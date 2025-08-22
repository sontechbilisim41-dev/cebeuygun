
'use client';

import { useState, useEffect } from 'react';
import { CustomerHeader } from '@/components/layout/CustomerHeader';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Truck, Search, Filter } from 'lucide-react';
import Image from 'next/image';

// Mock restaurant data
const restaurants = [
  {
    id: '1',
    name: 'Pizza Palace',
    cuisine: 'İtalyan',
    rating: 4.8,
    reviewCount: 1250,
    deliveryTime: '20-30 dk',
    deliveryFee: 5.99,
    minOrder: 50,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    tags: ['Pizza', 'İtalyan', 'Hızlı'],
    isOpen: true,
    discount: '20% İndirim'
  },
  {
    id: '2',
    name: 'Burger House',
    cuisine: 'Amerikan',
    rating: 4.6,
    reviewCount: 890,
    deliveryTime: '15-25 dk',
    deliveryFee: 4.99,
    minOrder: 40,
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
    tags: ['Burger', 'Fast Food', 'Amerikan'],
    isOpen: true
  },
  {
    id: '3',
    name: 'Sushi Master',
    cuisine: 'Japon',
    rating: 4.9,
    reviewCount: 567,
    deliveryTime: '30-40 dk',
    deliveryFee: 7.99,
    minOrder: 80,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
    tags: ['Sushi', 'Japon', 'Premium'],
    isOpen: true
  },
  {
    id: '4',
    name: 'Kebap Evi',
    cuisine: 'Türk',
    rating: 4.7,
    reviewCount: 2100,
    deliveryTime: '25-35 dk',
    deliveryFee: 3.99,
    minOrder: 35,
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop',
    tags: ['Kebap', 'Türk', 'Geleneksel'],
    isOpen: true,
    discount: '15% İndirim'
  },
  {
    id: '5',
    name: 'Healthy Bowl',
    cuisine: 'Sağlıklı',
    rating: 4.5,
    reviewCount: 445,
    deliveryTime: '20-30 dk',
    deliveryFee: 6.99,
    minOrder: 45,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    tags: ['Sağlıklı', 'Vegan', 'Organik'],
    isOpen: false
  },
  {
    id: '6',
    name: 'Taco Fiesta',
    cuisine: 'Meksika',
    rating: 4.4,
    reviewCount: 678,
    deliveryTime: '25-35 dk',
    deliveryFee: 5.49,
    minOrder: 50,
    image: 'https://images.unsplash.com/photo-1565299585323-38174c4a6471?w=400&h=300&fit=crop',
    tags: ['Taco', 'Meksika', 'Baharatlı'],
    isOpen: true
  }
];

const cuisineTypes = ['Hepsi', 'Türk', 'İtalyan', 'Amerikan', 'Japon', 'Meksika', 'Sağlıklı'];

export default function FoodPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('Hepsi');
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants);

  useEffect(() => {
    let filtered = restaurants;

    // Filter by cuisine
    if (selectedCuisine !== 'Hepsi') {
      filtered = filtered.filter(restaurant => restaurant.cuisine === selectedCuisine);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredRestaurants(filtered);
  }, [searchQuery, selectedCuisine]);

  return (
    <div className="min-h-screen bg-background">
      <CustomerHeader />
      
      <main className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-red-600 mb-2">Yemek Siparişi</h1>
          <p className="text-gray-600">Binlerce restoran, her damak zevkine uygun lezzetler</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Restoran veya yemek ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Cuisine Filter */}
            <div className="flex gap-2 overflow-x-auto">
              {cuisineTypes.map((cuisine) => (
                <Button
                  key={cuisine}
                  variant={selectedCuisine === cuisine ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCuisine(cuisine)}
                  className="whitespace-nowrap"
                >
                  {cuisine}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
            🚀 Hızlı Teslimat
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
            💰 Ücretsiz Kargo
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
            ⭐ 4.5+ Puan
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
            🔥 İndirimli
          </Badge>
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <span className="text-gray-600">
            {filteredRestaurants.length} restoran bulundu
          </span>
        </div>

        {/* Restaurants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
              <div className="relative">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <Image
                    src={restaurant.image}
                    alt={restaurant.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Status Badge */}
                  <Badge 
                    className={`absolute top-2 left-2 ${
                      restaurant.isOpen 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {restaurant.isOpen ? 'Açık' : 'Kapalı'}
                  </Badge>

                  {/* Discount Badge */}
                  {restaurant.discount && (
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                      {restaurant.discount}
                    </Badge>
                  )}

                  {/* Delivery Time */}
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {restaurant.deliveryTime}
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Restaurant Info */}
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-red-600 transition-colors">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{restaurant.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({restaurant.reviewCount} değerlendirme)
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {restaurant.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Delivery Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Truck className="h-4 w-4" />
                      <span>₺{restaurant.deliveryFee} kargo</span>
                    </div>
                    <span>Min. ₺{restaurant.minOrder}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Restoran bulunamadı
            </h3>
            <p className="text-gray-600 mb-4">
              Arama kriterlerinizi değiştirmeyi deneyin
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedCuisine('Hepsi');
                setSearchQuery('');
              }}
            >
              Filtreleri Temizle
            </Button>
          </div>
        )}

        {/* Load More */}
        {filteredRestaurants.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Daha Fazla Restoran Yükle
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
