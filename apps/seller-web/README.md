# Seller Web Panel

Production-ready seller-facing dashboard for the Cebeuygun multi-vendor marketplace platform. Built with React 18, TypeScript, and Ant Design for high-performance order management and real-time updates.

## 🎯 Features

### **Real-time Order Management**
- Live order list with instant WebSocket updates
- Order status management with workflow validation
- Customer information and delivery tracking
- Express delivery indicators and priority handling

### **Bulk Operations Hub**
- CSV import/export for products, inventory, and pricing
- Progress tracking for large file operations (10k+ items)
- Error reporting and retry mechanisms
- Template downloads for proper formatting

### **Campaign Management**
- Create and manage promotional campaigns
- Performance tracking and analytics
- Target customer segments and product categories
- Real-time campaign effectiveness monitoring

### **Analytics Dashboard**
- Revenue tracking with interactive charts
- Order analytics and customer insights
- Inventory alerts and stock management
- Performance metrics and KPI monitoring

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: Ant Design 5.x with custom theme
- **State Management**: Zustand with Immer for immutable updates
- **Data Fetching**: TanStack Query v4 for server state management
- **Real-time**: Socket.IO with automatic reconnection
- **Internationalization**: react-i18next with lazy loading
- **Testing**: Playwright + Vitest + React Testing Library
- **Build**: Vite with optimized bundle splitting

## 🏗 Architecture

### **State Management Strategy**

**Zustand Choice Rationale:**
- **Simplicity**: Less boilerplate than Redux Toolkit
- **Performance**: Selective subscriptions prevent unnecessary re-renders
- **TypeScript**: Excellent TypeScript support out of the box
- **Bundle Size**: Smaller footprint than Redux ecosystem
- **Learning Curve**: Easier for team adoption

**Store Structure:**
```
stores/
├── app-store.ts          # Global app state (user, theme, notifications)
├── orders-store.ts       # Order management state
├── products-store.ts     # Product catalog state
├── campaigns-store.ts    # Campaign management state
└── bulk-store.ts         # Bulk operations state
```

### **Component Architecture**

```
components/
├── layout/
│   ├── AppLayout.tsx           # Main application layout
│   ├── Sidebar.tsx             # Navigation sidebar
│   └── Header.tsx              # Top header with user menu
├── orders/
│   ├── OrderList.tsx           # Main orders table with virtual scrolling
│   ├── OrderDetailsDrawer.tsx  # Order details side panel
│   ├── OrderStatusModal.tsx    # Status update modal
│   └── OrderFilters.tsx        # Advanced filtering component
├── bulk/
│   ├── BulkOperationsHub.tsx   # Main bulk operations interface
│   ├── FileUploader.tsx        # Drag-and-drop file upload
│   ├── ProgressTracker.tsx     # Upload progress monitoring
│   └── ErrorViewer.tsx         # Error details and retry
├── analytics/
│   ├── AnalyticsDashboard.tsx  # Main analytics overview
│   ├── RevenueChart.tsx        # Revenue visualization
│   ├── OrdersChart.tsx         # Order analytics
│   └── InventoryAlerts.tsx     # Stock alerts
├── campaigns/
│   ├── CampaignList.tsx        # Campaign management
│   ├── CampaignForm.tsx        # Campaign creation/editing
│   └── CampaignMetrics.tsx     # Performance tracking
├── common/
│   ├── ErrorBoundary.tsx       # Error boundary wrapper
│   ├── LoadingSpinner.tsx      # Loading states
│   ├── ConnectionStatus.tsx    # WebSocket status indicator
│   └── VirtualTable.tsx        # Virtual scrolling table
└── notifications/
    ├── NotificationPanel.tsx   # Notification center
    └── NotificationItem.tsx    # Individual notification
```

### **WebSocket Event Handling**

```typescript
// Event Types
interface OrderUpdateEvent {
  type: 'order_update';
  data: {
    orderId: string;
    status: OrderStatus;
    courierInfo?: CourierInfo;
    estimatedDeliveryTime?: string;
  };
}

// Event Handlers
const eventHandlers = {
  order_update: (event: OrderUpdateEvent) => {
    updateOrder(event.data.orderId, event.data);
    showNotification('Order status updated');
  },
  inventory_alert: (event: InventoryAlertEvent) => {
    showNotification('Low stock alert', 'warning');
  },
  bulk_operation_complete: (event: BulkOperationEvent) => {
    showNotification('Bulk operation completed');
    refetchBulkOperations();
  },
};
```

