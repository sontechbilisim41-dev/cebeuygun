
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api-client';

interface VendorStats {
  todaySales: number;
  monthlySales: number;
  pendingOrders: number;
  lowStockProducts: number;
  averageRating: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
}

interface VendorState {
  stats: VendorStats;
  salesChart: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
  loading: boolean;
  error: string | null;
}

const initialState: VendorState = {
  stats: {
    todaySales: 0,
    monthlySales: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    averageRating: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
  },
  salesChart: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchVendorStats = createAsyncThunk(
  'vendor/fetchStats',
  async (vendorId: number) => {
    const response = await api.get(`/vendor/${vendorId}/stats`);
    return response;
  }
);

export const fetchSalesChart = createAsyncThunk(
  'vendor/fetchSalesChart',
  async ({ vendorId, period }: { vendorId: number; period: string }) => {
    const response = await api.get(`/vendor/${vendorId}/sales-chart`, { period });
    return response;
  }
);

const vendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch vendor stats
      .addCase(fetchVendorStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchVendorStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Veriler yüklenemedi';
      })
      // Fetch sales chart
      .addCase(fetchSalesChart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSalesChart.fulfilled, (state, action) => {
        state.loading = false;
        state.salesChart = action.payload;
      })
      .addCase(fetchSalesChart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Grafik verileri yüklenemedi';
      });
  },
});

export const { clearError } = vendorSlice.actions;
export default vendorSlice.reducer;
