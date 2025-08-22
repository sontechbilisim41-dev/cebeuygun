
'use client';

import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  MessageSquare,
  Settings,
  Store,
  X
} from 'lucide-react';
import { VendorSection } from './VendorLayout';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/hooks/useAppSelector';

interface VendorSidebarProps {
  activeSection: VendorSection;
  onSectionChange: (section: VendorSection) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    id: 'dashboard' as VendorSection,
    label: 'Ana Sayfa',
    icon: LayoutDashboard,
    description: 'Genel Bakış & İstatistikler'
  },
  {
    id: 'products' as VendorSection,
    label: 'Ürün Yönetimi',
    icon: Package,
    description: 'Ürünler & Stok Takibi'
  },
  {
    id: 'orders' as VendorSection,
    label: 'Sipariş Yönetimi',
    icon: ShoppingCart,
    description: 'Siparişler & Kargo'
  },
  {
    id: 'analytics' as VendorSection,
    label: 'Raporlar & Analitik',
    icon: BarChart3,
    description: 'Satış Performansı'
  },
  {
    id: 'messages' as VendorSection,
    label: 'Müşteri Mesajları',
    icon: MessageSquare,
    description: 'İletişim & Destek'
  },
  {
    id: 'settings' as VendorSection,
    label: 'Mağaza Ayarları',
    icon: Settings,
    description: 'Profil & Yapılandırma'
  }
];

export function VendorSidebar({ activeSection, onSectionChange, isOpen, onClose }: VendorSidebarProps) {
  const { unreadCount } = useAppSelector(state => state.messages);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-red-500 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Satıcı Paneli
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Mağaza Yönetimi
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const hasNotification = item.id === 'messages' && unreadCount > 0;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id);
                  onClose();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 relative",
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
                {hasNotification && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Cebeuygun.com Satıcı Paneli
            <br />
            v1.0.0
          </div>
        </div>
      </div>
    </>
  );
}
