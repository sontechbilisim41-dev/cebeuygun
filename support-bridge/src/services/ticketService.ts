import { SupportTicket, ChatSession, ChatMessage, TicketPriority, TicketStatus } from '@/types';
import { logger } from '@/utils/logger';
import { cacheService } from './cacheService';
import { webhookService } from './webhookService';
import axios from 'axios';
import { config } from '@/config';

class TicketService {
  private ticketingApi = axios.create({
    baseURL: config.services.ticketingApi.baseUrl,
    timeout: config.services.ticketingApi.timeout,
    headers: {
      'Authorization': `Bearer ${config.services.ticketingApi.apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  async createTicket(ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupportTicket> {
    try {
      const ticket: SupportTicket = {
        ...ticketData,
        id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Send to external ticketing system
      await this.ticketingApi.post('/tickets', ticket);

      // Cache ticket
      await cacheService.set(`ticket:${ticket.id}`, ticket, 3600);

      // Send webhook event
      await webhookService.sendEvent('ticket_created', ticket);

      logger.info('Ticket created', {
        ticketId: ticket.id,
        customerId: ticket.customerId,
        priority: ticket.priority,
      });

      return ticket;
    } catch (error) {
      logger.error('Create ticket error:', error);
      throw error;
    }
  }

  async createTicketFromChat(session: ChatSession, orderId?: string): Promise<SupportTicket> {
    try {
      // Get order details if orderId provided
      const orderDetails = orderId ? await this.getOrderDetails(orderId) : null;
      
      const ticketData = {
        customerId: session.customerId,
        orderId: orderId,
        subject: this.generateSubjectFromContext(session, orderDetails),
        description: this.generateDescriptionFromContext(session, orderDetails),
        status: 'open' as TicketStatus,
        priority: this.determinePriority(session, orderDetails),
        category: this.determineCategory(session, orderDetails),
        tags: this.generateTags(session, orderDetails),
        metadata: {
          source: 'chat',
          sessionId: session.id,
          platform: session.metadata.platform,
          orderDetails,
        },
      };

      return await this.createTicket(ticketData);
    } catch (error) {
      logger.error('Create ticket from chat error:', error);
      throw error;
    }
  }

  async getTicket(ticketId: string): Promise<SupportTicket> {
    try {
      // Try cache first
      const cached = await cacheService.get(`ticket:${ticketId}`);
      if (cached) {
        return cached;
      }

      // Fetch from external system
      const response = await this.ticketingApi.get(`/tickets/${ticketId}`);
      const ticket = response.data;

      // Cache for future requests
      await cacheService.set(`ticket:${ticketId}`, ticket, 3600);

      return ticket;
    } catch (error) {
      logger.error('Get ticket error:', error);
      throw error;
    }
  }

  async updateTicket(ticketId: string, updates: Partial<SupportTicket>): Promise<SupportTicket> {
    try {
      const updatedTicket = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Update external system
      await this.ticketingApi.put(`/tickets/${ticketId}`, updatedTicket);

      // Update cache
      const cached = await cacheService.get(`ticket:${ticketId}`);
      if (cached) {
        const updated = { ...cached, ...updatedTicket };
        await cacheService.set(`ticket:${ticketId}`, updated, 3600);
      }

      // Send webhook event
      await webhookService.sendEvent('ticket_updated', { ticketId, updates });

      logger.info('Ticket updated', { ticketId, updates });

      return await this.getTicket(ticketId);
    } catch (error) {
      logger.error('Update ticket error:', error);
      throw error;
    }
  }

  async addMessageToTicket(ticketId: string, message: ChatMessage): Promise<void> {
    try {
      // Add message to external ticketing system
      await this.ticketingApi.post(`/tickets/${ticketId}/messages`, {
        content: message.content,
        senderId: message.senderId,
        senderType: message.senderType,
        timestamp: message.timestamp,
        attachments: message.attachments,
      });

      // Update ticket last activity
      await this.updateTicket(ticketId, {
        updatedAt: new Date().toISOString(),
      });

      logger.debug('Message added to ticket', { ticketId, messageId: message.id });
    } catch (error) {
      logger.error('Add message to ticket error:', error);
      throw error;
    }
  }

  async getCustomerTickets(customerId: string, filters?: {
    status?: TicketStatus;
    priority?: TicketPriority;
    limit?: number;
    offset?: number;
  }): Promise<{ tickets: SupportTicket[]; total: number }> {
    try {
      const response = await this.ticketingApi.get('/tickets', {
        params: {
          customerId,
          ...filters,
        },
      });

      return {
        tickets: response.data.tickets,
        total: response.data.total,
      };
    } catch (error) {
      logger.error('Get customer tickets error:', error);
      throw error;
    }
  }

  async searchTickets(query: string, filters?: any): Promise<SupportTicket[]> {
    try {
      const response = await this.ticketingApi.get('/tickets/search', {
        params: { query, ...filters },
      });

      return response.data.tickets;
    } catch (error) {
      logger.error('Search tickets error:', error);
      throw error;
    }
  }

  // Helper methods
  private async getOrderDetails(orderId: string): Promise<any> {
    try {
      const response = await axios.get(`${config.services.orderService.baseUrl}/orders/${orderId}`, {
        timeout: config.services.orderService.timeout,
      });
      return response.data;
    } catch (error) {
      logger.error('Get order details error:', error);
      return null;
    }
  }

  private generateSubjectFromContext(session: ChatSession, orderDetails?: any): string {
    if (orderDetails) {
      return `Order Support - #${orderDetails.orderNumber}`;
    }
    
    return `Support Request - ${session.metadata.source}`;
  }

  private generateDescriptionFromContext(session: ChatSession, orderDetails?: any): string {
    let description = `Customer initiated support chat from ${session.metadata.source}`;
    
    if (orderDetails) {
      description += `\n\nOrder Details:`;
      description += `\n- Order ID: ${orderDetails.id}`;
      description += `\n- Status: ${orderDetails.status}`;
      description += `\n- Total: ${orderDetails.totalAmount}`;
      description += `\n- Date: ${orderDetails.createdAt}`;
    }

    return description;
  }

  private determinePriority(session: ChatSession, orderDetails?: any): TicketPriority {
    // Determine priority based on context
    if (orderDetails) {
      const orderAge = Date.now() - new Date(orderDetails.createdAt).getTime();
      const isRecentOrder = orderAge < 24 * 60 * 60 * 1000; // 24 hours
      
      if (orderDetails.status === 'cancelled' || orderDetails.status === 'failed') {
        return 'high';
      }
      
      if (isRecentOrder && orderDetails.status === 'pending') {
        return 'medium';
      }
    }

    return 'low';
  }

  private determineCategory(session: ChatSession, orderDetails?: any): any {
    if (orderDetails) {
      if (orderDetails.status === 'cancelled') return 'refund_request';
      if (orderDetails.status === 'failed') return 'payment_problem';
      if (orderDetails.status === 'delivering') return 'delivery_delay';
      return 'order_issue';
    }

    return 'general_inquiry';
  }

  private generateTags(session: ChatSession, orderDetails?: any): string[] {
    const tags = ['chat_origin', session.metadata.platform];
    
    if (orderDetails) {
      tags.push('order_related', `order_status_${orderDetails.status}`);
    }

    return tags;
  }
}

export const ticketService = new TicketService();