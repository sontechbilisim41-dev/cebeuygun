// Core Integration Types
export interface IntegrationConfig {
  id: string;
  merchantId: string;
  name: string;
  type: 'webhook' | 'polling' | 'hybrid';
  connector: 'csv' | 'logo' | 'netsis' | 'custom';
  status: 'active' | 'inactive' | 'error' | 'pending';
  settings: Record<string, any>;
  credentials: EncryptedCredentials;
  lastSyncAt?: string;
  nextSyncAt?: string;
  errorCount: number;
  maxRetries: number;
  retryDelay: number;
  createdAt: string;
  updatedAt: string;
}

export interface EncryptedCredentials {
  apiKey?: string;
  username?: string;
  password?: string;
  endpoint?: string;
  token?: string;
  customFields?: Record<string, string>;
}

export interface SyncJob {
  id: string;
  integrationId: string;
  type: 'inventory' | 'pricing' | 'orders' | 'full';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying';
  priority: number;
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  retryCount: number;
  metadata: Record<string, any>;
  progress?: {
    total: number;
    processed: number;
    errors: number;
  };
}

export interface DataMapping {
  id: string;
  integrationId: string;
  sourceField: string;
  targetField: string;
  transformation?: string;
  defaultValue?: any;
  required: boolean;
  validation?: string;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsUpdated: number;
  recordsCreated: number;
  recordsSkipped: number;
  errors: SyncError[];
  duration: number;
  timestamp: string;
}

export interface SyncError {
  id: string;
  type: 'validation' | 'mapping' | 'network' | 'business' | 'system';
  message: string;
  details?: any;
  recordId?: string;
  field?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Product & Inventory Types
export interface ProductSync {
  externalId: string;
  sku: string;
  name: string;
  description?: string;
  categoryId?: string;
  brand?: string;
  price: number;
  currency: string;
  stock: number;
  minStock?: number;
  maxStock?: number;
  isActive: boolean;
  attributes?: Record<string, any>;
  images?: string[];
  lastModified: string;
}

export interface InventoryUpdate {
  sku: string;
  stock: number;
  reservedStock?: number;
  availableStock?: number;
  lastUpdated: string;
  location?: string;
}

export interface PriceUpdate {
  sku: string;
  price: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
  priceType: 'regular' | 'sale' | 'bulk';
}

// Order Types
export interface OrderSync {
  externalOrderId: string;
  platformOrderId?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  items: OrderItemSync[];
  customer: CustomerSync;
  totalAmount: number;
  currency: string;
  orderDate: string;
  deliveryDate?: string;
  notes?: string;
}

export interface OrderItemSync {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  attributes?: Record<string, any>;
}

export interface CustomerSync {
  externalId?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: AddressSync;
}

export interface AddressSync {
  street: string;
  city: string;
  district?: string;
  postalCode?: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Webhook Types
export interface WebhookEvent {
  id: string;
  integrationId: string;
  eventType: string;
  payload: any;
  signature?: string;
  timestamp: string;
  processed: boolean;
  processedAt?: string;
  errorMessage?: string;
  retryCount: number;
}

export interface WebhookConfig {
  url: string;
  secret: string;
  events: string[];
  headers?: Record<string, string>;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    maxDelay: number;
  };
}

// Connector Interface
export interface BaseConnector {
  id: string;
  name: string;
  version: string;
  supportedOperations: string[];
  
  // Connection management
  connect(config: IntegrationConfig): Promise<boolean>;
  disconnect(): Promise<void>;
  testConnection(): Promise<boolean>;
  
  // Data synchronization
  syncProducts(mapping: DataMapping[]): Promise<SyncResult>;
  syncInventory(mapping: DataMapping[]): Promise<SyncResult>;
  syncPricing(mapping: DataMapping[]): Promise<SyncResult>;
  syncOrders(mapping: DataMapping[]): Promise<SyncResult>;
  
  // Webhook support
  setupWebhook?(config: WebhookConfig): Promise<boolean>;
  processWebhookEvent?(event: WebhookEvent): Promise<SyncResult>;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Health Check Types
export interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  details: {
    database: boolean;
    redis: boolean;
    integrations: Record<string, boolean>;
    queues: Record<string, number>;
  };
  uptime: number;
  version: string;
}

// Monitoring Types
export interface IntegrationMetrics {
  integrationId: string;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageSyncTime: number;
  lastSyncAt?: string;
  errorRate: number;
  dataVolume: {
    products: number;
    orders: number;
    inventory: number;
  };
}

export interface SystemMetrics {
  activeIntegrations: number;
  totalSyncs: number;
  queueSize: number;
  errorRate: number;
  averageResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

// Event Types for Event Sourcing
export interface IntegrationEvent {
  id: string;
  integrationId: string;
  eventType: 'sync_started' | 'sync_completed' | 'sync_failed' | 'connection_lost' | 'connection_restored';
  payload: any;
  timestamp: string;
  version: number;
}

// Configuration Types
export interface ConnectorConfig {
  name: string;
  version: string;
  description: string;
  supportedFormats: string[];
  requiredFields: string[];
  optionalFields: string[];
  defaultMappings: DataMapping[];
  validationRules: Record<string, any>;
}

// Error Types
export interface IntegrationError extends Error {
  code: string;
  integrationId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  context?: Record<string, any>;
}

// Queue Job Types
export interface SyncJobData {
  integrationId: string;
  type: 'inventory' | 'pricing' | 'orders' | 'products' | 'full';
  priority: number;
  metadata?: Record<string, any>;
  idempotencyKey: string;
}

export interface WebhookJobData {
  integrationId: string;
  event: WebhookEvent;
  idempotencyKey: string;
}

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

// Audit Types
export interface AuditLog {
  id: string;
  integrationId: string;
  action: string;
  userId?: string;
  details: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}