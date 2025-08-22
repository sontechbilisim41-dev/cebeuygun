
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Navigation, 
  Phone, 
  MessageSquare, 
  Clock,
  Truck,
  Store,
  User,
  Route,
  RefreshCw
} from "lucide-react";

interface OrderMapProps {
  order: any;
}

export function OrderMap({ order }: OrderMapProps) {
  const [courierLocation, setCourierLocation] = useState({
    lat: 41.0082,
    lng: 28.9784
  });
  const [estimatedTime, setEstimatedTime] = useState(8);

  // Simulated real-time location updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate courier movement
      setCourierLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }));
      
      // Update estimated time
      setEstimatedTime(prev => Math.max(1, prev - 0.5));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Mock locations
  const storeLocation = { lat: 40.9923, lng: 29.0244 };
  const customerLocation = { lat: 41.0150, lng: 28.9850 };

  return (
    <div className="space-y-6">
      {/* Harita Placeholder */}
      <Card>
        <CardContent className="p-0">
          <div className="relative h-96 bg-muted rounded-lg overflow-hidden">
            {/* Harita simülasyonu */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <MapPin className="h-16 w-16 text-primary mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">Canlı Harita</h3>
                    <p className="text-muted-foreground">
                      Gerçek uygulamada burada interaktif harita görünecek
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Simulated pins */}
              <div className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded-full">
                <Store className="h-4 w-4" />
              </div>
              <div className="absolute bottom-4 right-4 bg-green-500 text-white p-2 rounded-full">
                <User className="h-4 w-4" />
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full animate-pulse">
                <Truck className="h-4 w-4" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Konum Bilgileri */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mağaza Konumu */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Store className="h-4 w-4 text-red-500" />
              Mağaza Konumu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm font-medium">{order.satici_adi}</div>
            <div className="text-xs text-muted-foreground">
              Lat: {storeLocation.lat}<br/>
              Lng: {storeLocation.lng}
            </div>
            <Badge variant="outline" className="text-xs">
              Sipariş Hazır
            </Badge>
          </CardContent>
        </Card>

        {/* Kurye Konumu */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-500" />
              Kurye Konumu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm font-medium">
              {order.kurye_bilgisi?.ad || 'Kurye Atanmadı'}
            </div>
            <div className="text-xs text-muted-foreground">
              Lat: {courierLocation.lat.toFixed(4)}<br/>
              Lng: {courierLocation.lng.toFixed(4)}
            </div>
            <Badge className="text-xs bg-blue-100 text-blue-800">
              <Clock className="h-3 w-3 mr-1" />
              {estimatedTime} dk kaldı
            </Badge>
          </CardContent>
        </Card>

        {/* Müşteri Konumu */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-green-500" />
              Teslimat Adresi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm font-medium">{order.kullanici_adi}</div>
            <div className="text-xs text-muted-foreground">
              {order.teslimat_adresi?.adres}<br/>
              {order.teslimat_adresi?.ilce}/{order.teslimat_adresi?.sehir}
            </div>
            <Badge variant="outline" className="text-xs">
              Bekliyor
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Rota Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Route className="h-5 w-5" />
            Rota Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">2.3 km</div>
              <div className="text-xs text-muted-foreground">Toplam Mesafe</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{estimatedTime} dk</div>
              <div className="text-xs text-muted-foreground">Tahmini Süre</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">45 km/h</div>
              <div className="text-xs text-muted-foreground">Ortalama Hız</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">%75</div>
              <div className="text-xs text-muted-foreground">Tamamlanan</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* İletişim ve Kontrol */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">İletişim</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full">
              <Phone className="h-4 w-4 mr-2" />
              Kurye ile İletişime Geç
            </Button>
            <Button variant="outline" className="w-full">
              <Phone className="h-4 w-4 mr-2" />
              Müşteri ile İletişime Geç
            </Button>
            <Button variant="outline" className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              SMS Gönder
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kontrol</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Konumu Yenile
            </Button>
            <Button variant="outline" className="w-full">
              <Navigation className="h-4 w-4 mr-2" />
              Rotayı Optimize Et
            </Button>
            <Button variant="destructive" className="w-full">
              <Clock className="h-4 w-4 mr-2" />
              Gecikme Bildirimi Gönder
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Teslimat Geçmişi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Teslimat Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium">Kurye siparişi aldı</div>
                <div className="text-muted-foreground">15:30 - Mağazadan alındı</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium">Teslimat yolunda</div>
                <div className="text-muted-foreground">15:35 - Müşteri adresine doğru</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium text-muted-foreground">Teslim edilecek</div>
                <div className="text-muted-foreground">Tahmini: 15:45</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
