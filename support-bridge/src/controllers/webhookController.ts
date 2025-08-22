import { Request, Response } from 'express';
import { webhookService } from '@/services/webhookService';
import { chatService } from '@/services/chatService';
import { ticketService } from '@/services/ticketService';
import { logger } from '@/utils/logger';
import { config } from '@/config';

export class WebhookController {
  async handleTicketingWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['x-webhook-signature'] as string;
      const timestamp = req.headers['x-webhook-timestamp'] as string;

      // Verify webhook signature
      const isValid = await webhookService.verifyWebhookSignature(
        req.body,
        signature,
        config.webhook.secret
      );

      if (!isValid) {
        res.status(401).json({
          success: false,
          error: 'Invalid webhook signature',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { eventType, data } = req.body;

      // Process webhook event
      await this.processTicketingEvent(eventType, data);

      res.json({
        success: true,
        message: 'Webhook processed successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Ticketing webhook error:', error);
      res.status(500).json({
        success: false,
        error: 'Webhook processing failed',
        timestamp: new Date().toISOString(),
      });
    }
  }

  async handleChatWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { eventType, data } = req.body;

      // Process chat webhook event
      await this.processChatEvent(eventType, data);

      res.json({
        success: true,
        message: 'Chat webhook processed successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Chat webhook error:', error);
      res.status(500).json({
        success: false,
        error: 'Chat webhook processing failed',
        timestamp: new Date().toISOString(),
      });
    }
  }

  private async processTicketingEvent(eventType: string, data: any): Promise<void> {
    switch (eventType) {
      case 'ticket.assigned':
        await this.handleTicketAssigned(data);
        break;
      case 'ticket.resolved':
        await this.handleTicketResolved(data);
        break;
      case 'ticket.escalated':
        await this.handleTicketEscalated(data);
        break;
      default:
        logger.warn('Unknown ticketing event type:', eventType);
    }
  }

  private async processChatEvent(eventType: string, data: any): Promise<void> {
    switch (eventType) {
      case 'agent.status_changed':
        await this.handleAgentStatusChanged(data);
        break;
      case 'session.timeout':
        await this.handleSessionTimeout(data);
        break;
      default:
        logger.warn('Unknown chat event type:', eventType);
    }
  }

  private async handleTicketAssigned(data: any): Promise<void> {
    logger.info('Ticket assigned webhook received', data);
    // Handle ticket assignment logic
  }

  private async handleTicketResolved(data: any): Promise<void> {
    logger.info('Ticket resolved webhook received', data);
    // Handle ticket resolution logic
  }

  private async handleTicketEscalated(data: any): Promise<void> {
    logger.info('Ticket escalated webhook received', data);
    // Handle ticket escalation logic
  }

  private async handleAgentStatusChanged(data: any): Promise<void> {
    logger.info('Agent status changed webhook received', data);
    // Handle agent status change logic
  }

  private async handleSessionTimeout(data: any): Promise<void> {
    logger.info('Session timeout webhook received', data);
    await chatService.endChatSession(data.sessionId, 'timeout');
  }
}

export const webhookController = new WebhookController();