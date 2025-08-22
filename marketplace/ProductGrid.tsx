
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye,
  Truck,
  Shield,
  Zap
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

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  vendor: string;
  badge?: string;
  features: string[];
  inStock: boolean;
}

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Mock products data
  const mockProducts: Product[] = [
    {
      id: 1,
      name: "iPhone 15 Pro Max 256GB",
      price: 45999,
      originalPrice: 49999,
      rating: 4.8,
      reviews: 1250,
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
      vendor: "Apple Store Turkey",
      badge: "Best Seller",
      features: ["Free Shipping", "Fast Delivery", "Premium Quality"],
      inStock: true,
    },
    {
      id: 2,
      name: "Samsung Galaxy S24 Ultra",
      price: 42999,
      rating: 4.7,
      reviews: 890,
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
      vendor: "Samsung Official",
      badge: "New Arrival",
      features: ["Free Shipping", "Local Vendor"],
      inStock: true,
    },
    {
      id: 3,
      name: "MacBook Air M3 13-inch",
      price: 35999,
      originalPrice: 38999,
      rating: 4.9,
      reviews: 567,
      image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop",
      vendor: "Apple Store Turkey",
      badge: "On Sale",
      features: ["Free Shipping", "Premium Quality", "Fast Delivery"],
      inStock: true,
    },
    {
      id: 4,
      name: "Nike Air Max 270",
      price: 2499,
      originalPrice: 2999,
      rating: 4.6,
      reviews: 1890,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      vendor: "Nike Turkey",
      badge: "Popular",
      features: ["Free Shipping", "Best Seller"],
      inStock: true,
    },
    {
      id: 5,
      name: "Sony WH-1000XM5 Headphones",
      price: 8999,
      rating: 4.8,
      reviews: 756,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      vendor: "Sony Official Store",
      features: ["Free Shipping", "Premium Quality"],
      inStock: true,
    },
    {
      id: 6,
      name: "Adidas Ultraboost 22",
      price: 3299,
      originalPrice: 3799,
      rating: 4.5,
      reviews: 432,
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop",
      vendor: "Adidas Turkey",
      badge: "On Sale",
      features: ["Free Shipping", "Eco Friendly"],
      inStock: false,
    },
  ];

  useEffect(() => {
    setProducts(mockProducts);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Sort and View Options */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Showing {products.length} products
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
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="relative">
              <Image
                src={product.image}
                alt={product.name}
                width={400}
                height={400}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.badge && (
                  <Badge className="bg-red-600 text-white text-xs">
                    {product.badge}
                  </Badge>
                )}
                {!product.inStock && (
                  <Badge variant="secondary" className="text-xs">
                    Out of Stock
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="secondary" className="h-8 w-8">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary" className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Add to Cart */}
              <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  className="w-full h-8 text-xs" 
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
              </div>
            </div>

            <CardContent className="p-4">
              {/* Vendor */}
              <div className="text-xs text-gray-500 mb-1">{product.vendor}</div>
              
              {/* Product Name */}
              <h3 className="font-semibold text-sm mb-2 line-clamp-2 h-10">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{product.rating}</span>
                <span className="text-xs text-gray-500">({product.reviews})</span>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-1 mb-3">
                {product.features.slice(0, 2).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    {feature === "Free Shipping" && <Truck className="h-3 w-3 text-green-600" />}
                    {feature === "Fast Delivery" && <Zap className="h-3 w-3 text-blue-600" />}
                    {feature === "Premium Quality" && <Shield className="h-3 w-3 text-purple-600" />}
                    <span className="text-xs text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-red-600">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Discount Percentage */}
              {product.originalPrice && (
                <div className="text-xs text-green-600 font-medium">
                  Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </div>
              )}
            </CardContent>
          </Card>
        ))}
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
