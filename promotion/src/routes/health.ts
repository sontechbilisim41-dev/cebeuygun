import { FastifyPluginAsync } from 'fastify';
import { DatabaseService } from '@/services/database';
import { CacheService } from '@/services/cache';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  const database = new DatabaseService();
  const cache = new CacheService();

  fastify.get('/health', async (request, reply) => {
    const startTime = Date.now();

    try {
      // Check database health
      const dbHealth = await database.healthCheck();
      
      // Check cache health
      const cacheHealth = await cache.healthCheck();

      const responseTime = Date.now() - startTime;
      const isHealthy = dbHealth.status === 'healthy' && cacheHealth.status === 'healthy';

      const response = {
        status: isHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        response_time_ms: responseTime,
        services: {
          database: dbHealth,
          cache: cacheHealth,
        },
        features: {
          rule_engine: 'active',
          campaign_conflicts: 'resolved',
          coupon_pools: 'managed',
          audit_logging: 'enabled',
        },
      };

      const statusCode = isHealthy ? 200 : 503;
      return reply.status(statusCode).send(response);
    } catch (error) {
      return reply.status(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  });

  // Readiness probe
  fastify.get('/ready', async (request, reply) => {
    try {
      const dbHealth = await database.healthCheck();
      const isReady = dbHealth.status === 'healthy';

      if (isReady) {
        return reply.send({ 
          status: 'ready',
          database: dbHealth.status,
        });
      } else {
        return reply.status(503).send({ 
          status: 'not ready',
          database: dbHealth.status,
        });
      }
    } catch (error) {
      return reply.status(503).send({ 
        status: 'not ready', 
        error: error.message 
      });
    }
  });

  // Performance metrics
  fastify.get('/metrics', async (request, reply) => {
    const memUsage = process.memoryUsage();
    
    return reply.send({
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
      },
      campaigns: {
        max_concurrent: 10,
        conflict_resolution: 'priority_based',
        audit_retention_days: 90,
      },
    });
  });
};

export { healthRoutes };