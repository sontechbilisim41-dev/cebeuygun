import { Request, Response } from 'express';
import { integrationService } from '@/services/integrationService';
import { queueService } from '@/services/queueService';
import { metricsService } from '@/services/metricsService';
import { connectorFactory } from '@/connectors/connectorFactory';
import { logger } from '@/utils/logger';
import { validateIntegrationConfig, validateSyncRequest } from '@/utils/validation';

export class IntegrationController {
  async createIntegration(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validateIntegrationConfig(req.body);
      
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'],
        });
        return;
      }

      const integration = await integrationService.createIntegration(value);

      res.status(201).json({
        success: true,
        data: integration,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    } catch (error) {
      logger.error('Create integration failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    }
  }

  async getIntegration(req: Request, res: Response): Promise<void> {
    try {
      const { integrationId } = req.params;
      const integration = await integrationService.getIntegration(integrationId);

      if (!integration) {
        res.status(404).json({
          success: false,
          error: 'Integration not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'],
        });
        return;
      }

      // Remove sensitive credentials from response
      const safeIntegration = {
        ...integration,
        credentials: {
          ...integration.credentials,
          password: integration.credentials.password ? '***' : undefined,
          apiKey: integration.credentials.apiKey ? '***' : undefined,
          token: integration.credentials.token ? '***' : undefined,
        },
      };

      res.json({
        success: true,
        data: safeIntegration,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    } catch (error) {
      logger.error('Get integration failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    }
  }

  async updateIntegration(req: Request, res: Response): Promise<void> {
    try {
      const { integrationId } = req.params;
      const updates = req.body;

      const integration = await integrationService.updateIntegration(integrationId, updates);

      res.json({
        success: true,
        data: integration,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    } catch (error) {
      logger.error('Update integration failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    }
  }

  async deleteIntegration(req: Request, res: Response): Promise<void> {
    try {
      const { integrationId } = req.params;
      await integrationService.deleteIntegration(integrationId);

      res.json({
        success: true,
        message: 'Integration deleted successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    } catch (error) {
      logger.error('Delete integration failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    }
  }

  async listIntegrations(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        merchantId: req.query.merchantId as string,
        status: req.query.status as string,
        connector: req.query.connector as string,
      };

      const integrations = await integrationService.getAllIntegrations(filters);

      // Remove sensitive data
      const safeIntegrations = integrations.map(integration => ({
        ...integration,
        credentials: {
          endpoint: integration.credentials.endpoint,
          username: integration.credentials.username,
          // Hide sensitive fields
        },
      }));

      res.json({
        success: true,
        data: safeIntegrations,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    } catch (error) {
      logger.error('List integrations failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    }
  }

  async testConnection(req: Request, res: Response): Promise<void> {
    try {
      const { integrationId } = req.params;
      const isConnected = await integrationService.testIntegrationConnection(integrationId);

      res.json({
        success: true,
        data: { connected: isConnected },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    } catch (error) {
      logger.error('Test connection failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    }
  }

  async triggerSync(req: Request, res: Response): Promise<void> {
    try {
      const { integrationId } = req.params;
      const { error, value } = validateSyncRequest(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'],
        });
        return;
      }

      const { type, priority = 0, delay = 0 } = value;

      const jobId = await queueService.addSyncJob(
        integrationId,
        type,
        priority,
        delay
      );

      res.json({
        success: true,
        data: { jobId },
        message: 'Sync job queued successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    } catch (error) {
      logger.error('Trigger sync failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    }
  }

  async getIntegrationMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { integrationId } = req.params;
      const metrics = await metricsService.getIntegrationMetrics(integrationId);

      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    } catch (error) {
      logger.error('Get integration metrics failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    }
  }

  async getAvailableConnectors(req: Request, res: Response): Promise<void> {
    try {
      const connectors = connectorFactory.getAvailableConnectors();

      res.json({
        success: true,
        data: connectors,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    } catch (error) {
      logger.error('Get available connectors failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    }
  }

  async getSystemHealth(req: Request, res: Response): Promise<void> {
    try {
      const queueStats = await queueService.getQueueStats();
      const systemMetrics = metricsService.getSystemMetrics();

      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        queues: queueStats,
        metrics: systemMetrics,
        memory: process.memoryUsage(),
      };

      res.json({
        success: true,
        data: health,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    } catch (error) {
      logger.error('Get system health failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    }
  }
}

export const integrationController = new IntegrationController();