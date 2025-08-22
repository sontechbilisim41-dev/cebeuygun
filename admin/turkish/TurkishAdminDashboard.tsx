
'use client';

import { useState } from 'react';
import { TurkishAdminSidebar } from './TurkishAdminSidebar';
import { TurkishDashboardOverview } from './dashboard/TurkishDashboardOverview';
import { TurkishCategoryManagement } from './categories/TurkishCategoryManagement';
import { TurkishProductManagement } from './products/TurkishProductManagement';
import { TurkishVendorManagement } from './vendors/TurkishVendorManagement';

export type TurkishAdminSection = 
  | 'dashboard'
  | 'categories'
  | 'products'
  | 'vendors'
  | 'orders'
  | 'couriers'
  | 'campaigns'
  | 'reports'
  | 'users';

export function TurkishAdminDashboard() {
  const [activeSection, setActiveSection] = useState<TurkishAdminSection>('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <TurkishDashboardOverview />;
      case 'categories':
        return <TurkishCategoryManagement />;
      case 'products':
        return <TurkishProductManagement />;
      case 'vendors':
        return <TurkishVendorManagement />;
      case 'orders':
        return <div className="p-8 text-center text-gray-500">Sipariş Yönetimi - Yakında</div>;
      case 'couriers':
        return <div className="p-8 text-center text-gray-500">Kurye Yönetimi - Yakında</div>;
      case 'campaigns':
        return <div className="p-8 text-center text-gray-500">Kampanya Yönetimi - Yakında</div>;
      case 'reports':
        return <div className="p-8 text-center text-gray-500">Raporlama - Yakında</div>;
      case 'users':
        return <div className="p-8 text-center text-gray-500">Kullanıcı Yönetimi - Yakında</div>;
      default:
        return <TurkishDashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <TurkishAdminSidebar 
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
