
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Download, Star, Bell, Zap } from "lucide-react";
import Image from "next/image";

export function AppDownload() {
  return (
    <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                📱 Mobil Uygulama
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Cebeuygun Uygulamasını
                <span className="text-primary block">İndirin</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Daha hızlı alışveriş, özel indirimler ve anlık bildirimler için 
                mobil uygulamamızı indirin. iOS ve Android'de ücretsiz.
              </p>
            </div>

            {/* App Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Hızlı Sipariş</h3>
                  <p className="text-sm text-muted-foreground">Tek dokunuşla favori ürünlerinizi sipariş edin</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Bell className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Anlık Bildirimler</h3>
                  <p className="text-sm text-muted-foreground">Sipariş durumu ve özel kampanyalar için bildirim alın</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Özel İndirimler</h3>
                  <p className="text-sm text-muted-foreground">Sadece uygulama kullanıcılarına özel kampanyalar</p>
                </div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <div className="text-left">
                  <div className="text-xs">App Store'dan İndirin</div>
                  <div className="font-semibold">iOS Uygulaması</div>
                </div>
              </Button>
              
              <Button size="lg" variant="outline" className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <div className="text-left">
                  <div className="text-xs">Google Play'den İndirin</div>
                  <div className="font-semibold">Android Uygulaması</div>
                </div>
              </Button>
            </div>

            {/* App Stats */}
            <div className="grid grid-cols-3 gap-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.8</div>
                <div className="text-sm text-muted-foreground">App Store Puanı</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1M+</div>
                <div className="text-sm text-muted-foreground">İndirme</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Yorum</div>
              </div>
            </div>
          </div>

          {/* Right Content - App Mockup */}
          <div className="relative">
            <div className="relative max-w-sm mx-auto">
              {/* Phone Frame */}
              <div className="relative bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                <div className="bg-background rounded-[2.5rem] overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=600&fit=crop"
                    alt="Cebeuygun Mobile App"
                    width={300}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Floating Elements */}
              <Card className="absolute -top-4 -left-8 p-3 shadow-lg">
                <CardContent className="p-0 flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Smartphone className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Hızlı Teslimat</div>
                    <div className="text-xs text-muted-foreground">15 dakika</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="absolute -bottom-4 -right-8 p-3 shadow-lg">
                <CardContent className="p-0 flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">4.8 Puan</div>
                    <div className="text-xs text-muted-foreground">50K+ yorum</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
