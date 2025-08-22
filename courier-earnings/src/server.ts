import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from '@/config';
import { fastifyLogger, logger } from '@/utils/logger';
import { earningsRoutes } from '@/routes/earnings';
import { healthRoutes } from '@/routes/health';
import { DatabaseService } from '@/config/database';
import { EarningsCalculator } from '@/services/earnings-calculator';
import { KafkaService } from '@/services/kafka';
import cron from 'node-cron';

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

  // Register routes
  await fastify.register(healthRoutes);
  await fastify.register(earningsRoutes, { prefix: '/api/v1' });

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
    
    // Initialize services
    const database = new DatabaseService();
    await database.initialize();
    
    const earningsCalculator = new EarningsCalculator(database);
    const kafkaService = new KafkaService(earningsCalculator);
    await kafkaService.initialize();
    
    // Schedule weekly payout generation (Mondays at 6 AM)
    cron.schedule('0 6 * * 1', async () => {
      try {
        logger.info('Starting scheduled weekly payout generation');
        
        const payoutGenerator = new (await import('@/services/payout-generator')).PayoutGenerator(database);
        const payouts = await payoutGenerator.generateBulkPayouts(new Date());
        
        logger.info('Scheduled payout generation completed', {
          generatedPayouts: payouts.length,
        });
      } catch (error) {
        logger.error('Scheduled payout generation failed:', error);
      }
    }, {
      timezone: config.reports.timezone,
    });
    
    await app.listen({
      port: config.port,
      host: '0.0.0.0',
    });

    logger.info(`💰 Courier Earnings service running on port ${config.port}`);
    logger.info(`📊 Tariff engine: Active with multi-dimensional rates`);
    logger.info(`📄 Report generation: PDF/CSV with Turkish localization`);
    logger.info(`⏰ Scheduled payouts: Mondays at 6 AM (${config.reports.timezone})`);
    logger.info(`📨 Kafka topics: ${Object.values(config.kafka.topics).join(', ')}`);
  } catch (err) {
    logger.error('Error starting server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

export { buildApp };