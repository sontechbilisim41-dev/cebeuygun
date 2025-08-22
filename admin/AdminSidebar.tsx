
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
  Settings
} from 'lucide-react';
import { AdminSection } from './AdminDashboard';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const menuItems = [
  {
    id: 'dashboard' as AdminSection,
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview & Analytics'
  },
  {
    id: 'users' as AdminSection,
    label: 'User Management',
    icon: Users,
    description: 'Customer & Admin Users'
  },
  {
    id: 'products' as AdminSection,
    label: 'Product Catalog',
    icon: Package,
    description: 'Marketplace Products'
  },
  {
    id: 'orders' as AdminSection,
    label: 'Order Processing',
    icon: ShoppingCart,
    description: 'Order Management'
  },
  {
    id: 'vendors' as AdminSection,
    label: 'Vendor Management',
    icon: Store,
    description: 'Seller Partners'
  },
  {
    id: 'logistics' as AdminSection,
    label: 'Logistics Service',
    icon: Truck,
    description: 'Delivery & Couriers'
  },
  {
    id: 'food' as AdminSection,
    label: 'Food Service',
    icon: UtensilsCrossed,
    description: 'Restaurants & Menus'
  },
  {
    id: 'market' as AdminSection,
    label: 'Quick Market',
    icon: ShoppingBasket,
    description: 'Grocery Stores'
  },
  {
    id: 'monitoring' as AdminSection,
    label: 'System Monitoring',
    icon: Activity,
    description: 'Service Health'
  },
  {
    id: 'database' as AdminSection,
    label: 'Database Management',
    icon: Database,
    description: 'Schema & Data'
  }
];

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
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
              Admin Panel
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
          Microservices Architecture
          <br />
          v1.0.0
        </div>
      </div>
    </div>
  );
}
