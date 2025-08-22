import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { OrderList } from '@/components/orders/OrderList';
import { useOrdersStore } from '@/stores/orders-store';
import { useWebSocket } from '@/hooks/useWebSocket';

// Mock the stores and hooks
vi.mock('@/stores/orders-store');
vi.mock('@/hooks/useWebSocket');
vi.mock('@/services/api');

const mockOrders = [
  {
    id: '1',
    orderNumber: 'ORD-12345',
    customerId: 'customer-1',
    customerName: 'Ahmet Yılmaz',
    customerPhone: '+905551234567',
    status: 'confirmed',
    items: [
      {
        id: 'item-1',
        productId: 'product-1',
        productName: 'Test Ürün',
        quantity: 2,
        unitPrice: { amount: 2500, currency: 'TRY' },
        totalPrice: { amount: 5000, currency: 'TRY' },
      },
    ],
    subtotal: { amount: 5000, currency: 'TRY' },
    taxAmount: { amount: 900, currency: 'TRY' },
    deliveryFee: { amount: 1000, currency: 'TRY' },
    totalAmount: { amount: 6900, currency: 'TRY' },
    deliveryAddress: {
      street: 'Test Sokak No:1',
      city: 'İstanbul',
      district: 'Beyoğlu',
      country: 'TR',
    },
    isExpressDelivery: false,
    createdAt: '2025-01-18T10:00:00Z',
    updatedAt: '2025-01-18T10:00:00Z',
  },
];

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('OrderList', () => {
  beforeEach(() => {
    // Mock store state
    vi.mocked(useOrdersStore).mockReturnValue({
      orders: mockOrders,
      filters: {},
      pagination: { page: 1, limit: 20, total: 1 },
      loading: false,
      setOrders: vi.fn(),
      setFilters: vi.fn(),
      setPagination: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      getFilteredOrders: () => mockOrders,
      updateOrder: vi.fn(),
      // ... other store methods
    } as any);

    // Mock WebSocket hook
    vi.mocked(useWebSocket).mockReturnValue({
      isConnected: true,
      isConnecting: false,
      error: null,
      lastConnected: new Date(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      emit: vi.fn(),
    });
  });

  test('renders orders table', async () => {
    renderWithProviders(<OrderList />);
    
    await waitFor(() => {
      expect(screen.getByText('ORD-12345')).toBeInTheDocument();
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
      expect(screen.getByText('Onaylandı')).toBeInTheDocument();
    });
  });

  test('filters orders by search term', async () => {
    const mockSetFilters = vi.fn();
    vi.mocked(useOrdersStore).mockReturnValue({
      ...vi.mocked(useOrdersStore)(),
      setFilters: mockSetFilters,
    } as any);

    renderWithProviders(<OrderList />);
    
    const searchInput = screen.getByPlaceholderText(/ara/i);
    fireEvent.change(searchInput, { target: { value: 'ORD-12345' } });
    
    expect(mockSetFilters).toHaveBeenCalledWith({ searchTerm: 'ORD-12345' });
  });

  test('opens order details drawer', async () => {
    renderWithProviders(<OrderList />);
    
    const orderLink = screen.getByText('#ORD-12345');
    fireEvent.click(orderLink);
    
    await waitFor(() => {
      expect(screen.getByText('Sipariş Detayları')).toBeInTheDocument();
    });
  });

  test('handles status update', async () => {
    renderWithProviders(<OrderList />);
    
    // Click actions dropdown
    const actionsButton = screen.getByText('İşlemler');
    fireEvent.click(actionsButton);
    
    // Click update status
    const updateButton = screen.getByText('Durum Güncelle');
    fireEvent.click(updateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Durum Güncelle')).toBeInTheDocument();
    });
  });
});