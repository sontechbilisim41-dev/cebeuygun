// Support System Types
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