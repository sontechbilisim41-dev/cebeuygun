import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Order, OrderStatus } from '@/types';

interface OrdersState {
  orders: Order[];
  selectedOrder: Order | null;
  filters: {
    status?: OrderStatus;
    dateRange?: [string, string];
    searchTerm?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
}

interface OrdersStore extends OrdersState {
  // Actions
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  removeOrder: (orderId: string) => void;
  setSelectedOrder: (order: Order | null) => void;
  setFilters: (filters: Partial<OrdersState['filters']>) => void;
  setPagination: (pagination: Partial<OrdersState['pagination']>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearOrders: () => void;
  
  // Computed
  getFilteredOrders: () => Order[];
  getOrderById: (id: string) => Order | undefined;
  getOrdersByStatus: (status: OrderStatus) => Order[];
}

export const useOrdersStore = create<OrdersStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      orders: [],
      selectedOrder: null,
      filters: {},
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
      },
      loading: false,
      error: null,

      // Actions
      setOrders: (orders) =>
        set((state) => {
          state.orders = orders;
          state.error = null;
        }),

      addOrder: (order) =>
        set((state) => {
          const existingIndex = state.orders.findIndex(o => o.id === order.id);
          if (existingIndex >= 0) {
            state.orders[existingIndex] = order;
          } else {
            state.orders.unshift(order);
          }
        }),

      updateOrder: (orderId, updates) =>
        set((state) => {
          const order = state.orders.find(o => o.id === orderId);
          if (order) {
            Object.assign(order, updates);
          }
          
          // Update selected order if it's the same
          if (state.selectedOrder?.id === orderId) {
            Object.assign(state.selectedOrder, updates);
          }
        }),

      removeOrder: (orderId) =>
        set((state) => {
          state.orders = state.orders.filter(o => o.id !== orderId);
          if (state.selectedOrder?.id === orderId) {
            state.selectedOrder = null;
          }
        }),

      setSelectedOrder: (order) =>
        set((state) => {
          state.selectedOrder = order;
        }),

      setFilters: (filters) =>
        set((state) => {
          state.filters = { ...state.filters, ...filters };
          state.pagination.page = 1; // Reset to first page when filtering
        }),

      setPagination: (pagination) =>
        set((state) => {
          state.pagination = { ...state.pagination, ...pagination };
        }),

      setLoading: (loading) =>
        set((state) => {
          state.loading = loading;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),

      clearOrders: () =>
        set((state) => {
          state.orders = [];
          state.selectedOrder = null;
          state.error = null;
        }),

      // Computed
      getFilteredOrders: () => {
        const { orders, filters } = get();
        let filtered = [...orders];

        if (filters.status) {
          filtered = filtered.filter(order => order.status === filters.status);
        }

        if (filters.searchTerm) {
          const term = filters.searchTerm.toLowerCase();
          filtered = filtered.filter(order =>
            order.orderNumber.toLowerCase().includes(term) ||
            order.customerName.toLowerCase().includes(term) ||
            order.customerPhone.includes(term)
          );
        }

        if (filters.dateRange) {
          const [startDate, endDate] = filters.dateRange;
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
          });
        }

        return filtered;
      },

      getOrderById: (id) => {
        return get().orders.find(order => order.id === id);
      },

      getOrdersByStatus: (status) => {
        return get().orders.filter(order => order.status === status);
      },
    })),
    {
      name: 'orders-store',
    }
  )
);