import { useState, useEffect, useCallback } from 'react';

interface Seller {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType: 'marketplace' | 'restaurant' | 'market';
  category: string;
  address: {
    street: string;
    district: string;
    city: string;
    postalCode: string;
  };
  taxNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'active';
  applicationDate: string;
  approvalDate?: string;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadDate: string;
  }>;
  performance: {
    totalSales: number;
    totalOrders: number;
    averageRating: number;
    completionRate: number;
  };
  notes?: string;
  rejectionReason?: string;
}

interface UseSellerManagementReturn {
  pendingSellers: Seller[];
  activeSellers: Seller[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  statusFilter: string;
  typeFilter: string;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setTypeFilter: (type: string) => void;
  approveSeller: (sellerId: string, note?: string) => Promise<void>;
  rejectSeller: (sellerId: string, reason: string) => Promise<void>;
  suspendSeller: (sellerId: string) => Promise<void>;
  refreshSellers: () => Promise<void>;
}

export const useSellerManagement = (): UseSellerManagementReturn => {
  const [allSellers, setAllSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock data for demonstration
  const mockSellers: Seller[] = [
    {
      id: 'seller-001',
      businessName: 'Pizza Palace Restaurant',
      ownerName: 'Mehmet Yılmaz',
      email: 'mehmet@pizzapalace.com',
      phone: '+90 212 555 0101',
      businessType: 'restaurant',
      category: 'İtalyan Mutfağı',
      address: {
        street: 'Galata Kulesi Mah. Büyük Hendek Cad. No:15',
        district: 'Beyoğlu',
        city: 'İstanbul',
        postalCode: '34420',
      },
      taxNumber: '1234567890',
      status: 'pending',
      applicationDate: '2024-01-18T10:30:00Z',
      documents: [
        {
          id: 'doc-001',
          name: 'İşletme Ruhsatı',
          type: 'business_license',
          url: '/documents/business_license_001.pdf',
          uploadDate: '2024-01-18T10:30:00Z',
        },
        {
          id: 'doc-002',
          name: 'Gıda Satış İzni',
          type: 'food_permit',
          url: '/documents/food_permit_001.pdf',
          uploadDate: '2024-01-18T10:32:00Z',
        },
        {
          id: 'doc-003',
          name: 'Vergi Levhası',
          type: 'tax_certificate',
          url: '/documents/tax_cert_001.pdf',
          uploadDate: '2024-01-18T10:35:00Z',
        },
      ],
      performance: {
        totalSales: 0,
        totalOrders: 0,
        averageRating: 0,
        completionRate: 0,
      },
    },
    {
      id: 'seller-002',
      businessName: 'Fresh Market Kadıköy',
      ownerName: 'Ayşe Demir',
      email: 'ayse@freshmarket.com',
      phone: '+90 216 555 0202',
      businessType: 'market',
      category: 'Süpermarket',
      address: {
        street: 'Moda Cad. No:45',
        district: 'Kadıköy',
        city: 'İstanbul',
        postalCode: '34710',
      },
      taxNumber: '2345678901',
      status: 'pending',
      applicationDate: '2024-01-19T14:15:00Z',
      documents: [
        {
          id: 'doc-004',
          name: 'Market İşletme Belgesi',
          type: 'business_license',
          url: '/documents/market_license_002.pdf',
          uploadDate: '2024-01-19T14:15:00Z',
        },
        {
          id: 'doc-005',
          name: 'Gıda Güvenlik Sertifikası',
          type: 'food_safety',
          url: '/documents/food_safety_002.pdf',
          uploadDate: '2024-01-19T14:18:00Z',
        },
      ],
      performance: {
        totalSales: 0,
        totalOrders: 0,
        averageRating: 0,
        completionRate: 0,
      },
    },
    {
      id: 'seller-003',
      businessName: 'TechStore Electronics',
      ownerName: 'Can Özkan',
      email: 'can@techstore.com',
      phone: '+90 212 555 0303',
      businessType: 'marketplace',
      category: 'Elektronik',
      address: {
        street: 'Levent Mah. Büyükdere Cad. No:120',
        district: 'Beşiktaş',
        city: 'İstanbul',
        postalCode: '34394',
      },
      taxNumber: '3456789012',
      status: 'active',
      applicationDate: '2024-01-10T09:00:00Z',
      approvalDate: '2024-01-12T16:30:00Z',
      documents: [
        {
          id: 'doc-006',
          name: 'Ticaret Sicil Gazetesi',
          type: 'trade_registry',
          url: '/documents/trade_registry_003.pdf',
          uploadDate: '2024-01-10T09:00:00Z',
        },
        {
          id: 'doc-007',
          name: 'İmza Sirküleri',
          type: 'signature_circular',
          url: '/documents/signature_003.pdf',
          uploadDate: '2024-01-10T09:05:00Z',
        },
      ],
      performance: {
        totalSales: 125000,
        totalOrders: 89,
        averageRating: 4.6,
        completionRate: 94,
      },
      notes: 'Güvenilir satıcı, zamanında teslimat yapıyor.',
    },
    {
      id: 'seller-004',
      businessName: 'Burger House',
      ownerName: 'Fatma Kaya',
      email: 'fatma@burgerhouse.com',
      phone: '+90 212 555 0404',
      businessType: 'restaurant',
      category: 'Fast Food',
      address: {
        street: 'Taksim Meydan No:1',
        district: 'Beyoğlu',
        city: 'İstanbul',
        postalCode: '34435',
      },
      taxNumber: '4567890123',
      status: 'active',
      applicationDate: '2024-01-05T11:20:00Z',
      approvalDate: '2024-01-07T14:45:00Z',
      documents: [
        {
          id: 'doc-008',
          name: 'Restoran Ruhsatı',
          type: 'restaurant_license',
          url: '/documents/restaurant_license_004.pdf',
          uploadDate: '2024-01-05T11:20:00Z',
        },
        {
          id: 'doc-009',
          name: 'Hijyen Sertifikası',
          type: 'hygiene_certificate',
          url: '/documents/hygiene_004.pdf',
          uploadDate: '2024-01-05T11:25:00Z',
        },
      ],
      performance: {
        totalSales: 89500,
        totalOrders: 156,
        averageRating: 4.3,
        completionRate: 91,
      },
    },
    {
      id: 'seller-005',
      businessName: 'Moda Butik',
      ownerName: 'Zeynep Şahin',
      email: 'zeynep@modabutik.com',
      phone: '+90 212 555 0505',
      businessType: 'marketplace',
      category: 'Moda & Giyim',
      address: {
        street: 'Nişantaşı Mah. Teşvikiye Cad. No:67',
        district: 'Şişli',
        city: 'İstanbul',
        postalCode: '34365',
      },
      taxNumber: '5678901234',
      status: 'suspended',
      applicationDate: '2024-01-08T13:45:00Z',
      approvalDate: '2024-01-10T10:15:00Z',
      documents: [
        {
          id: 'doc-010',
          name: 'Ticaret Odası Belgesi',
          type: 'chamber_certificate',
          url: '/documents/chamber_005.pdf',
          uploadDate: '2024-01-08T13:45:00Z',
        },
      ],
      performance: {
        totalSales: 45200,
        totalOrders: 34,
        averageRating: 3.8,
        completionRate: 76,
      },
      notes: 'Müşteri şikayetleri nedeniyle askıya alındı.',
    },
  ];

  // Load sellers from API
  const loadSellers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAllSellers(mockSellers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Satıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter sellers
  const filteredSellers = allSellers.filter(seller => {
    const matchesSearch = searchQuery === '' || 
      seller.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || seller.status === statusFilter;
    const matchesType = typeFilter === 'all' || seller.businessType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingSellers = filteredSellers.filter(s => s.status === 'pending');
  const activeSellers = filteredSellers.filter(s => ['active', 'approved', 'suspended'].includes(s.status));

  // Actions
  const approveSeller = useCallback(async (sellerId: string, note?: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAllSellers(prev => prev.map(seller => 
        seller.id === sellerId 
          ? { 
              ...seller, 
              status: 'active' as const,
              approvalDate: new Date().toISOString(),
              notes: note || seller.notes,
            }
          : seller
      ));
    } catch (err) {
      setError('Satıcı onaylanırken hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectSeller = useCallback(async (sellerId: string, reason: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAllSellers(prev => prev.map(seller => 
        seller.id === sellerId 
          ? { 
              ...seller, 
              status: 'rejected' as const,
              rejectionReason: reason,
            }
          : seller
      ));
    } catch (err) {
      setError('Satıcı reddedilirken hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const suspendSeller = useCallback(async (sellerId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAllSellers(prev => prev.map(seller => 
        seller.id === sellerId 
          ? { ...seller, status: 'suspended' as const }
          : seller
      ));
    } catch (err) {
      setError('Satıcı askıya alınırken hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSellers = useCallback(async () => {
    await loadSellers();
  }, [loadSellers]);

  // Load sellers on mount
  useEffect(() => {
    loadSellers();
  }, [loadSellers]);

  return {
    pendingSellers,
    activeSellers,
    loading,
    error,
    searchQuery,
    statusFilter,
    typeFilter,
    setSearchQuery,
    setStatusFilter,
    setTypeFilter,
    approveSeller,
    rejectSeller,
    suspendSeller,
    refreshSellers,
  };
};