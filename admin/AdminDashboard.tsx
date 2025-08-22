
'use client';

import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { DashboardOverview } from './dashboard/DashboardOverview';
import { UserManagement } from './services/UserManagement';
import { ProductCatalog } from './services/ProductCatalog';
import { OrderProcessing } from './services/OrderProcessing';
import { VendorManagement } from './services/VendorManagement';
import { LogisticsService } from './services/LogisticsService';
import { FoodService } from './services/FoodService';
import { QuickMarketService } from './services/QuickMarketService';
import { SystemMonitoring } from './services/SystemMonitoring';
import { DatabaseManagement } from './services/DatabaseManagement';

export type AdminSection = 
  | 'dashboard'
  | 'users'
  | 'products'
  | 'orders'
  | 'vendors'
  | 'logistics'
  | 'food'
  | 'market'
  | 'monitoring'
  | 'database';

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'users':
        return <UserManagement />;
      case 'products':
        return <ProductCatalog />;
      case 'orders':
        return <OrderProcessing />;
      case 'vendors':
        return <VendorManagement />;
      case 'logistics':
        return <LogisticsService />;
      case 'food':
        return <FoodService />;
      case 'market':
        return <QuickMarketService />;
      case 'monitoring':
        return <SystemMonitoring />;
      case 'database':
        return <DatabaseManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
