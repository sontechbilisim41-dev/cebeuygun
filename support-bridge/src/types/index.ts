// Core Support Types
export interface SupportTicket {
  id: string;
  customerId: string;
  orderId?: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  assignedTo?: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

export type TicketStatus = 
  | 'open'
  | 'pending'
  | 'in_progress'
  | 'waiting_customer'
  | 'resolved'
  | 'closed'
  | 'escalated';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

export type TicketCategory = 
  | 'order_issue'
  | 'payment_problem'
  | 'delivery_delay'
  | 'product_quality'
  | 'refund_request'
  | 'technical_support'
  | 'general_inquiry'
  | 'complaint';

export interface ChatSession {
  id: string;
  customerId: string;
  ticketId?: string;
  orderId?: string;
  status: 'active' | 'waiting' | 'ended';
  agentId?: string;
  startedAt: string;
  endedAt?: string;
  metadata: {
    userAgent?: string;
    platform: 'web' | 'mobile' | 'api';
    source: string;
    customerInfo: CustomerInfo;
  };
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  ticketId?: string;
  senderId: string;
  senderType: 'customer' | 'agent' | 'system';
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system' | 'macro';
  attachments?: Attachment[];
  metadata?: Record<string, any>;
  timestamp: string;
  readAt?: string;
  editedAt?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

export interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  orderHistory: OrderSummary[];
  supportHistory: TicketSummary[];
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface TicketSummary {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  resolvedAt?: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  skills: string[];
  currentLoad: number;
  maxConcurrentChats: number;
  responseTime: {
    average: number;
    target: number;
  };
}

export interface Macro {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isActive: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EscalationRule {
  id: string;
  name: string;
  conditions: {
    priority?: TicketPriority[];
    category?: TicketCategory[];
    responseTime?: number;
    keywords?: string[];
  };
  actions: {
    assignTo?: string;
    changePriority?: TicketPriority;
    addTags?: string[];
    sendNotification?: boolean;
    createCall?: boolean;
  };
  isActive: boolean;
}

export interface WebhookEvent {
  id: string;
  type: 'ticket_created' | 'ticket_updated' | 'chat_started' | 'chat_ended' | 'message_sent';
  payload: any;
  timestamp: string;
  retryCount: number;
  processed: boolean;
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

// Real-time Event Types
export interface SocketEvent {
  type: 'message' | 'typing' | 'agent_joined' | 'agent_left' | 'session_ended';
  payload: any;
  timestamp: string;
}

// Analytics Types
export interface SupportMetrics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  customerSatisfactionScore: number;
  firstContactResolutionRate: number;
  escalationRate: number;
  agentUtilization: number;
}

export interface ChatMetrics {
  totalSessions: number;
  activeSessions: number;
  averageSessionDuration: number;
  messagesPerSession: number;
  chatToTicketConversionRate: number;
  customerSatisfactionScore: number;
}

// Configuration Types
export interface SupportConfig {
  chat: {
    enabled: boolean;
    maxConcurrentSessions: number;
    sessionTimeout: number;
    typingIndicatorTimeout: number;
    fileUpload: {
      enabled: boolean;
      maxSize: number;
      allowedTypes: string[];
    };
  };
  tickets: {
    autoAssignment: boolean;
    escalationEnabled: boolean;
    slaEnabled: boolean;
    defaultPriority: TicketPriority;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    webhook: boolean;
  };
}

// Error Types
export interface SupportError extends Error {
  code: string;
  statusCode: number;
  details?: any;
}

// Queue Job Types
export interface TicketJobData {
  ticketId: string;
  action: 'create' | 'update' | 'assign' | 'escalate' | 'close';
  payload: any;
  priority: number;
}

export interface NotificationJobData {
  type: 'email' | 'sms' | 'push' | 'webhook';
  recipient: string;
  template: string;
  data: any;
  priority: number;
}