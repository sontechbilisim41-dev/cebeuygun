import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from '@/config';
import { fastifyLogger, logger } from '@/utils/logger';
import { DatabaseService } from '@/config/database';
import { TemplateEngine } from '@/services/template-engine';
import { ChannelManager } from '@/services/channel-manager';
import { QueueManager } from '@/services/queue-manager';
import { NotificationOrchestrator } from '@/services/notification-orchestrator';
import { KafkaConsumerService } from '@/services/kafka-consumer';
import { notificationsRoutes } from '@/routes/notifications';
import { healthRoutes } from '@/routes/health';
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

  // Initialize services
  const database = new DatabaseService();
  await database.initialize();
  
  const templateEngine = new TemplateEngine(database);
  const channelManager = new ChannelManager();
  const queueManager = new QueueManager(channelManager, database);
  const orchestrator = new NotificationOrchestrator(database, templateEngine, channelManager, queueManager);
  const kafkaConsumer = new KafkaConsumerService(orchestrator);
  
  // Start Kafka consumer
  await kafkaConsumer.initialize();

  // Decorate fastify with services
  fastify.decorate('database', database);
  fastify.decorate('templateEngine', templateEngine);
  fastify.decorate('channelManager', channelManager);
  fastify.decorate('queueManager', queueManager);
  fastify.decorate('notificationOrchestrator', orchestrator);
  fastify.decorate('kafkaConsumer', kafkaConsumer);

  // Register routes
  await fastify.register(healthRoutes);
  await fastify.register(notificationsRoutes, { prefix: '/api/v1/notifications' });

  // Schedule cleanup tasks
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('Starting scheduled cleanup tasks');
      
      // Cleanup old notification records
      await database.query(`
        DELETE FROM notification_deliveries 
        WHERE created_at < NOW() - INTERVAL '30 days' AND status IN ('delivered', 'failed')
      `);
      
      // Cleanup queue jobs
      await queueManager.cleanupJobs();
      
      // Cleanup rate limiters
      channelManager.cleanupRateLimiters();
      
      logger.info('Scheduled cleanup completed');
    } catch (error) {
      logger.error('Scheduled cleanup failed:', error);
    }
  });

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

  // Cleanup on close
  fastify.addHook('onClose', async () => {
    await kafkaConsumer.disconnect();
    await queueManager.disconnect();
    await database.disconnect();
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

    logger.info(`📢 Notification service running on port ${config.port}`);
    logger.info(`📱 Multi-channel support: Push, SMS, Email`);
    logger.info(`🎯 Performance target: ${config.performance.targetQueueTime}ms queue time`);
    logger.info(`🔄 Retry policy: ${config.retry.maxAttempts} attempts with exponential backoff`);
    logger.info(`🌙 Quiet hours: ${config.quietHours.enabled ? 'Enabled' : 'Disabled'}`);
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