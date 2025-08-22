
'use client';

import { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { VendorLayout, VendorSection } from './VendorLayout';
import { VendorDashboard } from './dashboard/VendorDashboard';
import { ProductManagement } from './products/ProductManagement';

export function VendorApp() {
  const [activeSection, setActiveSection] = useState<VendorSection>('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <VendorDashboard />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <div className="p-8 text-center text-gray-500">Sipariş Yönetimi - Yakında</div>;
      case 'analytics':
        return <div className="p-8 text-center text-gray-500">Raporlar & Analitik - Yakında</div>;
      case 'messages':
        return <div className="p-8 text-center text-gray-500">Müşteri Mesajları - Yakında</div>;
      case 'settings':
        return <div className="p-8 text-center text-gray-500">Mağaza Ayarları - Yakında</div>;
      default:
        return <VendorDashboard />;
    }
  };

  return (
    <Provider store={store}>
      <VendorLayout 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      >
        {renderContent()}
      </VendorLayout>
    </Provider>
  );
}
