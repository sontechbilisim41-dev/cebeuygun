import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider, App as AntApp, Spin } from 'antd';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from 'react-error-boundary';
import trTR from 'antd/locale/tr_TR';
import { useAppStore } from '@/stores/app-store';
import { AppLayout } from '@/components/layout/AppLayout';
import { ErrorFallback } from '@/components/common/ErrorFallback';
import '@/i18n';
import './App.css';

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Orders = React.lazy(() => import('@/pages/Orders'));
const Products = React.lazy(() => import('@/pages/Products'));
const BulkOperations = React.lazy(() => import('@/pages/BulkOperations'));
const Campaigns = React.lazy(() => import('@/pages/Campaigns'));
const Analytics = React.lazy(() => import('@/pages/Analytics'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const Login = React.lazy(() => import('@/pages/Login'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

const AppContent: React.FC = () => {
  const { isAuthenticated, theme } = useAppStore();

  const antdTheme = {
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
      fontSize: 14,
    },
    algorithm: theme === 'dark' ? undefined : undefined, // Can add dark theme later
  };

  return (
    <ConfigProvider locale={trTR} theme={antdTheme}>
      <AntApp>
        <HelmetProvider>
          <Router>
            <Routes>
              <Route path="/login" element={
                <Suspense fallback={<Spin size="large" />}>
                  <Login />
                </Suspense>
              } />
              
              <Route path="/" element={
                isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={
                  <Suspense fallback={<Spin size="large" />}>
                    <Dashboard />
                  </Suspense>
                } />
                <Route path="orders" element={
                  <Suspense fallback={<Spin size="large" />}>
                    <Orders />
                  </Suspense>
                } />
                <Route path="products" element={
                  <Suspense fallback={<Spin size="large" />}>
                    <Products />
                  </Suspense>
                } />
                <Route path="bulk-operations" element={
                  <Suspense fallback={<Spin size="large" />}>
                    <BulkOperations />
                  </Suspense>
                } />
                <Route path="campaigns" element={
                  <Suspense fallback={<Spin size="large" />}>
                    <Campaigns />
                  </Suspense>
                } />
                <Route path="analytics" element={
                  <Suspense fallback={<Spin size="large" />}>
                    <Analytics />
                  </Suspense>
                } />
                <Route path="settings" element={
                  <Suspense fallback={<Spin size="large" />}>
                    <Settings />
                  </Suspense>
                } />
              </Route>
              
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </HelmetProvider>
      </AntApp>
    </ConfigProvider>
  );
};

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;