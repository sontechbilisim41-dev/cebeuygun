import axios from 'axios';
import { logger } from '@/utils/logger';
import { config } from '@/config';

interface NotificationData {
  recipient: string;
  template: string;
  data: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

class NotificationService {
  private notificationApi = axios.create({
    baseURL: config.services.notificationService.baseUrl,
    timeout: config.services.notificationService.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async sendEmailNotification(data: NotificationData): Promise<void> {
    try {
      await this.notificationApi.post('/notifications/email', {
        to: data.recipient,
        template: data.template,
        data: data.data,
        priority: data.priority || 'medium',
      });

      logger.info('Email notification sent', {
        recipient: data.recipient,
        template: data.template,
      });
    } catch (error) {
      logger.error('Send email notification error:', error);
      throw error;
    }
  }

  async sendSMSNotification(data: NotificationData): Promise<void> {
    try {
      await this.notificationApi.post('/notifications/sms', {
        to: data.recipient,
        template: data.template,
        data: data.data,
        priority: data.priority || 'medium',
      });

      logger.info('SMS notification sent', {
        recipient: data.recipient,
        template: data.template,
      });
    } catch (error) {
      logger.error('Send SMS notification error:', error);
      throw error;
    }
  }

  async sendPushNotification(data: NotificationData): Promise<void> {
    try {
      await this.notificationApi.post('/notifications/push', {
        to: data.recipient,
        template: data.template,
        data: data.data,
        priority: data.priority || 'medium',
      });

      logger.info('Push notification sent', {
        recipient: data.recipient,
        template: data.template,
      });
    } catch (error) {
      logger.error('Send push notification error:', error);
      throw error;
    }
  }

  async sendCallEscalation(data: {
    ticketId: string;
    customerId: string;
    reason: string;
    customerPhone?: string;
  }): Promise<void> {
    try {
      // Trigger emergency call system
      await this.notificationApi.post('/notifications/call-escalation', {
        ticketId: data.ticketId,
        customerId: data.customerId,
        reason: data.reason,
        customerPhone: data.customerPhone,
        priority: 'urgent',
      });

      logger.info('Call escalation triggered', {
        ticketId: data.ticketId,
        customerId: data.customerId,
        reason: data.reason,
      });
    } catch (error) {
      logger.error('Send call escalation error:', error);
      throw error;
    }
  }

  async notifyAgentAssignment(agentId: string, ticketId: string): Promise<void> {
    try {
      await this.sendEmailNotification({
        recipient: agentId,
        template: 'agent_assignment',
        data: { ticketId },
        priority: 'medium',
      });
    } catch (error) {
      logger.error('Notify agent assignment error:', error);
    }
  }

  async notifyCustomerResponse(customerId: string, ticketId: string, message: string): Promise<void> {
    try {
      await this.sendEmailNotification({
        recipient: customerId,
        template: 'customer_response',
        data: { ticketId, message },
        priority: 'medium',
      });
    } catch (error) {
      logger.error('Notify customer response error:', error);
    }
  }

  async notifyTicketResolution(customerId: string, ticketId: string): Promise<void> {
    try {
      await this.sendEmailNotification({
        recipient: customerId,
        template: 'ticket_resolved',
        data: { ticketId },
        priority: 'low',
      });
    } catch (error) {
      logger.error('Notify ticket resolution error:', error);
    }
  }
}

export const notificationService = new NotificationService();