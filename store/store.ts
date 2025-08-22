
import { configureStore } from '@reduxjs/toolkit';
import vendorReducer from './slices/vendorSlice';
import productsReducer from './slices/productsSlice';
import ordersReducer from './slices/ordersSlice';
import messagesReducer from './slices/messagesSlice';
import analyticsReducer from './slices/analyticsSlice';

export const store = configureStore({
  reducer: {
    vendor: vendorReducer,
    products: productsReducer,
    orders: ordersReducer,
    messages: messagesReducer,
    analytics: analyticsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
