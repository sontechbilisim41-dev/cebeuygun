import { FastifyPluginAsync } from 'fastify';
import { ElasticsearchService } from '@/services/elasticsearch';
import { KafkaService } from '@/services/kafka';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  const elasticsearchService = fastify.elasticsearch as ElasticsearchService;
  const kafkaService = fastify.kafka as KafkaService;

  fastify.get('/health', async (request, reply) => {
    const startTime = Date.now();

    try {
      // Check Elasticsearch health
      const esHealth = await elasticsearchService.healthCheck();
      
      // Check Kafka health
      const kafkaHealth = await kafkaService.healthCheck();

      const responseTime = Date.now() - startTime;
      const isHealthy = esHealth.status !== 'red' && kafkaHealth.status === 'healthy';

      const response = {
        status: isHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        response_time_ms: responseTime,
        services: {
          elasticsearch: {
            status: esHealth.status,
            cluster_name: esHealth.cluster_name,
            version: esHealth.version,
          },
          kafka: {
            status: kafkaHealth.status,
            topics: kafkaHealth.topics,
          },
        },
        performance: {
          target_p95_ms: 50,
          current_response_time_ms: responseTime,
          target_met: responseTime <= 50,
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
      const esHealth = await elasticsearchService.healthCheck();
      const isReady = esHealth.status !== 'red';

      if (isReady) {
        return reply.send({ 
          status: 'ready',
          elasticsearch: esHealth.status,
        });
      } else {
        return reply.status(503).send({ 
          status: 'not ready',
          elasticsearch: esHealth.status,
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

  // Performance metrics endpoint
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
      performance: {
        target_p95_ms: 50,
        slow_query_threshold_ms: 100,
      },
    });
  });
};

export { healthRoutes };