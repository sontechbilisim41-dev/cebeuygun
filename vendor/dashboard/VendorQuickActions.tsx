
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Eye, 
  RefreshCw, 
  MessageSquare,
  BarChart3,
  Settings
} from 'lucide-react';

interface VendorQuickActionsProps {
  onActionClick?: (action: string) => void;
}

export function VendorQuickActions({ onActionClick }: VendorQuickActionsProps) {
  const actions = [
    {
      id: 'add-product',
      label: 'Yeni Ürün Ekle',
      icon: Plus,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      description: 'Mağazanıza yeni ürün ekleyin'
    },
    {
      id: 'view-orders',
      label: 'Siparişlere Bak',
      icon: Eye,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      description: 'Bekleyen siparişleri görüntüleyin'
    },
    {
      id: 'update-stock',
      label: 'Stokları Güncelle',
      icon: RefreshCw,
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      description: 'Ürün stoklarını yönetin'
    },
    {
      id: 'messages',
      label: 'Müşteri Mesajları',
      icon: MessageSquare,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      description: 'Müşteri sorularını yanıtlayın'
    },
    {
      id: 'analytics',
      label: 'Satış Raporları',
      icon: BarChart3,
      color: 'bg-gradient-to-r from-red-500 to-red-600',
      description: 'Detaylı analitik raporları'
    },
    {
      id: 'settings',
      label: 'Mağaza Ayarları',
      icon: Settings,
      color: 'bg-gradient-to-r from-gray-500 to-gray-600',
      description: 'Mağaza profilinizi düzenleyin'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hızlı İşlemler</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => onActionClick?.(action.id)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {action.label}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
