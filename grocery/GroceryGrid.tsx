
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Minus, 
  Heart, 
  Clock,
  Leaf,
  Zap,
  Shield
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

interface GroceryItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  store: string;
  badges: string[];
  inStock: boolean;
  quantity: number;
  expiryDate?: string;
  isPerishable: boolean;
}

export function GroceryGrid() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [sortBy, setSortBy] = useState("relevance");

  // Mock grocery items data
  const mockItems: GroceryItem[] = [
    {
      id: 1,
      name: "Organic Red Apples",
      brand: "Fresh Farm",
      price: 12.99,
      originalPrice: 15.99,
      unit: "per kg",
      image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop",
      store: "Migros",
      badges: ["Organic", "Fresh Today"],
      inStock: true,
      quantity: 0,
      expiryDate: "2024-01-15",
      isPerishable: true,
    },
    {
      id: 2,
      name: "Whole Milk",
      brand: "Sütaş",
      price: 8.50,
      unit: "1L",
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",
      store: "Carrefour",
      badges: ["Fresh Today"],
      inStock: true,
      quantity: 0,
      expiryDate: "2024-01-10",
      isPerishable: true,
    },
    {
      id: 3,
      name: "Whole Wheat Bread",
      brand: "Uno",
      price: 6.75,
      originalPrice: 7.50,
      unit: "750g",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop",
      store: "BIM",
      badges: ["Best Price", "Local Product"],
      inStock: true,
      quantity: 0,
      expiryDate: "2024-01-08",
      isPerishable: true,
    },
    {
      id: 4,
      name: "Free Range Eggs",
      brand: "Çiftlik",
      price: 18.99,
      unit: "30 pieces",
      image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop",
      store: "Şok",
      badges: ["Organic", "Popular"],
      inStock: true,
      quantity: 0,
      expiryDate: "2024-01-12",
      isPerishable: true,
    },
    {
      id: 5,
      name: "Premium Olive Oil",
      brand: "Komili",
      price: 45.99,
      originalPrice: 52.99,
      unit: "500ml",
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop",
      store: "Metro",
      badges: ["Premium", "Local Product"],
      inStock: true,
      quantity: 0,
      isPerishable: false,
    },
    {
      id: 6,
      name: "Greek Yogurt",
      brand: "Danone",
      price: 4.25,
      unit: "150g",
      image: "https://images.unsplash.com/photo-1571212515416-fca88c2d2c3e?w=400&h=400&fit=crop",
      store: "A101",
      badges: ["Protein Rich"],
      inStock: false,
      quantity: 0,
      expiryDate: "2024-01-09",
      isPerishable: true,
    },
  ];

  useEffect(() => {
    setItems(mockItems);
  }, []);

  const updateQuantity = (id: number, change: number) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(0, item.quantity + change) }
        : item
    ));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Sort Options */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {items.length} products available
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Most Relevant</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="expiry">Expiry Date</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="fresh">Freshest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => {
          const daysUntilExpiry = item.expiryDate ? getDaysUntilExpiry(item.expiryDate) : null;
          
          return (
            <Card key={item.id} className={`group overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
              !item.inStock ? "opacity-75" : ""
            }`}>
              <div className="relative">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={400}
                  height={400}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {item.badges.map((badge, idx) => (
                    <Badge key={idx} className={`text-xs ${
                      badge === "Organic" ? "bg-green-600" :
                      badge === "Fresh Today" ? "bg-blue-600" :
                      badge === "Best Price" ? "bg-red-600" :
                      badge === "Premium" ? "bg-purple-600" :
                      "bg-gray-600"
                    }`}>
                      {badge === "Organic" && <Leaf className="h-3 w-3 mr-1" />}
                      {badge === "Fresh Today" && <Zap className="h-3 w-3 mr-1" />}
                      {badge === "Premium" && <Shield className="h-3 w-3 mr-1" />}
                      {badge}
                    </Badge>
                  ))}
                  
                  {!item.inStock && (
                    <Badge variant="secondary" className="text-xs">
                      Out of Stock
                    </Badge>
                  )}
                </div>

                {/* Expiry Warning */}
                {daysUntilExpiry !== null && daysUntilExpiry <= 2 && item.isPerishable && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-orange-600 text-white text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {daysUntilExpiry === 0 ? "Today" : `${daysUntilExpiry}d`}
                    </Badge>
                  </div>
                )}

                {/* Favorite Button */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="h-8 w-8">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-4">
                {/* Store */}
                <div className="text-xs text-gray-500 mb-1">{item.store}</div>
                
                {/* Brand and Product Name */}
                <div className="text-xs text-gray-600 mb-1">{item.brand}</div>
                <h3 className="font-semibold text-sm mb-2 line-clamp-2 h-10">
                  {item.name}
                </h3>

                {/* Unit */}
                <div className="text-xs text-gray-500 mb-2">{item.unit}</div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-orange-600">
                    {formatPrice(item.price)}
                  </span>
                  {item.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Discount Percentage */}
                {item.originalPrice && (
                  <div className="text-xs text-green-600 font-medium mb-3">
                    Save {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                  </div>
                )}

                {/* Expiry Date */}
                {item.expiryDate && item.isPerishable && (
                  <div className="text-xs text-gray-500 mb-3">
                    Best before: {new Date(item.expiryDate).toLocaleDateString('tr-TR')}
                  </div>
                )}

                {/* Quantity Controls */}
                {item.inStock ? (
                  item.quantity === 0 ? (
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add to Cart
                    </Button>
                  ) : (
                    <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-medium">{item.quantity}</span>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                ) : (
                  <Button className="w-full" size="sm" disabled>
                    Out of Stock
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Load More */}
      <div className="text-center pt-8">
        <Button variant="outline" size="lg">
          Load More Products
        </Button>
      </div>
    </div>
  );
}
