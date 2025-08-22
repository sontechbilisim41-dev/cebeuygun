
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  User,
  AlertCircle
} from "lucide-react";

interface OrderTimelineProps {
  order: any;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  // Mock timeline data
  const timelineEvents = [
    {
      id: 1,
      title: 'Sipariş Alındı',
      description: 'Müşteri siparişi oluşturdu',
      timestamp: order.create_time,
      status: 'completed',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      id: 2,
      title: 'Ödeme Onaylandı',
      description: `${order.odeme_yontemi} ile ödeme alındı`,
      timestamp: new Date(new Date(order.create_time).getTime() + 2 * 60000).toISOString(),
      status: 'completed',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      id: 3,
      title: 'Sipariş Onaylandı',
      description: 'Satıcı siparişi onayladı',
      timestamp: new Date(new Date(order.create_time).getTime() + 5 * 60000).toISOString(),
      status: 'completed',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      id: 4,
      title: 'Hazırlanıyor',
      description: order.siparis_tipi === 'yemek' ? 'Yemek hazırlanıyor' : 'Ürün paketleniyor',
      timestamp: new Date(new Date(order.create_time).getTime() + 10 * 60000).toISOString(),
      status: order.durum === 'hazirlaniyor' ? 'current' : order.durum === 'teslim_edildi' || order.durum === 'kargoda' ? 'completed' : 'pending',
      icon: Package,
      color: order.durum === 'hazirlaniyor' ? 'text-orange-500' : order.durum === 'teslim_edildi' || order.durum === 'kargoda' ? 'text-green-500' : 'text-gray-400'
    },
    {
      id: 5,
      title: 'Kargoya Verildi',
      description: order.siparis_tipi === 'market' || order.siparis_tipi === 'yemek' ? 'Kurye siparişi aldı' : 'Kargo şirketine teslim edildi',
      timestamp: order.durum === 'kargoda' || order.durum === 'teslim_edildi' ? 
        new Date(new Date(order.create_time).getTime() + 20 * 60000).toISOString() : null,
      status: order.durum === 'kargoda' ? 'current' : order.durum === 'teslim_edildi' ? 'completed' : 'pending',
      icon: Truck,
      color: order.durum === 'kargoda' ? 'text-blue-500' : order.durum === 'teslim_edildi' ? 'text-green-500' : 'text-gray-400'
    },
    {
      id: 6,
      title: 'Teslim Edildi',
      description: 'Sipariş müşteriye teslim edildi',
      timestamp: order.durum === 'teslim_edildi' ? order.teslimat_tarihi || 
        new Date(new Date(order.create_time).getTime() + 60 * 60000).toISOString() : null,
      status: order.durum === 'teslim_edildi' ? 'completed' : 'pending',
      icon: User,
      color: order.durum === 'teslim_edildi' ? 'text-green-500' : 'text-gray-400'
    }
  ];

  // İptal durumu için özel event
  if (order.durum === 'iptal_edildi') {
    timelineEvents.push({
      id: 7,
      title: 'Sipariş İptal Edildi',
      description: 'Sipariş iptal edildi',
      timestamp: order.modify_time,
      status: 'cancelled',
      icon: AlertCircle,
      color: 'text-red-500'
    });
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Tamamlandı</Badge>;
      case 'current':
        return <Badge className="bg-blue-100 text-blue-800">Devam Ediyor</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">İptal Edildi</Badge>;
      default:
        return <Badge variant="outline">Beklemede</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Sipariş Zaman Çizelgesi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {timelineEvents.map((event, index) => {
            const IconComponent = event.icon;
            const isLast = index === timelineEvents.length - 1;
            
            return (
              <div key={event.id} className="relative">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-4 top-8 w-0.5 h-6 bg-border"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    event.status === 'completed' ? 'bg-green-100 border-green-500' :
                    event.status === 'current' ? 'bg-blue-100 border-blue-500' :
                    event.status === 'cancelled' ? 'bg-red-100 border-red-500' :
                    'bg-gray-100 border-gray-300'
                  }`}>
                    <IconComponent className={`h-4 w-4 ${event.color}`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(event.status)}
                      </div>
                    </div>
                    
                    {event.timestamp && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(event.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Özet Bilgiler */}
        <div className="mt-8 pt-6 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary">
                {Math.floor((new Date().getTime() - new Date(order.create_time).getTime()) / (1000 * 60))} dk
              </div>
              <div className="text-xs text-muted-foreground">Geçen Süre</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {order.tahmini_teslimat_suresi} dk
              </div>
              <div className="text-xs text-muted-foreground">Tahmini Süre</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {timelineEvents.filter(e => e.status === 'completed').length}
              </div>
              <div className="text-xs text-muted-foreground">Tamamlanan Aşama</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {Math.round((timelineEvents.filter(e => e.status === 'completed').length / timelineEvents.filter(e => e.status !== 'cancelled').length) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Tamamlanma Oranı</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
