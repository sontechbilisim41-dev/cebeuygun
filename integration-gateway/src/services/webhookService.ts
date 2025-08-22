import crypto from 'crypto';
import { WebhookEvent, SyncResult, IntegrationConfig } from '@/types';
import { logger } from '@/utils/logger';
import { integrationService } from './integrationService';
import { connectorFactory } from '@/connectors/connectorFactory';
import { auditService } from './auditService';

class WebhookService {
  async processEvent(integrationId: string, event: WebhookEvent): Promise<SyncResult> {
    try {
      logger.info(`Processing webhook event: ${event.id}`, {
        integrationId,
        eventType: event.eventType,
      });

      // Get integration configuration
      const integration = await integrationService.getIntegration(integrationId);
      if (!integration) {
        throw new Error(`Integration not found: ${integrationId}`);
      }

      // Verify webhook signature if provided
      if (event.signature) {
        const isValid = await this.verifyWebhookSignature(
          event.payload,
          event.signature,
          integration.credentials.token || ''
        );
        
        if (!isValid) {
          throw new Error('Invalid webhook signature');
        }
      }

      // Get connector and process event
      const connector = connectorFactory.createConnector(integration.connector);
      
      if (!connector.processWebhookEvent) {
        throw new Error(`Connector ${integration.connector} does not support webhooks`);
      }

      await connector.connect(integration);
      const result = await connector.processWebhookEvent(event);
      await connector.disconnect();

      // Update integration last sync time
      await integrationService.updateIntegration(integrationId, {
        lastSyncAt: new Date().toISOString(),
        errorCount: 0,
      });

      // Log audit event
      await auditService.logEvent({
        integrationId,
        action: 'WEBHOOK_PROCESSED',
        details: {
          eventType: event.eventType,
          recordsProcessed: result.recordsProcessed,
        },
        timestamp: new Date().toISOString(),
      });

      logger.info(`Webhook event processed: ${event.id}`, {
        integrationId,
        recordsProcessed: result.recordsProcessed,
      });

      return result;
    } catch (error) {
      logger.error(`Webhook processing failed: ${event.id}`, {
        integrationId,
        error: error.message,
      });

      // Increment error count
      await integrationService.incrementErrorCount(integrationId);

      // Log audit event
      await auditService.logEvent({
        integrationId,
        action: 'WEBHOOK_FAILED',
        details: {
          eventType: event.eventType,
          error: error.message,
        },
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }

  async verifyWebhookSignature(
    payload: any,
    signature: string,
    secret: string
  ): Promise<boolean> {
    try {
      const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex');

      // Compare signatures using timing-safe comparison
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      logger.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  async registerWebhook(
    integrationId: string,
    webhookUrl: string,
    events: string[],
    secret?: string
  ): Promise<boolean> {
    try {
      const integration = await integrationService.getIntegration(integrationId);
      if (!integration) {
        throw new Error(`Integration not found: ${integrationId}`);
      }

      const connector = connectorFactory.createConnector(integration.connector);
      
      if (!connector.setupWebhook) {
        throw new Error(`Connector ${integration.connector} does not support webhook setup`);
      }

      await connector.connect(integration);
      
      const webhookConfig = {
        url: webhookUrl,
        secret: secret || crypto.randomBytes(32).toString('hex'),
        events,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Integration-Gateway/1.0',
        },
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          maxDelay: 60000,
        },
      };

      const success = await connector.setupWebhook(webhookConfig);
      await connector.disconnect();

      if (success) {
        // Update integration settings
        await integrationService.updateIntegration(integrationId, {
          settings: {
            ...integration.settings,
            webhook: webhookConfig,
          },
        });

        // Log audit event
        await auditService.logEvent({
          integrationId,
          action: 'WEBHOOK_REGISTERED',
          details: {
            url: webhookUrl,
            events,
          },
          timestamp: new Date().toISOString(),
        });
      }

      logger.info(`Webhook registration ${success ? 'successful' : 'failed'}: ${integrationId}`);

      return success;
    } catch (error) {
      logger.error(`Webhook registration failed for ${integrationId}:`, error);
      throw error;
    }
  }

  async unregisterWebhook(integrationId: string): Promise<boolean> {
    try {
      const integration = await integrationService.getIntegration(integrationId);
      if (!integration) {
        throw new Error(`Integration not found: ${integrationId}`);
      }

      // Remove webhook configuration from settings
      const updatedSettings = { ...integration.settings };
      delete updatedSettings.webhook;

      await integrationService.updateIntegration(integrationId, {
        settings: updatedSettings,
      });

      // Log audit event
      await auditService.logEvent({
        integrationId,
        action: 'WEBHOOK_UNREGISTERED',
        details: {},
        timestamp: new Date().toISOString(),
      });

      logger.info(`Webhook unregistered: ${integrationId}`);

      return true;
    } catch (error) {
      logger.error(`Webhook unregistration failed for ${integrationId}:`, error);
      throw error;
    }
  }

  generateWebhookSignature(payload: any, secret: string): string {
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
  }

  async validateWebhookTimestamp(timestamp: string, maxAge: number = 300): Promise<boolean> {
    try {
      const eventTime = new Date(timestamp).getTime();
      const currentTime = Date.now();
      const age = (currentTime - eventTime) / 1000;

      return age <= maxAge;
    } catch (error) {
      logger.error('Webhook timestamp validation failed:', error);
      return false;
    }
  }
}

export const webhookService = new WebhookService();