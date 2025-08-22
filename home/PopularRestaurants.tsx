
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Truck, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const restaurants = [
  {
    id: 1,
    name: "Burger King",
    cuisine: "Fast Food",
    rating: 4.5,
    reviewCount: 2890,
    deliveryTime: "20-30 dk",
    deliveryFee: 5.99,
    minOrder: 35,
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop",
    logo: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=60&h=60&fit=crop",
    isPromoted: true,
    discount: "20% İndirim",
    tags: ["Hızlı Teslimat", "Popüler"]
  },
  {
    id: 2,
    name: "Sushi World",
    cuisine: "Japon Mutfağı",
    rating: 4.8,
    reviewCount: 1245,
    deliveryTime: "35-45 dk",
    deliveryFee: 8.99,
    minOrder: 80,
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
    logo: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=60&h=60&fit=crop",
    isPromoted: false,
    discount: null,
    tags: ["Premium", "Taze"]
  },
  {
    id: 3,
    name: "Pizza Palace",
    cuisine: "İtalyan",
    rating: 4.6,
    reviewCount: 3456,
    deliveryTime: "25-35 dk",
    deliveryFee: 4.99,
    minOrder: 40,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
    logo: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=60&h=60&fit=crop",
    isPromoted: true,
    discount: "15% İndirim",
    tags: ["Aile Dostu", "Büyük Porsiyon"]
  },
  {
    id: 4,
    name: "Kebap House",
    cuisine: "Türk Mutfağı",
    rating: 4.7,
    reviewCount: 1890,
    deliveryTime: "30-40 dk",
    deliveryFee: 6.99,
    minOrder: 50,
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop",
    logo: "https://images.unsplash.com/photo-1544025162-d76694265947?w=60&h=60&fit=crop",
    isPromoted: false,
    discount: null,
    tags: ["Geleneksel", "Lezzetli"]
  },
  {
    id: 5,
    name: "Healthy Bowl",
    cuisine: "Sağlıklı",
    rating: 4.4,
    reviewCount: 987,
    deliveryTime: "20-30 dk",
    deliveryFee: 7.99,
    minOrder: 45,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    logo: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=60&h=60&fit=crop",
    isPromoted: false,
    discount: "10% İndirim",
    tags: ["Organik", "Vegan Seçenekler"]
  },
  {
    id: 6,
    name: "Taco Fiesta",
    cuisine: "Meksika Mutfağı",
    rating: 4.3,
    reviewCount: 756,
    deliveryTime: "25-35 dk",
    deliveryFee: 5.99,
    minOrder: 35,
    image: "https://images.unsplash.com/photo-1565299585323-38174c4a6471?w=400&h=300&fit=crop",
    logo: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=60&h=60&fit=crop",
    isPromoted: true,
    discount: "25% İndirim",
    tags: ["Baharatlı", "Yeni"]
  }
];

export function PopularRestaurants() {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Popüler Restoranlar</h2>
            <p className="text-muted-foreground">En sevilen restoranlardan lezzetli yemekler</p>
          </div>
          <Link href="/restaurants">
            <Button variant="outline">
              Tümünü Gör
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative">
                <Image
                  src={restaurant.image}
                  alt={restaurant.name}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Promoted Badge */}
                {restaurant.isPromoted && (
                  <Badge className="absolute top-3 left-3 bg-orange-500 hover:bg-orange-600">
                    Sponsorlu
                  </Badge>
                )}

                {/* Discount Badge */}
                {restaurant.discount && (
                  <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600">
                    {restaurant.discount}
                  </Badge>
                )}

                {/* Restaurant Logo */}
                <div className="absolute bottom-3 left-3">
                  <Image
                    src={restaurant.logo}
                    alt={`${restaurant.name} logo`}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                  />
                </div>

                {/* Wishlist Button */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute bottom-3 right-3 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{restaurant.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({restaurant.reviewCount})
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span>{formatPrice(restaurant.deliveryFee)}</span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Min. sipariş: {formatPrice(restaurant.minOrder)}
                </div>

                <div className="flex flex-wrap gap-1">
                  {restaurant.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Link href={`/restaurants/${restaurant.id}`}>
                  <Button className="w-full">
                    Menüyü Gör
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
