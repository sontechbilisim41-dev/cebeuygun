
'use client';

import Link from 'next/link';
import { ShoppingBag, UtensilsCrossed, Store, Clock, Truck, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const serviceModules = [
  {
    id: 'marketplace',
    title: 'E-ticaret Pazaryeri',
    subtitle: 'Milyonlarca ürün, binlerce marka',
    description: 'Elektronikten giyime, ev dekorasyonundan kozmetiğe kadar her şey burada',
    icon: ShoppingBag,
    color: 'from-navy-600 to-navy-800',
    textColor: 'text-white',
    features: ['Ücretsiz Kargo', 'Hızlı Teslimat', 'Güvenli Ödeme'],
    link: '/marketplace',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'
  },
  {
    id: 'food',
    title: 'Yemek Siparişi',
    subtitle: 'Favori restoranlarınızdan',
    description: 'Binlerce restoran, her damak zevkine uygun lezzetler',
    icon: UtensilsCrossed,
    color: 'from-red-500 to-red-700',
    textColor: 'text-white',
    features: ['Canlı Takip', '30 Dk Teslimat', 'Sıcak Teslim'],
    link: '/food',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
  },
  {
    id: 'market',
    title: 'Hızlı Market',
    subtitle: '10-30 dakikada kapınızda',
    description: 'Günlük ihtiyaçlarınız dakikalar içinde elinizde',
    icon: Store,
    color: 'from-green-500 to-green-700',
    textColor: 'text-white',
    features: ['10 Dk Teslimat', 'Taze Ürünler', '7/24 Açık'],
    link: '/market',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop'
  }
];

export function ServiceModules() {
  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-navy-900 mb-2">
            Cebeuygun.com ile Her İhtiyacınız Tek Tıkla
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            E-ticaret, yemek siparişi ve hızlı market hizmetlerini tek platformda birleştirdik
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {serviceModules.map((module) => (
            <Link key={module.id} href={module.link}>
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-0 shadow-lg">
                <div className={`h-48 bg-gradient-to-br ${module.color} relative overflow-hidden`}>
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: `url(${module.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  <CardContent className="relative h-full p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <module.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className={`text-xl font-bold ${module.textColor}`}>
                            {module.title}
                          </h3>
                          <p className={`text-sm ${module.textColor} opacity-90`}>
                            {module.subtitle}
                          </p>
                        </div>
                      </div>
                      <p className={`text-sm ${module.textColor} opacity-80 mb-4`}>
                        {module.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {module.features.map((feature, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="bg-white/20 text-white border-0 text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </div>

                <CardContent className="p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Hızlı Teslimat</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-navy-900">1M+</div>
            <div className="text-sm text-gray-600">Mutlu Müşteri</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-navy-900">50K+</div>
            <div className="text-sm text-gray-600">Ürün Çeşidi</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-navy-900">5K+</div>
            <div className="text-sm text-gray-600">Restoran</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-navy-900">10 Dk</div>
            <div className="text-sm text-gray-600">Ortalama Teslimat</div>
          </div>
        </div>
      </div>
    </section>
  );
}
