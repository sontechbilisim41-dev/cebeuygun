import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

// API
import { courierApi } from './api/courierApi';
import { orderApi } from './api/orderApi';
import { earningsApi } from './api/earningsApi';
import { locationApi } from './api/locationApi';

// Slices
import authSlice from './slices/authSlice';
import ordersSlice from './slices/ordersSlice';
import locationSlice from './slices/locationSlice';
import networkSlice from './slices/networkSlice';
import settingsSlice from './slices/settingsSlice';
import notificationSlice from './slices/notificationSlice';

// Middleware
import { offlineMiddleware } from './middleware/offlineMiddleware';
import { locationMiddleware } from './middleware/locationMiddleware';
import { syncMiddleware } from './middleware/syncMiddleware';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'settings', 'orders'], // Only persist these reducers
  blacklist: ['location', 'network'], // Don't persist these
};

const rootReducer = combineReducers({
  auth: authSlice,
  orders: ordersSlice,
  location: locationSlice,
  network: networkSlice,
  settings: settingsSlice,
  notifications: notificationSlice,
  [courierApi.reducerPath]: courierApi.reducer,
  [orderApi.reducerPath]: orderApi.reducer,
  [earningsApi.reducerPath]: earningsApi.reducer,
  [locationApi.reducerPath]: locationApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
      .concat(courierApi.middleware)
      .concat(orderApi.middleware)
      .concat(earningsApi.middleware)
      .concat(locationApi.middleware)
      .concat(offlineMiddleware)
      .concat(locationMiddleware)
      .concat(syncMiddleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;