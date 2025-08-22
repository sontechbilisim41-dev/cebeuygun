import { BaseConnector, IntegrationConfig, DataMapping, SyncResult, WebhookEvent, WebhookConfig } from '@/types';
import { logger } from '@/utils/logger';

export abstract class AbstractBaseConnector implements BaseConnector {
  abstract id: string;
  abstract name: string;
  abstract version: string;
  abstract supportedOperations: string[];

  protected config: IntegrationConfig | null = null;
  protected isConnected = false;

  async connect(config: IntegrationConfig): Promise<boolean> {
    try {
      this.config = config;
      const success = await this.establishConnection();
      this.isConnected = success;
      
      if (success) {
        logger.info(`Connector connected: ${this.id}`, {
          integrationId: config.id,
          merchantId: config.merchantId,
        });
      }
      
      return success;
    } catch (error) {
      logger.error(`Connector connection failed: ${this.id}`, {
        integrationId: config.id,
        error: error.message,
      });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.closeConnection();
        this.isConnected = false;
        this.config = null;
        
        logger.info(`Connector disconnected: ${this.id}`);
      }
    } catch (error) {
      logger.error(`Connector disconnection failed: ${this.id}`, {
        error: error.message,
      });
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        throw new Error('Connector not connected');
      }
      
      return await this.performConnectionTest();
    } catch (error) {
      logger.error(`Connection test failed: ${this.id}`, {
        error: error.message,
      });
      return false;
    }
  }

  // Abstract methods to be implemented by specific connectors
  protected abstract establishConnection(): Promise<boolean>;
  protected abstract closeConnection(): Promise<void>;
  protected abstract performConnectionTest(): Promise<boolean>;

  abstract syncProducts(mapping: DataMapping[]): Promise<SyncResult>;
  abstract syncInventory(mapping: DataMapping[]): Promise<SyncResult>;
  abstract syncPricing(mapping: DataMapping[]): Promise<SyncResult>;
  abstract syncOrders(mapping: DataMapping[]): Promise<SyncResult>;

  // Optional webhook support
  async setupWebhook?(config: WebhookConfig): Promise<boolean> {
    logger.warn(`Webhook setup not implemented for connector: ${this.id}`);
    return false;
  }

  async processWebhookEvent?(event: WebhookEvent): Promise<SyncResult> {
    logger.warn(`Webhook processing not implemented for connector: ${this.id}`);
    throw new Error('Webhook processing not supported');
  }

  // Utility methods
  protected validateMapping(mapping: DataMapping[], requiredFields: string[]): void {
    const mappedFields = mapping.map(m => m.targetField);
    const missingFields = requiredFields.filter(field => !mappedFields.includes(field));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required field mappings: ${missingFields.join(', ')}`);
    }
  }

  protected applyTransformation(value: any, transformation?: string): any {
    if (!transformation) return value;

    try {
      switch (transformation) {
        case 'parseInt':
          return parseInt(value, 10);
        case 'parseFloat':
          return parseFloat(value);
        case 'toString':
          return String(value);
        case 'toLowerCase':
          return String(value).toLowerCase();
        case 'toUpperCase':
          return String(value).toUpperCase();
        case 'trim':
          return String(value).trim();
        case 'boolean':
          return Boolean(value);
        default:
          // Custom transformation function
          return this.executeCustomTransformation(value, transformation);
      }
    } catch (error) {
      logger.warn(`Transformation failed: ${transformation}`, {
        value,
        error: error.message,
      });
      return value;
    }
  }

  private executeCustomTransformation(value: any, transformation: string): any {
    try {
      // Safe evaluation of simple transformations
      // In production, this should be more restricted
      const func = new Function('value', `return ${transformation}`);
      return func(value);
    } catch (error) {
      logger.error(`Custom transformation failed: ${transformation}`, error);
      return value;
    }
  }

  protected mapData(sourceData: any, mappings: DataMapping[]): any {
    const mappedData: any = {};

    for (const mapping of mappings) {
      try {
        let value = this.getNestedValue(sourceData, mapping.sourceField);
        
        // Apply default value if source value is null/undefined
        if (value == null && mapping.defaultValue !== undefined) {
          value = mapping.defaultValue;
        }

        // Apply transformation
        if (mapping.transformation) {
          value = this.applyTransformation(value, mapping.transformation);
        }

        // Validate required fields
        if (mapping.required && value == null) {
          throw new Error(`Required field missing: ${mapping.sourceField}`);
        }

        // Set mapped value
        this.setNestedValue(mappedData, mapping.targetField, value);
      } catch (error) {
        logger.error(`Data mapping failed for field: ${mapping.sourceField}`, {
          error: error.message,
          mapping,
        });
        
        if (mapping.required) {
          throw error;
        }
      }
    }

    return mappedData;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    
    target[lastKey] = value;
  }

  protected createSyncResult(
    success: boolean,
    processed: number = 0,
    updated: number = 0,
    created: number = 0,
    skipped: number = 0,
    errors: any[] = []
  ): SyncResult {
    return {
      success,
      recordsProcessed: processed,
      recordsUpdated: updated,
      recordsCreated: created,
      recordsSkipped: skipped,
      errors,
      duration: 0, // Will be set by caller
      timestamp: new Date().toISOString(),
    };
  }
}

export { AbstractBaseConnector }