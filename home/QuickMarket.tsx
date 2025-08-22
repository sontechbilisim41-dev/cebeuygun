
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const quickMarketItems = [
  {
    id: 1,
    name: "Süt 1L",
    price: 12.50,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop",
    category: "Süt Ürünleri",
    unit: "adet",
    inStock: true
  },
  {
    id: 2,
    name: "Ekmek",
    price: 4.00,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop",
    category: "Fırın",
    unit: "adet",
    inStock: true
  },
  {
    id: 3,
    name: "Yumurta 10'lu",
    price: 28.90,
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop",
    category: "Protein",
    unit: "paket",
    inStock: true
  },
  {
    id: 4,
    name: "Domates 1kg",
    price: 15.75,
    image: "https://images.unsplash.com/photo-1546470427-e5380b6d0b66?w=200&h=200&fit=crop",
    category: "Sebze",
    unit: "kg",
    inStock: true
  },
  {
    id: 5,
    name: "Su 5L",
    price: 8.50,
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200&h=200&fit=crop",
    category: "İçecek",
    unit: "adet",
    inStock: true
  },
  {
    id: 6,
    name: "Çay 500g",
    price: 45.00,
    image: "https://images.unsplash.com/photo-1594631661960-0e4c8d0e3d66?w=200&h=200&fit=crop",
    category: "İçecek",
    unit: "paket",
    inStock: true
  },
  {
    id: 7,
    name: "Makarna 500g",
    price: 8.75,
    image: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=200&h=200&fit=crop",
    category: "Temel Gıda",
    unit: "paket",
    inStock: true
  },
  {
    id: 8,
    name: "Peynir 500g",
    price: 65.00,
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&h=200&fit=crop",
    category: "Süt Ürünleri",
    unit: "paket",
    inStock: false
  }
];

export function QuickMarket() {
  const [cart, setCart] = useState<Record<number, number>>({});

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const updateCart = (itemId: number, change: number) => {
    setCart(prev => {
      const currentAmount = prev[itemId] || 0;
      const newAmount = Math.max(0, currentAmount + change);
      
      if (newAmount === 0) {
        const { [itemId]: removed, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [itemId]: newAmount };
    });
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((sum, [itemId, count]) => {
      const item = quickMarketItems.find(i => i.id === parseInt(itemId));
      return sum + (item ? item.price * count : 0);
    }, 0);
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Clock className="h-6 w-6 text-green-500" />
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              15 Dakikada Teslimat
            </Badge>
          </div>
          <h2 className="text-3xl font-bold mb-2">Hızlı Market</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Temel ihtiyaçlarınızı 15 dakikada kapınıza getiriyoruz. 
            Taze ürünler, uygun fiyatlar, hızlı teslimat.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {quickMarketItems.map((item) => (
            <Card key={item.id} className={`group hover:shadow-lg transition-all duration-300 ${!item.inStock ? 'opacity-60' : ''}`}>
              <CardContent className="p-3 space-y-3">
                <div className="relative">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={120}
                    height={120}
                    className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-medium">Tükendi</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                  <h3 className="font-medium text-sm line-clamp-2 min-h-[2rem]">
                    {item.name}
                  </h3>
                  <p className="font-bold text-primary text-sm">
                    {formatPrice(item.price)}
                  </p>
                </div>

                {item.inStock ? (
                  <div className="space-y-2">
                    {cart[item.id] ? (
                      <div className="flex items-center justify-between bg-muted rounded-lg p-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => updateCart(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium">{cart[item.id]}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => updateCart(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full h-8 text-xs"
                        onClick={() => updateCart(item.id, 1)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Ekle
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button size="sm" className="w-full h-8 text-xs" disabled>
                    Tükendi
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cart Summary */}
        {getTotalItems() > 0 && (
          <div className="fixed bottom-4 left-4 right-4 z-50 md:relative md:bottom-auto md:left-auto md:right-auto">
            <Card className="bg-primary text-primary-foreground shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">
                      {getTotalItems()} ürün - {formatPrice(getTotalPrice())}
                    </div>
                    <div className="text-sm opacity-90">
                      15 dakikada kapınızda
                    </div>
                  </div>
                  <Link href="/market/checkout">
                    <Button variant="secondary">
                      Sepeti Görüntüle
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="text-center">
          <Link href="/market">
            <Button variant="outline" size="lg">
              Tüm Market Ürünlerini Gör
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
