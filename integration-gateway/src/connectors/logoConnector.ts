import axios, { AxiosInstance } from 'axios';
import { AbstractBaseConnector } from './baseConnector';
import { DataMapping, SyncResult, WebhookEvent, WebhookConfig } from '@/types';
import { logger } from '@/utils/logger';

export class LogoConnector extends AbstractBaseConnector {
  id = 'logo';
  name = 'Logo ERP Connector';
  version = '1.0.0';
  supportedOperations = ['syncProducts', 'syncInventory', 'syncPricing', 'syncOrders', 'webhook'];

  private apiClient: AxiosInstance | null = null;
  private sessionToken: string | null = null;

  protected async establishConnection(): Promise<boolean> {
    try {
      if (!this.config) {
        throw new Error('Configuration not provided');
      }

      const { endpoint, username, password } = this.config.credentials;
      
      if (!endpoint || !username || !password) {
        throw new Error('Logo ERP credentials incomplete');
      }

      // Initialize API client
      this.apiClient = axios.create({
        baseURL: endpoint,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Integration-Gateway-Logo/1.0',
        },
      });

      // Authenticate with Logo ERP
      const authResponse = await this.apiClient.post('/auth/login', {
        username,
        password,
        clientId: 'integration-gateway',
      });

      this.sessionToken = authResponse.data.sessionToken;
      
      // Set authorization header for future requests
      this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${this.sessionToken}`;

      logger.info('Logo ERP connection established');
      return true;
    } catch (error) {
      logger.error('Logo ERP connection failed:', error);
      return false;
    }
  }

  protected async closeConnection(): Promise<void> {
    try {
      if (this.apiClient && this.sessionToken) {
        await this.apiClient.post('/auth/logout', {
          sessionToken: this.sessionToken,
        });
      }
      
      this.apiClient = null;
      this.sessionToken = null;
      
      logger.info('Logo ERP connection closed');
    } catch (error) {
      logger.error('Logo ERP disconnection failed:', error);
    }
  }

  protected async performConnectionTest(): Promise<boolean> {
    try {
      if (!this.apiClient) {
        return false;
      }

      const response = await this.apiClient.get('/system/health');
      return response.status === 200;
    } catch (error) {
      logger.error('Logo ERP connection test failed:', error);
      return false;
    }
  }

  async syncProducts(mapping: DataMapping[]): Promise<SyncResult> {
    try {
      logger.info('Starting Logo ERP products sync');

      if (!this.apiClient) {
        throw new Error('Not connected to Logo ERP');
      }

      // Get products from Logo ERP
      const response = await this.apiClient.get('/products', {
        params: {
          limit: 1000,
          includeInactive: false,
          lastModified: this.getLastSyncTimestamp(),
        },
      });

      const products = response.data.products || [];
      
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
            recordId: rawProduct.ITEM_CODE,
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
      logger.error('Logo ERP products sync failed:', error);
      throw error;
    }
  }

  async syncInventory(mapping: DataMapping[]): Promise<SyncResult> {
    try {
      logger.info('Starting Logo ERP inventory sync');

      if (!this.apiClient) {
        throw new Error('Not connected to Logo ERP');
      }

      const response = await this.apiClient.get('/inventory/stock', {
        params: {
          warehouse: this.config?.settings.warehouseCode || 'MAIN',
          lastModified: this.getLastSyncTimestamp(),
        },
      });

      const inventoryData = response.data.stockLevels || [];
      
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
            recordId: rawInventory.ITEM_CODE,
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
      logger.error('Logo ERP inventory sync failed:', error);
      throw error;
    }
  }

  async syncPricing(mapping: DataMapping[]): Promise<SyncResult> {
    try {
      logger.info('Starting Logo ERP pricing sync');

      if (!this.apiClient) {
        throw new Error('Not connected to Logo ERP');
      }

      const response = await this.apiClient.get('/pricing/current', {
        params: {
          priceList: this.config?.settings.priceListCode || 'RETAIL',
          currency: 'TRY',
          lastModified: this.getLastSyncTimestamp(),
        },
      });

      const pricingData = response.data.prices || [];
      
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
            recordId: rawPrice.ITEM_CODE,
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
      logger.error('Logo ERP pricing sync failed:', error);
      throw error;
    }
  }

  async syncOrders(mapping: DataMapping[]): Promise<SyncResult> {
    try {
      logger.info('Starting Logo ERP orders sync');

      if (!this.apiClient) {
        throw new Error('Not connected to Logo ERP');
      }

      // Get orders from platform to sync to Logo ERP
      const platformOrders = await this.getPlatformOrders();
      
      let processed = 0;
      let created = 0;
      let updated = 0;
      let skipped = 0;
      const errors: any[] = [];

      for (const platformOrder of platformOrders) {
        try {
          const mappedOrder = this.mapData(platformOrder, mapping);
          
          // Send order to Logo ERP
          const response = await this.apiClient.post('/orders', {
            orderData: mappedOrder,
            source: 'platform',
          });

          if (response.data.success) {
            // Update platform order with Logo ERP order ID
            await this.updatePlatformOrder(platformOrder.id, {
              externalOrderId: response.data.logoOrderId,
              syncedAt: new Date().toISOString(),
            });
            created++;
          } else {
            throw new Error(response.data.error || 'Order creation failed');
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
      logger.error('Logo ERP orders sync failed:', error);
      throw error;
    }
  }

  // Webhook support
  async setupWebhook(config: WebhookConfig): Promise<boolean> {
    try {
      if (!this.apiClient) {
        throw new Error('Not connected to Logo ERP');
      }

      const response = await this.apiClient.post('/webhooks/register', {
        url: config.url,
        events: config.events,
        secret: config.secret,
        retryPolicy: config.retryPolicy,
      });

      return response.data.success;
    } catch (error) {
      logger.error('Logo ERP webhook setup failed:', error);
      return false;
    }
  }

  async processWebhookEvent(event: WebhookEvent): Promise<SyncResult> {
    try {
      logger.info(`Processing Logo ERP webhook: ${event.eventType}`);

      const { eventType, payload } = event;
      
      switch (eventType) {
        case 'product.updated':
          return await this.processProductUpdate(payload);
        case 'inventory.changed':
          return await this.processInventoryUpdate(payload);
        case 'price.changed':
          return await this.processPriceUpdate(payload);
        case 'order.status.changed':
          return await this.processOrderStatusUpdate(payload);
        default:
          logger.warn(`Unsupported Logo ERP webhook event: ${eventType}`);
          return this.createSyncResult(true, 0, 0, 0, 1);
      }
    } catch (error) {
      logger.error('Logo ERP webhook processing failed:', error);
      throw error;
    }
  }

  // Webhook event processors
  private async processProductUpdate(payload: any): Promise<SyncResult> {
    try {
      // Process single product update
      const mappedProduct = this.mapLogoProductData(payload);
      await this.updateProduct(mappedProduct);
      
      return this.createSyncResult(true, 1, 1, 0, 0);
    } catch (error) {
      return this.createSyncResult(false, 1, 0, 0, 1, [{
        id: `error_${Date.now()}`,
        type: 'business',
        message: error.message,
        severity: 'medium',
      }]);
    }
  }

  private async processInventoryUpdate(payload: any): Promise<SyncResult> {
    try {
      const mappedInventory = this.mapLogoInventoryData(payload);
      await this.updateInventory(mappedInventory);
      
      return this.createSyncResult(true, 1, 1, 0, 0);
    } catch (error) {
      return this.createSyncResult(false, 1, 0, 0, 1, [{
        id: `error_${Date.now()}`,
        type: 'business',
        message: error.message,
        severity: 'medium',
      }]);
    }
  }

  private async processPriceUpdate(payload: any): Promise<SyncResult> {
    try {
      const mappedPrice = this.mapLogoPriceData(payload);
      await this.updatePricing(mappedPrice);
      
      return this.createSyncResult(true, 1, 1, 0, 0);
    } catch (error) {
      return this.createSyncResult(false, 1, 0, 0, 1, [{
        id: `error_${Date.now()}`,
        type: 'business',
        message: error.message,
        severity: 'medium',
      }]);
    }
  }

  private async processOrderStatusUpdate(payload: any): Promise<SyncResult> {
    try {
      // Update platform order status based on Logo ERP status
      await this.updatePlatformOrderStatus(payload.platformOrderId, payload.status);
      
      return this.createSyncResult(true, 1, 1, 0, 0);
    } catch (error) {
      return this.createSyncResult(false, 1, 0, 0, 1, [{
        id: `error_${Date.now()}`,
        type: 'business',
        message: error.message,
        severity: 'high',
      }]);
    }
  }

  // Logo-specific data mapping
  private mapLogoProductData(logoData: any): any {
    return {
      externalId: logoData.ITEM_CODE,
      sku: logoData.ITEM_CODE,
      name: logoData.ITEM_NAME,
      description: logoData.ITEM_DESC,
      price: parseFloat(logoData.UNIT_PRICE || '0'),
      currency: logoData.CURRENCY || 'TRY',
      stock: parseInt(logoData.ON_HAND || '0', 10),
      isActive: logoData.ACTIVE === 'Y',
      lastModified: logoData.LAST_MODIFIED || new Date().toISOString(),
    };
  }

  private mapLogoInventoryData(logoData: any): any {
    return {
      sku: logoData.ITEM_CODE,
      stock: parseInt(logoData.ON_HAND || '0', 10),
      reservedStock: parseInt(logoData.RESERVED || '0', 10),
      availableStock: parseInt(logoData.AVAILABLE || '0', 10),
      lastUpdated: logoData.LAST_UPDATED || new Date().toISOString(),
      location: logoData.WAREHOUSE_CODE,
    };
  }

  private mapLogoPriceData(logoData: any): any {
    return {
      sku: logoData.ITEM_CODE,
      price: parseFloat(logoData.UNIT_PRICE || '0'),
      currency: logoData.CURRENCY || 'TRY',
      effectiveFrom: logoData.EFFECTIVE_FROM || new Date().toISOString(),
      effectiveTo: logoData.EFFECTIVE_TO,
      priceType: logoData.PRICE_TYPE || 'regular',
    };
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

  private async updatePlatformOrderStatus(orderId: string, status: string): Promise<void> {
    // Mock implementation - would update platform order status
    logger.debug(`Updating platform order status: ${orderId} -> ${status}`);
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