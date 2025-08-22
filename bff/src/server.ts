import dotenv from 'dotenv';

// Load environment variables first, before any other imports
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import websocket from '@fastify/websocket';
import { config } from '@/config/index';
import { fastifyLogger, logger } from '@/utils/logger';
import authPlugin from '@/plugins/auth';
import serviceDiscoveryPlugin from '@/plugins/service-discovery';
import websocketPlugin from '@/plugins/websocket';
import { feedRoutes } from '@/routes/feed';
import { checkoutRoutes } from '@/routes/checkout';
import { orderRoutes } from '@/routes/orders';
import { healthRoutes } from '@/routes/health';
import { errorHandler } from '@/utils/error-handler';

const fastify = Fastify({
  logger: fastifyLogger,
  trustProxy: true,
});

async function buildApp() {
  // Register plugins
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  await fastify.register(cors, {
    origin: config.cors?.origins || [],
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

  await fastify.register(websocket);

  // Custom plugins
  await fastify.register(authPlugin);
  await fastify.register(serviceDiscoveryPlugin);
  await fastify.register(websocketPlugin);

  // Register routes
  await fastify.register(healthRoutes);
  await fastify.register(feedRoutes, { prefix: '/api' });
  await fastify.register(checkoutRoutes, { prefix: '/api' });
  await fastify.register(orderRoutes, { prefix: '/api' });

  // Error handler
  fastify.setErrorHandler(errorHandler);

  return fastify;
}

export async function start() {
  try {
    const app = await buildApp();
    
    await app.listen({
      port: config.port,
      host: '0.0.0.0',
    });

    logger.info(`🚀 BFF service running on port ${config.port}`);
  } catch (err) {
    logger.error('Error starting server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();

}

export { buildApp }