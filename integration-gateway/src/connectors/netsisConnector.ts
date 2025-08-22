import axios, { AxiosInstance } from 'axios';
import { AbstractBaseConnector } from './baseConnector';
import { DataMapping, SyncResult, WebhookEvent, WebhookConfig } from '@/types';
import { logger } from '@/utils/logger';

export class NetsisConnector extends AbstractBaseConnector {
  id = 'netsis';
  name = 'Netsis ERP Connector';
  version = '1.0.0';
  supportedOperations = ['syncProducts', 'syncInventory', 'syncPricing', 'syncOrders'];

  private apiClient: AxiosInstance | null = null;
  private authToken: string | null = null;

  protected async establishConnection(): Promise<boolean> {
    try {
      if (!this.config) {
        throw new Error('Configuration not provided');
      }

      const { endpoint, apiKey, username, password } = this.config.credentials;
      
      if (!endpoint || !apiKey) {
        throw new Error('Netsis ERP credentials incomplete');
      }

      // Initialize API client
      this.apiClient = axios.create({
        baseURL: endpoint,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
          'User-Agent': 'Integration-Gateway-Netsis/1.0',
        },
      });

      // Authenticate if username/password provided
      if (username && password) {
        const authResponse = await this.apiClient.post('/api/auth/token', {
          username,
          password,
          scope: 'integration',
        });

        this.authToken = authResponse.data.access_token;
        this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;
      }

      // Test connection
      const testResponse = await this.apiClient.get('/api/system/info');
      
      if (testResponse.status === 200) {
        logger.info('Netsis ERP connection established');
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Netsis ERP connection failed:', error);
      return false;
    }
  }

  protected async closeConnection(): Promise<void> {
    try {
      if (this.apiClient && this.authToken) {
        await this.apiClient.post('/api/auth/revoke', {
          token: this.authToken,
        });
      }
      
      this.apiClient = null;
      this.authToken = null;
      
      logger.info('Netsis ERP connection closed');
    } catch (error) {
      logger.error('Netsis ERP disconnection failed:', error);
    }
  }

  protected async performConnectionTest(): Promise<boolean> {
    try {
      if (!this.apiClient) {
        return false;
      }

      const response = await this.apiClient.get('/api/system/ping');
      return response.data.status === 'ok';
    } catch (error) {
      logger.error('Netsis ERP connection test failed:', error);
      return false;
    }
  }

  async syncProducts(mapping: DataMapping[]): Promise<SyncResult> {
    try {
      logger.info('Starting Netsis ERP products sync');

      if (!this.apiClient) {
        throw new Error('Not connected to Netsis ERP');
      }

      // Get products from Netsis ERP
      const response = await this.apiClient.get('/api/products', {
        params: {
          page: 1,
          limit: 1000,
          active: true,
          modifiedSince: this.getLastSyncTimestamp(),
        },
      });

      const products = response.data.data || [];
      
      let processed = 0;
      let created = 0;
      let updated = 0;
      let skipped = 0;
      const errors: any[] = [];

      for (const rawProduct of products) {
        try {
          const mappedProduct = this.mapData(rawProduct, mapping);
          
          // Validate and process product
          this.validateProductData(mappedProduct);
          
          const isNew = await this.isNewProduct(mappedProduct.externalId);
          
          if (isNew) {
            await this.createProduct(mappedProduct);
            created++;
          } else {
            await this.updateProduct(mappedProduct);
            updated++;
          }

          processed++;
        } catch (error) {
          errors.push({
            id: `error_${Date.now()}_${Math.random()}`,
            type: 'business',
            message: error.message,
            recordId: rawProduct.productCode,
            severity: 'medium',
          });
          skipped++;
        }
      }

      return this.createSyncResult(
        errors.length === 0,
        processed,
        updated,
        created,
        skipped,
        errors
      );
    } catch (error) {
      logger.error('Netsis ERP products sync failed:', error);
      throw error;
    }
  }

  async syncInventory(mapping: DataMapping[]): Promise<SyncResult> {
    try {
      logger.info('Starting Netsis ERP inventory sync');

      if (!this.apiClient) {
        throw new Error('Not connected to Netsis ERP');
      }

      const response = await this.apiClient.get('/api/inventory/stock', {
        params: {
          warehouse: this.config?.settings.warehouseId || '1',
          modifiedSince: this.getLastSyncTimestamp(),
        },
      });

      const inventoryData = response.data.data || [];
      
      let processed = 0;
      let updated = 0;
      let skipped = 0;
      const errors: any[] = [];

      for (const rawInventory of inventoryData) {
        try {
          const mappedInventory = this.mapData(rawInventory, mapping);
          
          this.validateInventoryData(mappedInventory);
          await this.updateInventory(mappedInventory);
          
          processed++;
          updated++;
        } catch (error) {
          errors.push({
            id: `error_${Date.now()}_${Math.random()}`,
            type: 'business',
            message: error.message,
            recordId: rawInventory.productCode,
            severity: 'medium',
          });
          skipped++;
        }
      }

      return this.createSyncResult(
        errors.length === 0,
        processed,
        updated,
        0,
        skipped,
        errors
      );
    } catch (error) {
      logger.error('Netsis ERP inventory sync failed:', error);
      throw error;
    }
  }

