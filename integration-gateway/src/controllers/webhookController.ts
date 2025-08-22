import { Request, Response } from 'express';
import { webhookService } from '@/services/webhookService';
import { queueService } from '@/services/queueService';
import { logger } from '@/utils/logger';
import { WebhookEvent } from '@/types';

export class WebhookController {
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { integrationId } = req.params;
      const signature = req.headers['x-webhook-signature'] as string;
      const timestamp = req.headers['x-webhook-timestamp'] as string;

      // Validate timestamp
      if (timestamp) {
        const isValidTimestamp = await webhookService.validateWebhookTimestamp(timestamp);
        if (!isValidTimestamp) {
          res.status(400).json({
            success: false,
            error: 'Webhook timestamp too old',
            timestamp: new Date().toISOString(),
          });
          return;
        }
      }

      // Create webhook event
      const webhookEvent: WebhookEvent = {
        id: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        integrationId,
        eventType: req.body.eventType || 'unknown',
        payload: req.body,
        signature,
        timestamp: timestamp || new Date().toISOString(),
        processed: false,
        retryCount: 0,
      };

      // Queue webhook for processing
      const jobId = await queueService.addWebhookJob(integrationId, webhookEvent);

      // Respond immediately to webhook sender
      res.status(200).json({
        success: true,
        message: 'Webhook received and queued for processing',
        jobId,
        timestamp: new Date().toISOString(),
      });

      logger.info(`Webhook received and queued: ${webhookEvent.id}`, {
        integrationId,
        eventType: webhookEvent.eventType,
        jobId,
      });
    } catch (error) {
      logger.error('Webhook handling failed:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  async registerWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { integrationId } = req.params;
      const { url, events, secret } = req.body;

      if (!url || !events || !Array.isArray(events)) {
        res.status(400).json({
          success: false,
          error: 'Webhook URL and events are required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const success = await webhookService.registerWebhook(
        integrationId,
        url,
        events,
        secret
      );

      if (success) {
        res.json({
          success: true,
          message: 'Webhook registered successfully',
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Failed to register webhook',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error('Webhook registration failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async unregisterWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { integrationId } = req.params;

      const success = await webhookService.unregisterWebhook(integrationId);

      if (success) {
        res.json({
          success: true,
          message: 'Webhook unregistered successfully',
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Failed to unregister webhook',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error('Webhook unregistration failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async testWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { integrationId } = req.params;
      const { eventType, payload } = req.body;

      // Create test webhook event
      const testEvent: WebhookEvent = {
        id: `test_${Date.now()}`,
        integrationId,
        eventType: eventType || 'test.event',
        payload: payload || { test: true },
        timestamp: new Date().toISOString(),
        processed: false,
        retryCount: 0,
      };

      // Process test event
      const result = await webhookService.processEvent(integrationId, testEvent);

      res.json({
        success: true,
        data: result,
        message: 'Test webhook processed successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Test webhook failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async getWebhookLogs(req: Request, res: Response): Promise<void> {
    try {
      const { integrationId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      // This would query webhook logs from database
      const logs = {
        data: [], // Mock data
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: 0,
          totalPages: 0,
        },
      };

      res.json({
        success: true,
        data: logs,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get webhook logs failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const webhookController = new WebhookController();