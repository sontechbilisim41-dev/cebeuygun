import { useState, useEffect, useCallback } from 'react';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  seller: {
    id: string;
    name: string;
    type: string;
    phone: string;
  };
  type: 'product' | 'food' | 'grocery';
  amount: {
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
    currency: string;
  };
  status: 'received' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  deliveryAddress: {
    fullAddress: string;
    district: string;
    city: string;
    coordinates: { lat: number; lng: number };
    instructions?: string;
  };
  paymentMethod: {
    type: string;
    details: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    image?: string;
    notes?: string;
  }>;
  timeline: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  courier?: {
    id: string;
    name: string;
    phone: string;
    vehicle: string;
    currentLocation: { lat: number; lng: number };
  };
  notes: string[];
}

interface FilterState {
  dateFrom: Date | null;
  dateTo: Date | null;
  status: string;
  sellerName: string;
  customerName: string;
  orderType: string;
}

interface UseOrderManagementReturn {
  orders: Order[];
  filteredOrders: Order[];
  loading: boolean;
  error: string | null;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
  addOrderNote: (orderId: string, note: string) => Promise<void>;
  exportOrders: (format: 'csv' | 'excel') => Promise<void>;
}

export const useOrderManagement = (): UseOrderManagementReturn => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: null,
    dateTo: null,
    status: 'all',
    sellerName: '',
    customerName: '',
    orderType: 'all',
  });

  // Load orders from API
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to load orders');
      }
      
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Load orders error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters to orders
  const applyFilters = useCallback(() => {
    let filtered = [...orders];

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(order => 
        new Date(order.date) >= filters.dateFrom!
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(order => 
        new Date(order.date) <= filters.dateTo!
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Seller name filter
    if (filters.sellerName) {
      filtered = filtered.filter(order =>
        order.seller.name.toLowerCase().includes(filters.sellerName.toLowerCase())
      );
    }

    // Customer name filter
    if (filters.customerName) {
      filtered = filtered.filter(order =>
        order.customer.name.toLowerCase().includes(filters.customerName.toLowerCase())
      );
    }

    // Order type filter
    if (filters.orderType !== 'all') {
      filtered = filtered.filter(order => order.type === filters.orderType);
    }

    setFilteredOrders(filtered);
  }, [orders, filters]);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus as any,
              timeline: [
                ...order.timeline,
                {
                  status: newStatus,
                  timestamp: new Date().toISOString(),
                  note: 'Admin tarafından güncellendi'
                }
              ]
            }
          : order
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      throw err;
    }
  }, []);

  // Add order note
  const addOrderNote = useCallback(async (orderId: string, note: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
      });

      if (!response.ok) {
        throw new Error('Failed to add order note');
      }

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, notes: [...order.notes, note] }
          : order
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
      throw err;
    }
  }, []);

  // Export orders
  const exportOrders = useCallback(async (format: 'csv' | 'excel') => {
    try {
      const response = await fetch(`/api/admin/orders/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export orders');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export orders');
      throw err;
    }
  }, []);

  // Refresh orders
  const refreshOrders = useCallback(async () => {
    await loadOrders();
  }, [loadOrders]);

  // Load orders on mount
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Apply filters when orders or filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return {
    orders,
    filteredOrders,
    loading,
    error,
    filters,
    setFilters,
    refreshOrders,
    updateOrderStatus,
    addOrderNote,
    exportOrders,
  };
};