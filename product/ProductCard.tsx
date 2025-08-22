
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const discountPercentage = product.salePrice 
    ? Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)
    : 0;

  return (
    <Link href={`/product/${product.id}`}>
      <Card className={cn(
        "group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden",
        compact ? "h-auto" : "h-full"
      )}>
        <div className="relative">
          <div className={cn(
            "relative overflow-hidden bg-gray-100",
            compact ? "aspect-square" : "aspect-[4/3]"
          )}>
            <Image
              src={product.images[0]?.url || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                -{discountPercentage}%
              </Badge>
            )}

            {/* Express Delivery Badge */}
            {product.deliveryTime.express <= 30 && (
              <Badge className="absolute top-2 right-2 bg-green-500 text-white flex items-center gap-1">
                <Truck className="h-3 w-3" />
                {product.deliveryTime.express}min
              </Badge>
            )}

            {/* Wishlist Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleWishlist}
            >
              <Heart className={cn(
                "h-4 w-4",
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              )} />
            </Button>

            {/* Quick Add to Cart */}
            <Button
              size="sm"
              className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        <CardContent className={cn("p-3", compact && "p-2")}>
          <div className="space-y-2">
            {/* Brand */}
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {product.brand}
            </p>

            {/* Product Name */}
            <h3 className={cn(
              "font-medium line-clamp-2 group-hover:text-primary transition-colors",
              compact ? "text-sm" : "text-base"
            )}>
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground ml-1">
                  {product.rating} ({product.reviewCount})
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-bold text-primary",
                compact ? "text-sm" : "text-lg"
              )}>
                ${product.salePrice || product.basePrice}
              </span>
              {product.salePrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.basePrice}
                </span>
              )}
            </div>

            {/* Stock Status */}
            {product.stock <= product.minStock && (
              <Badge variant="destructive" className="text-xs">
                Low Stock
              </Badge>
            )}

            {/* Delivery Info */}
            {!compact && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Truck className="h-3 w-3" />
                Express: {product.deliveryTime.express}min | Standard: {product.deliveryTime.standard}h
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
