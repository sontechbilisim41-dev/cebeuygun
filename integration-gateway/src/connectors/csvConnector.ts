import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import { AbstractBaseConnector } from './baseConnector';
import { DataMapping, SyncResult, ProductSync, InventoryUpdate, PriceUpdate, OrderSync } from '@/types';
import { logger } from '@/utils/logger';

export class CSVConnector extends AbstractBaseConnector {
  id = 'csv';
  name = 'Generic CSV Connector';
  version = '1.0.0';
  supportedOperations = ['syncProducts', 'syncInventory', 'syncPricing', 'syncOrders'];

  private inputDirectory: string = '';
  private outputDirectory: string = '';

  protected async establishConnection(): Promise<boolean> {
    try {
      if (!this.config) {
        throw new Error('Configuration not provided');
      }

      this.inputDirectory = this.config.settings.inputDirectory || '/tmp/csv/input';
      this.outputDirectory = this.config.settings.outputDirectory || '/tmp/csv/output';

      // Ensure directories exist
      await this.ensureDirectoryExists(this.inputDirectory);
      await this.ensureDirectoryExists(this.outputDirectory);

      return true;
    } catch (error) {
      logger.error('CSV connector connection failed:', error);
      return false;
    }
  }

  protected async closeConnection(): Promise<void> {
    // No persistent connection to close for CSV
  }

  protected async performConnectionTest(): Promise<boolean> {
    try {
      // Test read/write access to directories
      const testFile = path.join(this.outputDirectory, 'test.csv');
      await fs.promises.writeFile(testFile, 'test,data\n1,test');
      await fs.promises.unlink(testFile);
      
      return true;
    } catch (error) {
      logger.error('CSV connector test failed:', error);
      return false;
    }
  }

  async syncProducts(mapping: DataMapping[]): Promise<SyncResult> {
    try {
      logger.info('Starting CSV products sync');

      const inputFile = path.join(this.inputDirectory, 'products.csv');
      const products = await this.readCSVFile<ProductSync>(inputFile);

      let processed = 0;
      let created = 0;
      let updated = 0;
      let skipped = 0;
      const errors: any[] = [];

      for (const rawProduct of products) {
        try {
          const mappedProduct = this.mapData(rawProduct, mapping);
          
          // Validate required fields
          this.validateProductData(mappedProduct);

          // Process product (would integrate with platform API)
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
            type: 'validation',
            message: error.message,
            recordId: rawProduct.id || rawProduct.sku,
            severity: 'medium',
          });
          skipped++;
        }
      }

      // Write sync report
      await this.writeSyncReport('products', {
        processed,
        created,
        updated,
        skipped,
        errors: errors.length,
      });

