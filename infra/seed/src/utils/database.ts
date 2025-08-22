import { Pool, PoolClient } from 'pg';
import { SeedConfig } from '@/types';

export class DatabaseManager {
  private pool: Pool;

  constructor(config: SeedConfig['database']) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async insertBatch<T>(
    tableName: string,
    data: T[],
    batchSize: number = 1000
  ): Promise<void> {
    if (data.length === 0) return;

    const keys = Object.keys(data[0] as any);
    const columns = keys.join(', ');
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const values: any[] = [];
      const placeholders: string[] = [];
      
      batch.forEach((item, index) => {
        const itemPlaceholders = keys.map((_, keyIndex) => 
          `$${index * keys.length + keyIndex + 1}`
        );
        placeholders.push(`(${itemPlaceholders.join(', ')})`);
        
        keys.forEach(key => {
          values.push((item as any)[key]);
        });
      });

      const query = `
        INSERT INTO ${tableName} (${columns})
        VALUES ${placeholders.join(', ')}
        ON CONFLICT (id) DO NOTHING
      `;

      await this.query(query, values);
    }
  }

  async clearTable(tableName: string): Promise<void> {
    await this.query(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE`);
  }

  async clearAllSeedData(): Promise<void> {
    const tables = [
      'campaign_usage',
      'campaign_audit',
      'coupon_pools',
      'coupons',
      'campaigns',
      'product_media',
      'seller_products',
      'product_variants',
      'products',
      'categories',
      'courier_working_hours',
      'courier_service_areas',
      'assignment_history',
      'assignments',
      'courier_locations',
      'couriers',
      'password_reset_tokens',
      'refresh_tokens',
      'users'
    ];

    for (const table of tables) {
      try {
        await this.clearTable(table);
        console.log(`✓ Cleared table: ${table}`);
      } catch (error) {
        console.warn(`⚠ Could not clear table ${table}:`, error.message);
      }
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async getTableCounts(): Promise<Record<string, number>> {
    const tables = [
      'users', 'couriers', 'categories', 'products', 'product_media',
      'campaigns', 'coupons', 'courier_service_areas', 'courier_working_hours'
    ];

    const counts: Record<string, number> = {};

    for (const table of tables) {
      try {
        const result = await this.query(`SELECT COUNT(*) as count FROM ${table}`);
        counts[table] = parseInt(result.rows[0].count);
      } catch (error) {
        counts[table] = 0;
      }
    }

    return counts;
  }
}