## 🚀 Performance Optimizations

### **Bundle Splitting**
- **Vendor Chunk**: React, React-DOM, React-Router
- **UI Chunk**: Ant Design components and icons
- **Utils Chunk**: Lodash, Day.js, Axios
- **Route-based**: Lazy loading for each page

### **Virtual Scrolling**
- **Large Datasets**: Handle 10k+ orders without performance degradation
- **Memory Efficient**: Only render visible rows
- **Smooth Scrolling**: 60fps scrolling performance

### **Caching Strategy**
- **React Query**: 5-minute stale time for static data
- **WebSocket**: Real-time updates bypass cache
- **Local Storage**: Persist user preferences and auth state

### **WebSocket Optimization**
- **Selective Subscriptions**: Only subscribe to relevant events
- **Automatic Reconnection**: Exponential backoff with max attempts
- **Connection Pooling**: Reuse connections across components

## 🧪 Testing Strategy

### **Unit Tests (Target: 80%+ Coverage)**
- **Components**: Render tests and user interactions
- **Hooks**: Custom hook behavior and state management
- **Services**: API service methods and error handling
- **Stores**: State mutations and computed values

### **E2E Tests (Critical Flows)**
- **Order Management**: Create, update, and track orders
- **Bulk Operations**: File upload and processing
- **Real-time Updates**: WebSocket event handling
- **Authentication**: Login/logout flows

### **Performance Tests**
- **Large Dataset Rendering**: 10k+ orders performance
- **Bulk Upload**: 50+ simultaneous CSV uploads
- **WebSocket Load**: 1000+ concurrent connections
- **Memory Usage**: Long-running session stability

## 📊 Monitoring & Observability

### **Performance Metrics**
- **Core Web Vitals**: LCP, FID, CLS monitoring
- **Bundle Size**: Track bundle growth over time
- **API Response Times**: Monitor backend performance
- **WebSocket Latency**: Real-time update delays

### **Error Tracking**
- **Error Boundaries**: Graceful error handling
- **API Errors**: Centralized error reporting
- **WebSocket Errors**: Connection failure tracking
- **User Actions**: Failed operation logging

### **Business Metrics**
- **Order Processing Time**: Status update latency
- **Bulk Operation Success Rate**: Upload completion rates
- **User Engagement**: Feature usage analytics
- **Performance Bottlenecks**: Slow operation identification

## 🔧 Development

### **Setup**
```bash
# Install dependencies
pnpm install

# Start development server
pnpm --filter "@cebeuygun/seller-web" dev

# Run tests
pnpm --filter "@cebeuygun/seller-web" test

# Run E2E tests
pnpm --filter "@cebeuygun/seller-web" test:e2e

# Build for production
pnpm --filter "@cebeuygun/seller-web" build
```

### **Environment Variables**
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
VITE_ENABLE_ANALYTICS=true
VITE_MAX_FILE_SIZE=10485760
VITE_DEFAULT_PAGE_SIZE=20
```

## 🚀 Deployment

### **Docker Production Build**
```bash
# Build production image
docker build -f apps/seller-web/Dockerfile -t seller-web:latest .

# Run container
docker run -p 80:80 seller-web:latest
```

### **Kubernetes Deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: seller-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: seller-web
  template:
    metadata:
      labels:
        app: seller-web
    spec:
      containers:
      - name: seller-web
        image: seller-web:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
```

## 📈 Scalability Considerations

### **Horizontal Scaling**
- **Stateless Design**: No server-side state dependencies
- **CDN Integration**: Static asset distribution
- **Load Balancing**: Multiple instance support
- **Database Optimization**: Efficient query patterns

### **Performance Targets**
- **Initial Load**: < 2 seconds
- **Order Updates**: < 500ms reflection time
- **Bulk Operations**: 50+ concurrent uploads
- **Memory Usage**: < 100MB per session
- **Bundle Size**: < 1MB gzipped

## 🔒 Security

### **Authentication & Authorization**
- **JWT Tokens**: Secure API authentication
- **Role-based Access**: Seller-specific data access
- **Session Management**: Automatic token refresh
- **CSRF Protection**: Request validation

### **Data Security**
- **Input Validation**: Client and server-side validation
- **XSS Prevention**: Sanitized user inputs
- **Secure Headers**: CSP and security headers
- **Audit Logging**: User action tracking

This Seller Web Panel provides a robust, scalable foundation for multi-vendor marketplace operations with excellent performance, comprehensive testing, and production-ready deployment capabilities.