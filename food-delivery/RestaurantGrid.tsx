
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Heart, 
  Clock, 
  Truck,
  MapPin,
  Percent
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  image: string;
  logo: string;
  distance: string;
  isOpen: boolean;
  badges: string[];
  offers: string[];
  popularDishes: string[];
}

export function RestaurantGrid() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [sortBy, setSortBy] = useState("relevance");

  // Mock restaurants data
  const mockRestaurants: Restaurant[] = [
    {
      id: 1,
      name: "Istanbul Kebab House",
      cuisine: "Turkish",
      rating: 4.8,
      reviews: 1250,
      deliveryTime: "25-35 min",
      deliveryFee: 0,
      minOrder: 30,
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=300&fit=crop",
      logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop",
      distance: "1.2 km",
      isOpen: true,
      badges: ["Popular", "Free Delivery"],
      offers: ["20% Off", "Buy 1 Get 1 Free"],
      popularDishes: ["Döner Kebab", "Lahmacun", "Pide"],
    },
    {
      id: 2,
      name: "Mario's Pizza Palace",
      cuisine: "Italian",
      rating: 4.6,
      reviews: 890,
      deliveryTime: "30-40 min",
      deliveryFee: 5,
      minOrder: 25,
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=300&fit=crop",
      logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop",
      distance: "2.1 km",
      isOpen: true,
      badges: ["New"],
      offers: ["Free Dessert"],
      popularDishes: ["Margherita Pizza", "Pepperoni", "Pasta Carbonara"],
    },
    {
      id: 3,
      name: "Burger Station",
      cuisine: "American",
      rating: 4.4,
      reviews: 567,
      deliveryTime: "20-30 min",
      deliveryFee: 3,
      minOrder: 20,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=300&fit=crop",
      logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop",
      distance: "0.8 km",
      isOpen: true,
      badges: ["Fast Delivery"],
      offers: ["Combo Deals"],
      popularDishes: ["Classic Burger", "Chicken Wings", "Fries"],
    },
    {
      id: 4,
      name: "Sushi Zen",
      cuisine: "Japanese",
      rating: 4.9,
      reviews: 432,
      deliveryTime: "35-45 min",
      deliveryFee: 8,
      minOrder: 50,
      image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500&h=300&fit=crop",
      logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop",
      distance: "3.2 km",
      isOpen: true,
      badges: ["Premium"],
      offers: ["Student Discount"],
      popularDishes: ["Salmon Roll", "Tempura", "Miso Soup"],
    },
    {
      id: 5,
      name: "Taco Fiesta",
      cuisine: "Mexican",
      rating: 4.3,
      reviews: 678,
      deliveryTime: "25-35 min",
      deliveryFee: 4,
      minOrder: 25,
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=300&fit=crop",
      logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop",
      distance: "1.8 km",
      isOpen: false,
      badges: ["Spicy"],
      offers: ["Happy Hour"],
      popularDishes: ["Beef Tacos", "Quesadilla", "Nachos"],
    },
    {
      id: 6,
      name: "Healthy Bowl Co.",
      cuisine: "Healthy",
      rating: 4.7,
      reviews: 345,
      deliveryTime: "20-30 min",
      deliveryFee: 0,
      minOrder: 35,
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&h=300&fit=crop",
      logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop",
      distance: "1.5 km",
      isOpen: true,
      badges: ["Healthy", "Free Delivery"],
      offers: ["First Order Discount"],
      popularDishes: ["Buddha Bowl", "Quinoa Salad", "Green Smoothie"],
    },
  ];

  useEffect(() => {
    setRestaurants(mockRestaurants);
  }, []);

  const formatDeliveryFee = (fee: number) => {
    return fee === 0 ? "Free" : `₺${fee}`;
  };

  return (
    <div className="space-y-6">
      {/* Sort Options */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {restaurants.length} restaurants available
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Most Relevant</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="delivery-time">Fastest Delivery</SelectItem>
              <SelectItem value="delivery-fee">Lowest Delivery Fee</SelectItem>
              <SelectItem value="distance">Nearest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <Card key={restaurant.id} className={`group overflow-hidden hover:shadow-lg transition-all duration-300 ${
            !restaurant.isOpen ? "opacity-75" : ""
          }`}>
            <div className="relative">
              <Image
                src={restaurant.image}
                alt={restaurant.name}
                width={500}
                height={300}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Restaurant Logo */}
              <div className="absolute bottom-2 left-2">
                <Image
                  src={restaurant.logo}
                  alt={`${restaurant.name} logo`}
                  width={50}
                  height={50}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                />
              </div>

              {/* Status Badge */}
              {!restaurant.isOpen && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="secondary" className="text-sm">
                    Closed
                  </Badge>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {restaurant.badges.map((badge, idx) => (
                  <Badge key={idx} className={`text-xs ${
                    badge === "Popular" ? "bg-red-600" :
                    badge === "New" ? "bg-blue-600" :
                    badge === "Premium" ? "bg-purple-600" :
                    badge === "Free Delivery" ? "bg-green-600" :
                    "bg-gray-600"
                  }`}>
                    {badge}
                  </Badge>
                ))}
              </div>

              {/* Favorite Button */}
              <div className="absolute top-2 right-2">
                <Button size="icon" variant="secondary" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              {/* Offers */}
              {restaurant.offers.length > 0 && (
                <div className="absolute bottom-2 right-2">
                  <Badge className="bg-orange-600 text-white text-xs">
                    <Percent className="h-3 w-3 mr-1" />
                    {restaurant.offers[0]}
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              {/* Restaurant Info */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{restaurant.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{restaurant.cuisine}</p>
                </div>
              </div>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-1 mb-3">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{restaurant.rating}</span>
                <span className="text-sm text-gray-500">({restaurant.reviews}+)</span>
                <span className="text-sm text-gray-400 ml-2">•</span>
                <span className="text-sm text-gray-600">{restaurant.distance}</span>
              </div>

              {/* Delivery Info */}
              <div className="flex items-center justify-between mb-3 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{restaurant.deliveryTime}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Truck className="h-4 w-4" />
                  <span>{formatDeliveryFee(restaurant.deliveryFee)} delivery</span>
                </div>
              </div>

              {/* Min Order */}
              <div className="text-xs text-gray-500 mb-3">
                Min. order: ₺{restaurant.minOrder}
              </div>

              {/* Popular Dishes */}
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-1">Popular:</div>
                <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">
                  {restaurant.popularDishes.join(" • ")}
                </div>
              </div>

              {/* Action Button */}
              <Button 
                className="w-full" 
                disabled={!restaurant.isOpen}
                variant={restaurant.isOpen ? "default" : "secondary"}
              >
                {restaurant.isOpen ? "View Menu" : "Closed"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center pt-8">
        <Button variant="outline" size="lg">
          Load More Restaurants
        </Button>
      </div>
    </div>
  );
}
