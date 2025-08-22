
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api-client';

interface AnalyticsData {
  revenue: {
    total: number;
    commission: number;
    net: number;
    growth: number;
  };
  orders: {
    total: number;
    completed: number;
    cancelled: number;
    returned: number;
    averageValue: number;
  };
  products: {
    topSelling: Array<{
      id: number;
      name: string;
      sales: number;
      revenue: number;
    }>;
    lowStock: Array<{
      id: number;
      name: string;
      stock: number;
      minLevel: number;
    }>;
  };
  customers: {
    new: number;
    returning: number;
    segments: Array<{
      segment: string;
      count: number;
      revenue: number;
    }>;
  };
  geographic: Array<{
    city: string;
    orders: number;
    revenue: number;
  }>;
  trends: Array<{
    date: string;
    revenue: number;
    orders: number;
    customers: number;
  }>;
}

interface AnalyticsState {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  dateRange: {
    start: string;
    end: string;
  };
}

const initialState: AnalyticsState = {
  data: null,
  loading: false,
  error: null,
  dateRange: {
    start: '',
    end: '',
  },
};

// Async thunks
export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async ({ vendorId, dateRange }: { vendorId: number; dateRange: any }) => {
    const response = await api.get(`/vendor/${vendorId}/analytics`, dateRange);
    return response;
  }
);

export const exportReport = createAsyncThunk(
  'analytics/exportReport',
  async ({ vendorId, reportType, dateRange }: {
    vendorId: number;
    reportType: string;
    dateRange: any;
  }) => {
    const response = await api.get(`/vendor/${vendorId}/reports/${reportType}`, {
      ...dateRange,
      format: 'excel',
    });
    return response;
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setDateRange: (state, action: PayloadAction<{ start: string; end: string }>) => {
      state.dateRange = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Analitik verileri yüklenemedi';
      });
  },
});

export const { setDateRange, clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
