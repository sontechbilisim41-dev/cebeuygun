
'use client';

import { Truck, Clock, Shield, Headphones } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Truck,
    title: 'Hızlı Teslimat',
    description: '10-30 dakikada kapınızda',
    color: 'text-green-600'
  },
  {
    icon: Clock,
    title: '7/24 Hizmet',
    description: 'Her zaman açığız',
    color: 'text-blue-600'
  },
  {
    icon: Shield,
    title: 'Güvenli Ödeme',
    description: 'Ödemeleriniz güvende',
    color: 'text-purple-600'
  },
  {
    icon: Headphones,
    title: 'Müşteri Desteği',
    description: 'Size yardımcı olmak için buradayız',
    color: 'text-orange-600'
  }
];

export function DeliveryInfo() {
  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-md transition-shadow border-0 shadow-sm">
              <CardContent className="p-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm mb-4 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2 text-navy-900">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
