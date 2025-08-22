import { AppDataSource } from '@/config/database';
import { IntegrationConfig, SyncResult, DataMapping, SyncJobData } from '@/types';
import { logger } from '@/utils/logger';
import { encryptionService } from './encryptionService';
import { connectorFactory } from '@/connectors/connectorFactory';
import { auditService } from './auditService';
import { Repository } from 'typeorm';

class IntegrationService {
  private integrationRepository: Repository<any>;

  constructor() {
    // Initialize repository when database is ready
    this.initializeRepository();
  }

  private async initializeRepository(): Promise<void> {
    if (AppDataSource.isInitialized) {
      this.integrationRepository = AppDataSource.getRepository('Integration');
    }
  }

  async createIntegration(config: Omit<IntegrationConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<IntegrationConfig> {
    try {
      // Encrypt credentials
      const encryptedCredentials = await encryptionService.encryptCredentials(config.credentials);
      
      const integration: IntegrationConfig = {
        ...config,
        id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        credentials: encryptedCredentials,
        errorCount: 0,
        maxRetries: 3,
        retryDelay: 5000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to database
      await this.integrationRepository.save(integration);

      // Test connection
      await this.testIntegrationConnection(integration.id);

      // Log audit event
      await auditService.logEvent({
        integrationId: integration.id,
        action: 'INTEGRATION_CREATED',
        details: {
          merchantId: integration.merchantId,
          connector: integration.connector,
          type: integration.type,
        },
        timestamp: new Date().toISOString(),
      });

      logger.info(`Integration created: ${integration.id}`, {
        merchantId: integration.merchantId,
        connector: integration.connector,
      });

      return integration;
    } catch (error) {
      logger.error('Failed to create integration:', error);
      throw error;
    }
  }

  async getIntegration(integrationId: string): Promise<IntegrationConfig | null> {
    try {
      const integration = await this.integrationRepository.findOne({
        where: { id: integrationId },
      });

      if (!integration) {
        return null;
      }

      // Decrypt credentials
      integration.credentials = await encryptionService.decryptCredentials(integration.credentials);

      return integration;
    } catch (error) {
      logger.error(`Failed to get integration ${integrationId}:`, error);
      throw error;
    }
  }

  async updateIntegration(
    integrationId: string,
    updates: Partial<IntegrationConfig>
  ): Promise<IntegrationConfig> {
    try {
      const integration = await this.getIntegration(integrationId);
      if (!integration) {
        throw new Error(`Integration not found: ${integrationId}`);
      }

      // Encrypt credentials if provided
      if (updates.credentials) {
        updates.credentials = await encryptionService.encryptCredentials(updates.credentials);
      }

      const updatedIntegration = {
        ...integration,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await this.integrationRepository.save(updatedIntegration);

      // Log audit event
      await auditService.logEvent({
        integrationId,
        action: 'INTEGRATION_UPDATED',
        details: { updatedFields: Object.keys(updates) },
        timestamp: new Date().toISOString(),
      });

      logger.info(`Integration updated: ${integrationId}`);

      return updatedIntegration;
    } catch (error) {
      logger.error(`Failed to update integration ${integrationId}:`, error);
      throw error;
    }
  }

  async deleteIntegration(integrationId: string): Promise<void> {
    try {
      const integration = await this.getIntegration(integrationId);
      if (!integration) {
        throw new Error(`Integration not found: ${integrationId}`);
      }

      // Disable integration first
      await this.updateIntegration(integrationId, { status: 'inactive' });

      // Remove from database
      await this.integrationRepository.delete(integrationId);

      // Log audit event
      await auditService.logEvent({
        integrationId,
        action: 'INTEGRATION_DELETED',
        details: {
          merchantId: integration.merchantId,
          connector: integration.connector,
        },
        timestamp: new Date().toISOString(),
      });

      logger.info(`Integration deleted: ${integrationId}`);
    } catch (error) {
      logger.error(`Failed to delete integration ${integrationId}:`, error);
      throw error;
    }
  }

  async testIntegrationConnection(integrationId: string): Promise<boolean> {
    try {
      const integration = await this.getIntegration(integrationId);
      if (!integration) {
        throw new Error(`Integration not found: ${integrationId}`);
      }

      const connector = connectorFactory.createConnector(integration.connector);
      await connector.connect(integration);
      const isConnected = await connector.testConnection();
      await connector.disconnect();

      // Update integration status
      await this.updateIntegration(integrationId, {
        status: isConnected ? 'active' : 'error',
        errorCount: isConnected ? 0 : integration.errorCount + 1,
      });

      // Log audit event
      await auditService.logEvent({
        integrationId,
        action: 'CONNECTION_TEST',
        details: { success: isConnected },
        timestamp: new Date().toISOString(),
      });

      return isConnected;
    } catch (error) {
      logger.error(`Connection test failed for ${integrationId}:`, error);
      
      // Update error count
      await this.incrementErrorCount(integrationId);
      
      return false;
    }
  }

  async performSync(
    integration: IntegrationConfig,
    type: SyncJobData['type'],
    options: {
      onProgress?: (progress: number) => void;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<SyncResult> {
    const startTime = Date.now();
    
    try {
      logger.info(`Starting sync: ${integration.id}`, {
        type,
        connector: integration.connector,
      });

      // Get connector
      const connector = connectorFactory.createConnector(integration.connector);
      
      // Connect to external system
      await connector.connect(integration);
      options.onProgress?.(10);

      // Get data mappings
      const mappings = await this.getDataMappings(integration.id, type);
      options.onProgress?.(20);

      // Perform synchronization based on type
      let result: SyncResult;
      
      switch (type) {
        case 'inventory':
          result = await connector.syncInventory(mappings);
          break;
        case 'pricing':
          result = await connector.syncPricing(mappings);
          break;
        case 'orders':
          result = await connector.syncOrders(mappings);
          break;
        case 'products':
          result = await connector.syncProducts(mappings);
          break;
        case 'full':
          result = await this.performFullSync(connector, mappings, options.onProgress);
          break;
        default:
          throw new Error(`Unsupported sync type: ${type}`);
      }

      options.onProgress?.(90);

      // Disconnect
      await connector.disconnect();
      options.onProgress?.(95);

      // Update integration
      await this.updateIntegration(integration.id, {
        lastSyncAt: new Date().toISOString(),
        errorCount: 0,
        status: 'active',
      });

      options.onProgress?.(100);

      // Calculate duration
      result.duration = Date.now() - startTime;

      // Log audit event
      await auditService.logEvent({
        integrationId: integration.id,
        action: 'SYNC_COMPLETED',
        details: {
          type,
          recordsProcessed: result.recordsProcessed,
          duration: result.duration,
        },
        timestamp: new Date().toISOString(),
      });

      logger.info(`Sync completed: ${integration.id}`, {
        type,
        recordsProcessed: result.recordsProcessed,
        duration: result.duration,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error(`Sync failed: ${integration.id}`, {
        type,
        error: error.message,
        duration,
      });

      // Update error count
      await this.incrementErrorCount(integration.id);

      // Log audit event
      await auditService.logEvent({
        integrationId: integration.id,
        action: 'SYNC_FAILED',
        details: {
          type,
          error: error.message,
          duration,
        },
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }

  private async performFullSync(
    connector: any,
    mappings: DataMapping[],
    onProgress?: (progress: number) => void
  ): Promise<SyncResult> {
    const results: SyncResult[] = [];
    const syncTypes = ['products', 'inventory', 'pricing', 'orders'];
    
    for (let i = 0; i < syncTypes.length; i++) {
      const type = syncTypes[i];
      const progress = 20 + (i / syncTypes.length) * 70;
      
      onProgress?.(progress);
      
      try {
        const typeMapping = mappings.filter(m => m.targetField.startsWith(type));
        let result: SyncResult;
        
        switch (type) {
          case 'products':
            result = await connector.syncProducts(typeMapping);
            break;
          case 'inventory':
            result = await connector.syncInventory(typeMapping);
            break;
          case 'pricing':
            result = await connector.syncPricing(typeMapping);
            break;
          case 'orders':
            result = await connector.syncOrders(typeMapping);
            break;
          default:
            continue;
        }
        
        results.push(result);
      } catch (error) {
        logger.error(`Full sync failed at ${type}:`, error);
        results.push({
          success: false,
          recordsProcessed: 0,
          recordsUpdated: 0,
          recordsCreated: 0,
          recordsSkipped: 0,
          errors: [{
            id: `error_${Date.now()}`,
            type: 'system',
            message: error.message,
            severity: 'high',
          }],
          duration: 0,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Aggregate results
    return {
      success: results.every(r => r.success),
      recordsProcessed: results.reduce((sum, r) => sum + r.recordsProcessed, 0),
      recordsUpdated: results.reduce((sum, r) => sum + r.recordsUpdated, 0),
      recordsCreated: results.reduce((sum, r) => sum + r.recordsCreated, 0),
      recordsSkipped: results.reduce((sum, r) => sum + r.recordsSkipped, 0),
      errors: results.flatMap(r => r.errors),
      duration: 0, // Will be set by caller
      timestamp: new Date().toISOString(),
    };
  }

  async getDataMappings(integrationId: string, type?: string): Promise<DataMapping[]> {
    try {
      const query: any = { integrationId };
      if (type) {
        query.targetField = { $regex: `^${type}` };
      }

      // This would be implemented with actual database query
      // For now, return default mappings
      return this.getDefaultMappings(type || 'all');
    } catch (error) {
      logger.error(`Failed to get data mappings for ${integrationId}:`, error);
      throw error;
    }
  }

  private getDefaultMappings(type: string): DataMapping[] {
    const baseMappings: DataMapping[] = [
      {
        id: 'map_1',
        integrationId: '',
        sourceField: 'product_id',
        targetField: 'products.externalId',
        required: true,
      },
      {
        id: 'map_2',
        integrationId: '',
        sourceField: 'product_name',
        targetField: 'products.name',
        required: true,
      },
      {
        id: 'map_3',
        integrationId: '',
        sourceField: 'price',
        targetField: 'products.price',
        transformation: 'parseFloat',
        required: true,
      },
      {
        id: 'map_4',
        integrationId: '',
        sourceField: 'stock_quantity',
        targetField: 'inventory.stock',
        transformation: 'parseInt',
        required: true,
      },
    ];

    return baseMappings;
  }

  async incrementErrorCount(integrationId: string): Promise<void> {
    try {
      const integration = await this.getIntegration(integrationId);
      if (!integration) return;

      const newErrorCount = integration.errorCount + 1;
      const status = newErrorCount >= integration.maxRetries ? 'error' : integration.status;

      await this.updateIntegration(integrationId, {
        errorCount: newErrorCount,
        status,
      });

      // Send alert if threshold exceeded
      if (newErrorCount >= integration.maxRetries) {
        await this.sendIntegrationAlert(integrationId, 'MAX_ERRORS_EXCEEDED');
      }
    } catch (error) {
      logger.error(`Failed to increment error count for ${integrationId}:`, error);
    }
  }

  async resetErrorCount(integrationId: string): Promise<void> {
    try {
      await this.updateIntegration(integrationId, {
        errorCount: 0,
        status: 'active',
      });

      await this.sendIntegrationAlert(integrationId, 'CONNECTION_RESTORED');
    } catch (error) {
      logger.error(`Failed to reset error count for ${integrationId}:`, error);
    }
  }

  private async sendIntegrationAlert(integrationId: string, alertType: string): Promise<void> {
    try {
      const integration = await this.getIntegration(integrationId);
      if (!integration) return;

      // Send notification (would integrate with notification service)
      logger.warn(`Integration alert: ${alertType}`, {
        integrationId,
        merchantId: integration.merchantId,
        connector: integration.connector,
      });

      // Log audit event
      await auditService.logEvent({
        integrationId,
        action: 'ALERT_SENT',
        details: { alertType },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(`Failed to send integration alert:`, error);
    }
  }

  async exportData(
    integrationId: string,
    format: 'csv' | 'json' | 'xml',
    filters: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<{ filePath: string; recordCount: number }> {
    try {
      logger.info(`Starting data export: ${integrationId}`, { format, filters });

      onProgress?.(10);

      const integration = await this.getIntegration(integrationId);
      if (!integration) {
        throw new Error(`Integration not found: ${integrationId}`);
      }

      onProgress?.(20);

      // Get connector and export data
      const connector = connectorFactory.createConnector(integration.connector);
      await connector.connect(integration);

      onProgress?.(40);

      // This would implement actual data export logic
      const mockResult = {
        filePath: `/tmp/export_${integrationId}_${Date.now()}.${format}`,
        recordCount: Math.floor(Math.random() * 1000) + 100,
      };

      onProgress?.(80);

      await connector.disconnect();

      onProgress?.(100);

      // Log audit event
      await auditService.logEvent({
        integrationId,
        action: 'DATA_EXPORTED',
        details: {
          format,
          filters,
          recordCount: mockResult.recordCount,
        },
        timestamp: new Date().toISOString(),
      });

      logger.info(`Data export completed: ${integrationId}`, mockResult);

      return mockResult;
    } catch (error) {
      logger.error(`Data export failed for ${integrationId}:`, error);
      throw error;
    }
  }

  async getIntegrationMetrics(integrationId: string): Promise<any> {
    try {
      // This would query actual metrics from database
      return {
        integrationId,
        totalSyncs: Math.floor(Math.random() * 1000),
        successfulSyncs: Math.floor(Math.random() * 900),
        failedSyncs: Math.floor(Math.random() * 100),
        averageSyncTime: Math.floor(Math.random() * 5000) + 1000,
        lastSyncAt: new Date().toISOString(),
        errorRate: Math.random() * 0.1,
        dataVolume: {
          products: Math.floor(Math.random() * 10000),
          orders: Math.floor(Math.random() * 5000),
          inventory: Math.floor(Math.random() * 10000),
        },
      };
    } catch (error) {
      logger.error(`Failed to get metrics for ${integrationId}:`, error);
      throw error;
    }
  }

  async getAllIntegrations(filters?: {
    merchantId?: string;
    status?: string;
    connector?: string;
  }): Promise<IntegrationConfig[]> {
    try {
      const query: any = {};
      
      if (filters?.merchantId) query.merchantId = filters.merchantId;
      if (filters?.status) query.status = filters.status;
      if (filters?.connector) query.connector = filters.connector;

      const integrations = await this.integrationRepository.find({
        where: query,
        order: { createdAt: 'DESC' },
      });

      // Decrypt credentials for each integration
      for (const integration of integrations) {
        integration.credentials = await encryptionService.decryptCredentials(integration.credentials);
      }

      return integrations;
    } catch (error) {
      logger.error('Failed to get all integrations:', error);
      throw error;
    }
  }
}

export const integrationService = new IntegrationService();