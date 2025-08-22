
'use client';

import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Store, 
  Truck, 
  UtensilsCrossed, 
  ShoppingBasket,
  Activity,
  Database,
  Settings,
  Tag,
  BarChart3,
  FileText
} from 'lucide-react';
import { TurkishAdminSection } from './TurkishAdminDashboard';

interface TurkishAdminSidebarProps {
  activeSection: TurkishAdminSection;
  onSectionChange: (section: TurkishAdminSection) => void;
}

const menuItems = [
  {
    id: 'dashboard' as TurkishAdminSection,
    label: 'Ana Sayfa',
    icon: LayoutDashboard,
    description: 'Genel Bakış & İstatistikler'
  },
  {
    id: 'categories' as TurkishAdminSection,
    label: 'Kategori Yönetimi',
    icon: Package,
    description: 'Kategori Hiyerarşisi'
  },
  {
    id: 'products' as TurkishAdminSection,
    label: 'Ürün Yönetimi',
    icon: Package,
    description: 'Ürün Onay & Katalog'
  },
  {
    id: 'vendors' as TurkishAdminSection,
    label: 'Satıcı Yönetimi',
    icon: Store,
    description: 'Satıcı Onay & Performans'
  },
  {
    id: 'orders' as TurkishAdminSection,
    label: 'Sipariş Yönetimi',
    icon: ShoppingCart,
    description: 'Sipariş Takip & İşleme'
  },
  {
    id: 'couriers' as TurkishAdminSection,
    label: 'Kurye Yönetimi',
    icon: Truck,
    description: 'Kurye Onay & Takip'
  },
  {
    id: 'campaigns' as TurkishAdminSection,
    label: 'Kampanya Yönetimi',
    icon: Tag,
    description: 'İndirim & Promosyonlar'
  },
  {
    id: 'reports' as TurkishAdminSection,
    label: 'Raporlama',
    icon: BarChart3,
    description: 'Satış & Analitik Raporlar'
  },
  {
    id: 'users' as TurkishAdminSection,
    label: 'Kullanıcı Yönetimi',
    icon: Users,
    description: 'Müşteri Hesapları'
  }
];

export function TurkishAdminSidebar({ activeSection, onSectionChange }: TurkishAdminSidebarProps) {
  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-red-500 rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Cebeuygun.com
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Yönetici Paneli
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-cyan-500 to-red-500 text-white shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0",
                isActive ? "text-white" : "text-gray-500 dark:text-gray-400"
              )} />
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "font-medium truncate",
                  isActive ? "text-white" : "text-gray-900 dark:text-white"
                )}>
                  {item.label}
                </div>
                <div className={cn(
                  "text-xs truncate",
                  isActive ? "text-white/80" : "text-gray-500 dark:text-gray-400"
                )}>
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Mikroservis Mimarisi
          <br />
          v1.0.0
        </div>
      </div>
    </div>
  );
}
