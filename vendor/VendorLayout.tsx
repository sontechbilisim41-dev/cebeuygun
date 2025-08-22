
'use client';

import { useState } from 'react';
import { VendorSidebar } from './VendorSidebar';
import { VendorHeader } from './VendorHeader';

export type VendorSection = 
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'analytics'
  | 'messages'
  | 'settings';

interface VendorLayoutProps {
  children: React.ReactNode;
  activeSection: VendorSection;
  onSectionChange: (section: VendorSection) => void;
}

export function VendorLayout({ children, activeSection, onSectionChange }: VendorLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <VendorSidebar 
        activeSection={activeSection} 
        onSectionChange={onSectionChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <VendorHeader 
          onMenuClick={() => setSidebarOpen(true)}
          activeSection={activeSection}
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
