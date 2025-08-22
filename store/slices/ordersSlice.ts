
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api-client';

interface OrderItem {
  id: number;
  product_id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  total_price: number;
}

interface Order {
  id: number;
  order_number: string;
  user_id: number;
  customer_name: string;
  customer_phone: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  total_amount: number;
  shipping_address: any;
  items: OrderItem[];
  tracking_number?: string;
  shipping_provider?: string;
  create_time: string;
  estimated_delivery?: string;
}

interface OrdersState {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
  error: string | null;
  filters: {
    status: string;
    search: string;
    dateRange: {
      start: string;
      end: string;
    };
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: OrdersState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  filters: {
    status: 'all',
    search: '',
    dateRange: {
      start: '',
      end: '',
    },
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
};

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ vendorId, filters, pagination }: {
    vendorId: number;
    filters: any;
    pagination: any;
  }) => {
    const params = {
      vendor_id: vendorId.toString(),
      ...filters,
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
    };
    const response = await api.get('/vendor/orders', params);
    return response;
  }
);

export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchOrderDetails',
  async (orderId: number) => {
    const response = await api.get(`/vendor/orders/${orderId}`);
    return response;
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status, trackingNumber }: {
    orderId: number;
    status: string;
    trackingNumber?: string;
  }) => {
    const response = await api.put(`/vendor/orders/${orderId}/status`, {
      status,
      tracking_number: trackingNumber,
    });
    return response;
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action: PayloadAction<Partial<typeof initialState.pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Siparişler yüklenemedi';
      })
      // Fetch order details
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.selectedOrder = action.payload;
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.selectedOrder?.id === action.payload.id) {
          state.selectedOrder = action.payload;
        }
      });
  },
});

export const { setFilters, setPagination, setSelectedOrder, clearError } = ordersSlice.actions;
export default ordersSlice.reducer;
