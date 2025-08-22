import { FastifyPluginAsync } from 'fastify';
import { DatabaseService } from '@/config/database';
import { KafkaConsumerService } from '@/services/kafka-consumer';
import { ChannelManager } from '@/services/channel-manager';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  const database = fastify.database as DatabaseService;
  const kafkaConsumer = fastify.kafkaConsumer as KafkaConsumerService;
  const channelManager = fastify.channelManager as ChannelManager;

  fastify.get('/health', async (request, reply) => {
    const startTime = Date.now();

    try {
      // Check database health
      const dbHealth = await database.healthCheck();
      
      // Check Kafka health
      const kafkaHealth = await kafkaConsumer.healthCheck();
      
      // Check channel health
      const channelHealth = channelManager.getChannelHealth();

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
          channels: channelHealth,
        },
        features: {
          multi_channel: 'active',
          templating: 'active',
          rate_limiting: 'active',
          quiet_hours: 'active',
          retry_mechanism: 'active',
        },
        performance: {
          target_queue_time_ms: 200,
          current_response_time_ms: responseTime,
          target_met: responseTime <= 200,
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
      const kafkaHealth = await kafkaConsumer.healthCheck();
      
      const isReady = dbHealth.status === 'healthy' && kafkaHealth.status === 'healthy';

      if (isReady) {
        return reply.send({ 
          status: 'ready',
          database: dbHealth.status,
          kafka: kafkaHealth.status,
        });
      } else {
        return reply.status(503).send({ 
          status: 'not ready',
          database: dbHealth.status,
          kafka: kafkaHealth.status,
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
      notifications: {
        target_queue_time_ms: 200,
        retry_max_attempts: 3,
        quiet_hours_enabled: true,
        channels_enabled: ['push', 'sms', 'email'],
      },
    });
  });
};

export { healthRoutes };