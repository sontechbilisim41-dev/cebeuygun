import { Pool, PoolClient } from 'pg';
import { config } from './index';
import { logger } from '@/utils/logger';

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.username,
      password: config.database.password,
      ssl: config.database.ssl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async initialize(): Promise<void> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      logger.info('Database connection established');
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (duration > 1000) {
        logger.warn('Slow query detected', {
          query: text.substring(0, 100),
          duration,
          params: params?.length,
        });
      }
      
      return result;
    } catch (error) {
      logger.error('Database query failed:', {
        error: error.message,
        query: text.substring(0, 100),
        params: params?.length,
      });
      throw error;
    }
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }

  async healthCheck(): Promise<{ status: string; connections?: number }> {
    try {
      const result = await this.query('SELECT NOW(), COUNT(*) as connection_count FROM pg_stat_activity WHERE datname = $1', [config.database.database]);
      return {
        status: 'healthy',
        connections: parseInt(result.rows[0].connection_count),
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return { status: 'unhealthy' };
    }
  }
}