      return this.createSyncResult(
        errors.length === 0,
        processed,
        updated,
        created,
        skipped,
        errors
      );
    } catch (error) {
      logger.error('CSV products sync failed:', error);
      throw error;
    }
  }

  async syncInventory(mapping: DataMapping[]): Promise<SyncResult> {
    try {
      logger.info('Starting CSV inventory sync');

      const inputFile = path.join(this.inputDirectory, 'inventory.csv');
      const inventoryData = await this.readCSVFile<InventoryUpdate>(inputFile);

      let processed = 0;
      let updated = 0;
      let skipped = 0;
      const errors: any[] = [];

      for (const rawInventory of inventoryData) {
        try {
          const mappedInventory = this.mapData(rawInventory, mapping);
          
          // Validate inventory data
          this.validateInventoryData(mappedInventory);

          // Update inventory (would integrate with platform API)
          await this.updateInventory(mappedInventory);
          
          processed++;
          updated++;
        } catch (error) {
          errors.push({
            id: `error_${Date.now()}_${Math.random()}`,
            type: 'validation',
            message: error.message,
            recordId: rawInventory.sku,
            severity: 'medium',
          });
          skipped++;
        }
      }

      await this.writeSyncReport('inventory', {
        processed,
        updated,
        skipped,
        errors: errors.length,
      });

      return this.createSyncResult(
        errors.length === 0,
        processed,
        updated,
        0,
        skipped,
        errors
      );
    } catch (error) {
      logger.error('CSV inventory sync failed:', error);
      throw error;
    }
  }

  async syncPricing(mapping: DataMapping[]): Promise<SyncResult> {
    try {
      logger.info('Starting CSV pricing sync');

      const inputFile = path.join(this.inputDirectory, 'pricing.csv');
      const pricingData = await this.readCSVFile<PriceUpdate>(inputFile);

      let processed = 0;
      let updated = 0;
      let skipped = 0;
      const errors: any[] = [];

      for (const rawPrice of pricingData) {
        try {
          const mappedPrice = this.mapData(rawPrice, mapping);
          
          // Validate pricing data
          this.validatePricingData(mappedPrice);

          // Update pricing (would integrate with platform API)
          await this.updatePricing(mappedPrice);
          
          processed++;
          updated++;
        } catch (error) {
          errors.push({
            id: `error_${Date.now()}_${Math.random()}`,
            type: 'validation',
            message: error.message,
            recordId: rawPrice.sku,
            severity: 'medium',
          });
          skipped++;
        }
      }

      await this.writeSyncReport('pricing', {
        processed,
        updated,
        skipped,
        errors: errors.length,
      });

      return this.createSyncResult(
        errors.length === 0,
        processed,
        updated,
        0,
        skipped,
        errors
      );
    } catch (error) {
      logger.error('CSV pricing sync failed:', error);
      throw error;
    }
  }

  async syncOrders(mapping: DataMapping[]): Promise<SyncResult> {
    try {
      logger.info('Starting CSV orders sync');

      const inputFile = path.join(this.inputDirectory, 'orders.csv');
      const ordersData = await this.readCSVFile<OrderSync>(inputFile);

      let processed = 0;
      let created = 0;
      let updated = 0;
      let skipped = 0;
      const errors: any[] = [];

      for (const rawOrder of ordersData) {
        try {
          const mappedOrder = this.mapData(rawOrder, mapping);
          
          // Validate order data
          this.validateOrderData(mappedOrder);

          // Process order (would integrate with platform API)
          const isNew = await this.isNewOrder(mappedOrder.externalOrderId);
          
          if (isNew) {
            await this.createOrder(mappedOrder);
            created++;
          } else {
            await this.updateOrder(mappedOrder);
            updated++;
          }

          processed++;
        } catch (error) {
          errors.push({
            id: `error_${Date.now()}_${Math.random()}`,
            type: 'validation',
            message: error.message,
            recordId: rawOrder.externalOrderId,
            severity: 'medium',
          });
          skipped++;
        }
      }

      await this.writeSyncReport('orders', {
        processed,
        created,
        updated,
        skipped,
        errors: errors.length,
      });

      return this.createSyncResult(
        errors.length === 0,
        processed,
        updated,
        created,
        skipped,
        errors
      );
    } catch (error) {
      logger.error('CSV orders sync failed:', error);
      throw error;
    }
  }

  // Utility methods
  private async readCSVFile<T>(filePath: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];
      
      if (!fs.existsSync(filePath)) {
        reject(new Error(`CSV file not found: ${filePath}`));
        return;
      }

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  private async writeSyncReport(type: string, stats: any): Promise<void> {
    try {
      const reportFile = path.join(
        this.outputDirectory,
        `${type}_sync_report_${Date.now()}.csv`
      );

      const writer = createObjectCsvWriter({
        path: reportFile,
        header: [
          { id: 'type', title: 'Sync Type' },
          { id: 'timestamp', title: 'Timestamp' },
          { id: 'processed', title: 'Processed' },
          { id: 'created', title: 'Created' },
          { id: 'updated', title: 'Updated' },
          { id: 'skipped', title: 'Skipped' },
          { id: 'errors', title: 'Errors' },
        ],
      });

      await writer.writeRecords([{
        type,
        timestamp: new Date().toISOString(),
        ...stats,
      }]);

      logger.info(`Sync report written: ${reportFile}`);
    } catch (error) {
      logger.error('Failed to write sync report:', error);
    }
  }

  private async ensureDirectoryExists(directory: string): Promise<void> {
    try {
      await fs.promises.access(directory);
    } catch {
      await fs.promises.mkdir(directory, { recursive: true });
    }
  }

  // Validation methods
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

  private validateOrderData(order: any): void {
    if (!order.externalOrderId) throw new Error('Order external ID is required');
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      throw new Error('Order items are required');
    }
    if (!order.customer || !order.customer.name) {
      throw new Error('Customer information is required');
    }
  }

  // Mock API integration methods (would be real API calls)
  private async isNewProduct(externalId: string): Promise<boolean> {
    // Mock implementation
    return Math.random() > 0.7;
  }

  private async createProduct(product: ProductSync): Promise<void> {
    // Mock implementation
    logger.debug(`Creating product: ${product.sku}`);
  }

  private async updateProduct(product: ProductSync): Promise<void> {
    // Mock implementation
    logger.debug(`Updating product: ${product.sku}`);
  }

  private async updateInventory(inventory: InventoryUpdate): Promise<void> {
    // Mock implementation
    logger.debug(`Updating inventory: ${inventory.sku}`);
  }

  private async updatePricing(pricing: PriceUpdate): Promise<void> {
    // Mock implementation
    logger.debug(`Updating pricing: ${pricing.sku}`);
  }

  private async isNewOrder(externalOrderId: string): Promise<boolean> {
    // Mock implementation
    return Math.random() > 0.5;
  }

  private async createOrder(order: OrderSync): Promise<void> {
    // Mock implementation
    logger.debug(`Creating order: ${order.externalOrderId}`);
  }

  private async updateOrder(order: OrderSync): Promise<void> {
    // Mock implementation
    logger.debug(`Updating order: ${order.externalOrderId}`);
  }
}