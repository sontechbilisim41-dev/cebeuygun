
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  Utensils, 
  Package, 
  Clock, 
  Truck,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const services = [
  {
    id: "marketplace",
    title: "Genel Alışveriş",
    description: "Elektronik, giyim, ev & yaşam ve daha fazlası",
    icon: Store,
    color: "bg-blue-500",
    href: "/marketplace",
    features: ["50M+ Ürün", "Güvenli Ödeme", "Hızlı Kargo"],
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop",
    badge: "Popüler"
  },
  {
    id: "restaurants",
    title: "Yemek Siparişi",
    description: "Binlerce restorandan lezzetli yemekler",
    icon: Utensils,
    color: "bg-orange-500",
    href: "/restaurants",
    features: ["5000+ Restoran", "Canlı Takip", "Sıcak Teslimat"],
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    badge: "Yeni"
  },
  {
    id: "market",
    title: "Hızlı Market",
    description: "Temel ihtiyaçlarınız 15 dakikada kapınızda",
    icon: Package,
    color: "bg-green-500",
    href: "/market",
    features: ["15 Dk Teslimat", "Taze Ürünler", "7/24 Hizmet"],
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
    badge: "Hızlı"
  }
];

export function ServiceCategories() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Hizmetlerimiz
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            İhtiyacınıza göre seçin, hızlı ve güvenli teslimatın keyfini çıkarın
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => {
            const IconComponent = service.icon;
            
            return (
              <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <Image
                    src={service.image}
                    alt={service.title}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-background/90">
                      {service.badge}
                    </Badge>
                  </div>
                  <div className={`absolute top-4 right-4 w-12 h-12 ${service.color} rounded-full flex items-center justify-center`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                      <p className="text-muted-foreground">{service.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {service.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    <Link href={service.href} className="block">
                      <Button className="w-full group-hover:bg-primary/90 transition-colors">
                        Keşfet
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-primary mb-2" />
            </div>
            <div className="text-2xl font-bold">1M+</div>
            <div className="text-sm text-muted-foreground">Günlük Sipariş</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <Clock className="h-8 w-8 text-primary mb-2" />
            </div>
            <div className="text-2xl font-bold">15dk</div>
            <div className="text-sm text-muted-foreground">Ortalama Teslimat</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <Truck className="h-8 w-8 text-primary mb-2" />
            </div>
            <div className="text-2xl font-bold">99.9%</div>
            <div className="text-sm text-muted-foreground">Başarılı Teslimat</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <Store className="h-8 w-8 text-primary mb-2" />
            </div>
            <div className="text-2xl font-bold">81</div>
            <div className="text-sm text-muted-foreground">İl Kapsamı</div>
          </div>
        </div>
      </div>
    </section>
  );
}
