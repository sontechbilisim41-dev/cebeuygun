
'use client';

import { useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { VendorManagement } from '@/components/admin/VendorManagement';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function AdminVendorsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super_admin')) {
      router.push('/admin');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super_admin')) {
    return null;
  }

  return (
    <AdminLayout>
      <VendorManagement />
    </AdminLayout>
  );
}
