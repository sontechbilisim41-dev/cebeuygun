import { FastifyPluginAsync } from 'fastify';
import { KafkaService } from '@/services/kafka';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  const kafkaService = new KafkaService();

  fastify.get('/health', async (request, reply) => {
    const startTime = Date.now();

    try {
      // Check Kafka health
      const kafkaHealth = await kafkaService.healthCheck();

      const responseTime = Date.now() - startTime;
      const isHealthy = kafkaHealth.status === 'healthy';

      const response = {
        status: isHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        response_time_ms: responseTime,
        services: {
          kafka: {
            status: kafkaHealth.status,
            topics: kafkaHealth.topics,
          },
          payment_providers: {
            stripe: 'configured',
            iyzico: 'configured',
            mock: 'available',
          },
        },
        security: {
          pci_compliance: 'tokenization_enabled',
          fraud_detection: 'active',
          encryption: 'aes_256_gcm',
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
      const kafkaHealth = await kafkaService.healthCheck();
      const isReady = kafkaHealth.status === 'healthy';

      if (isReady) {
        return reply.send({ 
          status: 'ready',
          kafka: kafkaHealth.status,
        });
      } else {
        return reply.status(503).send({ 
          status: 'not ready',
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

  // Liveness probe
  fastify.get('/live', async (request, reply) => {
    return reply.send({ 
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });
};

export { healthRoutes };