import axios from 'axios';
import crypto from 'crypto';
import { WebhookEvent } from '@/types';
import { logger } from '@/utils/logger';
import { config } from '@/config';

class WebhookService {
  private webhookEndpoints: Map<string, {
    url: string;
    secret: string;
    events: string[];
    retryPolicy: {
      maxRetries: number;
      delay: number;
    };
  }> = new Map();

  async registerWebhook(
    id: string,
    url: string,
    secret: string,
    events: string[]
  ): Promise<void> {
    this.webhookEndpoints.set(id, {
      url,
      secret,
      events,
      retryPolicy: {
        maxRetries: 3,
        delay: 1000,
      },
    });

    logger.info('Webhook registered', { id, url, events });
  }

  async sendEvent(eventType: string, payload: any): Promise<void> {
    const event: WebhookEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventType as any,
      payload,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      processed: false,
    };

    // Send to all registered webhooks that listen to this event
    for (const [id, webhook] of this.webhookEndpoints.entries()) {
      if (webhook.events.includes(eventType)) {
        await this.sendWebhook(webhook, event);
      }
    }
  }

  private async sendWebhook(
    webhook: any,
    event: WebhookEvent,
    retryCount: number = 0
  ): Promise<void> {
    try {
      const signature = this.generateSignature(event.payload, webhook.secret);
      
      await axios.post(webhook.url, event, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event.type,
          'X-Webhook-Timestamp': event.timestamp,
        },
        timeout: config.webhook.timeout,
      });

      logger.info('Webhook sent successfully', {
        url: webhook.url,
        eventType: event.type,
        eventId: event.id,
      });
    } catch (error) {
      logger.error('Webhook send failed', {
        url: webhook.url,
        eventType: event.type,
        error: error.message,
        retryCount,
      });

      // Retry with exponential backoff
      if (retryCount < webhook.retryPolicy.maxRetries) {
        const delay = webhook.retryPolicy.delay * Math.pow(2, retryCount);
        
        setTimeout(() => {
          this.sendWebhook(webhook, event, retryCount + 1);
        }, delay);
      }
    }
  }

  private generateSignature(payload: any, secret: string): string {
    const payloadString = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
  }

  async verifyWebhookSignature(
    payload: any,
    signature: string,
    secret: string
  ): Promise<boolean> {
    try {
      const expectedSignature = this.generateSignature(payload, secret);
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      logger.error('Webhook signature verification failed:', error);
      return false;
    }
  }
}

export const webhookService = new WebhookService();