
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api-client';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  min_stock_level: number;
  category_id: number;
  category_name?: string;
  images: string[];
  is_active: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  create_time: string;
}

interface ProductsState {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    category: string;
    status: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: ProductsState = {
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    category: '',
    status: 'all',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
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
    const response = await api.get('/vendor/products', params);
    return response;
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData: Partial<Product>) => {
    const response = await api.post('/vendor/products', productData);
    return response;
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data }: { id: number; data: Partial<Product> }) => {
    const response = await api.put(`/vendor/products/${id}`, data);
    return response;
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: number) => {
    await api.delete(`/vendor/products/${id}`);
    return id;
  }
);

export const bulkUpdateProducts = createAsyncThunk(
  'products/bulkUpdate',
  async ({ productIds, updates }: { productIds: number[]; updates: Partial<Product> }) => {
    const response = await api.post('/vendor/products/bulk-update', {
      product_ids: productIds,
      updates,
    });
    return response;
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action: PayloadAction<Partial<typeof initialState.pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ürünler yüklenemedi';
      })
      // Create product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload);
      })
      // Bulk update
      .addCase(bulkUpdateProducts.fulfilled, (state, action) => {
        // Update products in state based on response
        action.payload.forEach((updatedProduct: Product) => {
          const index = state.products.findIndex(p => p.id === updatedProduct.id);
          if (index !== -1) {
            state.products[index] = updatedProduct;
          }
        });
      });
  },
});

export const { setFilters, setPagination, setSelectedProduct, clearError } = productsSlice.actions;
export default productsSlice.reducer;
