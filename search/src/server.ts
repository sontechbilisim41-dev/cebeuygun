import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from '@/config';
import { fastifyLogger, logger } from '@/utils/logger';
import elasticsearchPlugin from '@/plugins/elasticsearch';
import kafkaPlugin from '@/plugins/kafka';
import { searchRoutes } from '@/routes/search';
import { healthRoutes } from '@/routes/health';

const fastify = Fastify({
  logger: fastifyLogger,
  trustProxy: true,
});

async function buildApp() {
  // Register security plugins
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  await fastify.register(cors, {
    origin: config.cors.origins,
    credentials: true,
  });

  await fastify.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
    errorResponseBuilder: () => ({
      error: 'Rate limit exceeded',
      message: 'Too many requests, please try again later',
    }),
  });

  // Register custom plugins
  await fastify.register(elasticsearchPlugin);
  await fastify.register(kafkaPlugin);

  // Register routes
  await fastify.register(healthRoutes);
  await fastify.register(searchRoutes, { prefix: '/api/v1' });

  // Global error handler
  fastify.setErrorHandler((error, request, reply) => {
    logger.error('Unhandled error:', {
      error: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
    });

    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 
      ? 'Internal Server Error' 
      : error.message;

    return reply.status(statusCode).send({
      success: false,
      error: 'Server Error',
      message,
    });
  });

  return fastify;
}

export async function start() {
  try {
    const app = await buildApp();
    
    await app.listen({
      port: config.port,
      host: '0.0.0.0',
    });

    logger.info(`🔍 Search service running on port ${config.port}`);
    logger.info(`📊 Performance target: ${config.performance.targetP95}ms p95`);
    logger.info(`🔍 Elasticsearch: ${config.elasticsearch.node}`);
    logger.info(`📨 Kafka brokers: ${config.kafka.brokers.join(', ')}`);
  } catch (err) {
    logger.error('Error starting server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

export { buildApp };