  async syncPricing(mapping: DataMapping[]): Promise<SyncResult> {
    try {
      logger.info('Starting Netsis ERP pricing sync');

      if (!this.apiClient) {
        throw new Error('Not connected to Netsis ERP');
      }

      const response = await this.apiClient.get('/api/pricing/list', {
        params: {
          priceListId: this.config?.settings.priceListId || '1',
          currency: 'TRY',
          modifiedSince: this.getLastSyncTimestamp(),
        },
      });

      const pricingData = response.data.data || [];
      
      let processed = 0;
      let updated = 0;
      let skipped = 0;
      const errors: any[] = [];

      for (const rawPrice of pricingData) {
        try {
          const mappedPrice = this.mapData(rawPrice, mapping);
          
          this.validatePricingData(mappedPrice);
          await this.updatePricing(mappedPrice);
          
          processed++;
          updated++;
        } catch (error) {
          errors.push({
            id: `error_${Date.now()}_${Math.random()}`,
            type: 'business',
            message: error.message,
            recordId: rawPrice.productCode,
            severity: 'medium',
          });
          skipped++;
        }
      }

      return this.createSyncResult(
        errors.length === 0,
        processed,
        updated,
        0,
        skipped,
        errors
      );
    } catch (error) {
      logger.error('Netsis ERP pricing sync failed:', error);
      throw error;
    }
  }

  async syncOrders(mapping: DataMapping[]): Promise<SyncResult> {
    try {
      logger.info('Starting Netsis ERP orders sync');

      if (!this.apiClient) {
        throw new Error('Not connected to Netsis ERP');
      }

      // Get orders from platform to sync to Netsis ERP
      const platformOrders = await this.getPlatformOrders();
      
      let processed = 0;
      let created = 0;
      let updated = 0;
      let skipped = 0;
      const errors: any[] = [];

      for (const platformOrder of platformOrders) {
        try {
          const mappedOrder = this.mapData(platformOrder, mapping);
          
          // Send order to Netsis ERP
          const response = await this.apiClient.post('/api/orders/create', {
            order: mappedOrder,
            source: 'ecommerce',
          });

          if (response.data.success) {
            // Update platform order with Netsis order ID
            await this.updatePlatformOrder(platformOrder.id, {
              externalOrderId: response.data.orderId,
              syncedAt: new Date().toISOString(),
            });
            created++;
          } else {
            throw new Error(response.data.message || 'Order creation failed');
          }

          processed++;
        } catch (error) {
          errors.push({
            id: `error_${Date.now()}_${Math.random()}`,
            type: 'business',
            message: error.message,
            recordId: platformOrder.id,
            severity: 'high',
          });
          skipped++;
        }
      }

      return this.createSyncResult(
        errors.length === 0,
        processed,
        updated,
        created,
        skipped,
        errors
      );
    } catch (error) {
      logger.error('Netsis ERP orders sync failed:', error);
      throw error;
    }
  }

  // Utility methods
  private getLastSyncTimestamp(): string {
    return this.config?.lastSyncAt || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  }

  private async getPlatformOrders(): Promise<any[]> {
    // Mock implementation - would fetch from platform API
    return [];
  }

  private async updatePlatformOrder(orderId: string, updates: any): Promise<void> {
    // Mock implementation - would update platform order
    logger.debug(`Updating platform order: ${orderId}`, updates);
  }

  // Mock API integration methods
  private async isNewProduct(externalId: string): Promise<boolean> {
    return Math.random() > 0.7;
  }

  private async createProduct(product: any): Promise<void> {
    logger.debug(`Creating product: ${product.sku}`);
  }

  private async updateProduct(product: any): Promise<void> {
    logger.debug(`Updating product: ${product.sku}`);
  }

  private async updateInventory(inventory: any): Promise<void> {
    logger.debug(`Updating inventory: ${inventory.sku}`);
  }

  private async updatePricing(pricing: any): Promise<void> {
    logger.debug(`Updating pricing: ${pricing.sku}`);
  }

  private validateProductData(product: any): void {
    if (!product.externalId) throw new Error('Product external ID is required');
    if (!product.name) throw new Error('Product name is required');
    if (!product.sku) throw new Error('Product SKU is required');
    if (typeof product.price !== 'number' || product.price < 0) {
      throw new Error('Valid product price is required');
    }
  }

  private validateInventoryData(inventory: any): void {
    if (!inventory.sku) throw new Error('Inventory SKU is required');
    if (typeof inventory.stock !== 'number' || inventory.stock < 0) {
      throw new Error('Valid stock quantity is required');
    }
  }

  private validatePricingData(pricing: any): void {
    if (!pricing.sku) throw new Error('Pricing SKU is required');
    if (typeof pricing.price !== 'number' || pricing.price < 0) {
      throw new Error('Valid price is required');
    }
  }
}