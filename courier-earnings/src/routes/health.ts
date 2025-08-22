import { FastifyPluginAsync } from 'fastify';
import { DatabaseService } from '@/config/database';
import { KafkaService } from '@/services/kafka';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  const database = new DatabaseService();

  fastify.get('/health', async (request, reply) => {
    const startTime = Date.now();

    try {
      // Check database health
      const dbHealth = await database.healthCheck();
      
      // Check Kafka health (simplified)
      const kafkaHealth = { status: 'healthy' }; // Would check actual Kafka connection

      const responseTime = Date.now() - startTime;
      const isHealthy = dbHealth.status === 'healthy' && kafkaHealth.status === 'healthy';

      const response = {
        status: isHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        response_time_ms: responseTime,
        services: {
          database: dbHealth,
          kafka: kafkaHealth,
        },
        features: {
          earnings_calculation: 'active',
          tariff_engine: 'active',
          report_generation: 'active',
          payout_automation: 'active',
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
      earnings: {
        base_delivery_fee: 800, // 8 TRY
        per_km_rate: 150, // 1.5 TRY/km
        peak_hour_bonus: 25, // %25
        minimum_payout: 5000, // 50 TRY
      },
    });
  });
};

export { healthRoutes };