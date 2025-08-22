
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Truck } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

export function FeaturedSection() {
  const [featuredItems, setFeaturedItems] = useState([]);

  // Mock featured items - in real app, this would come from API
  const mockFeaturedItems = [
    {
      id: 1,
      type: "product",
      name: "Premium Wireless Headphones",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
      price: "₺299.99",
      originalPrice: "₺399.99",
      rating: 4.8,
      reviews: 1250,
      badge: "Best Seller",
    },
    {
      id: 2,
      type: "restaurant",
      name: "Istanbul Kebab House",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
      deliveryTime: "25-35 min",
      deliveryFee: "Free delivery",
      rating: 4.6,
      reviews: 890,
      badge: "Popular",
    },
    {
      id: 3,
      type: "grocery",
      name: "Fresh Organic Vegetables",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
      deliveryTime: "30 min",
      discount: "20% OFF",
      rating: 4.9,
      reviews: 456,
      badge: "Fresh",
    },
    {
      id: 4,
      type: "product",
      name: "Smart Home Security Camera",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      price: "₺199.99",
      originalPrice: "₺249.99",
      rating: 4.7,
      reviews: 678,
      badge: "Tech Deal",
    },
  ];

  useEffect(() => {
    setFeaturedItems(mockFeaturedItems);
  }, []);

  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Featured This Week
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover trending products, popular restaurants, and fresh groceries
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockFeaturedItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-2 left-2 bg-red-600 text-white">
                  {item.badge}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.name}</h3>
                
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{item.rating}</span>
                  <span className="text-sm text-gray-500">({item.reviews})</span>
                </div>

                {item.type === "product" && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-red-600">{item.price}</span>
                    {item.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">{item.originalPrice}</span>
                    )}
                  </div>
                )}

                {item.type === "restaurant" && (
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{item.deliveryTime}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <Truck className="h-4 w-4" />
                      <span>{item.deliveryFee}</span>
                    </div>
                  </div>
                )}

                {item.type === "grocery" && (
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{item.deliveryTime} delivery</span>
                    </div>
                    {item.discount && (
                      <div className="text-sm font-medium text-green-600">
                        {item.discount}
                      </div>
                    )}
                  </div>
                )}

                <Button className="w-full" size="sm">
                  {item.type === "product" ? "Add to Cart" : 
                   item.type === "restaurant" ? "Order Now" : "Shop Now"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Featured Items
          </Button>
        </div>
      </div>
    </section>
  );
}
