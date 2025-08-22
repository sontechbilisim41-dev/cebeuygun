
'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  Bell, 
  User, 
  Settings,
  LogOut,
  Store
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VendorSection } from './VendorLayout';
import { useAppSelector } from '@/hooks/useAppSelector';

interface VendorHeaderProps {
  onMenuClick: () => void;
  activeSection: VendorSection;
}

const sectionTitles = {
  dashboard: 'Ana Sayfa',
  products: 'Ürün Yönetimi',
  orders: 'Sipariş Yönetimi',
  analytics: 'Raporlar & Analitik',
  messages: 'Müşteri Mesajları',
  settings: 'Mağaza Ayarları',
};

export function VendorHeader({ onMenuClick, activeSection }: VendorHeaderProps) {
  const { unreadCount } = useAppSelector(state => state.messages);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {sectionTitles[activeSection]}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mağaza yönetim paneli
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-red-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium">Satıcı Adı</div>
                  <div className="text-xs text-gray-500">Mağaza Sahibi</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Store className="w-4 h-4 mr-2" />
                Mağaza Profili
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Ayarlar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
