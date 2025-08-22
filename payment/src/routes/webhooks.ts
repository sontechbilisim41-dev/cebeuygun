import { FastifyPluginAsync } from 'fastify';
import { PaymentService } from '@/services/payment';
import { logger, securityLogger } from '@/utils/logger';

const webhooksRoutes: FastifyPluginAsync = async (fastify) => {
  const paymentService = new PaymentService();
  await paymentService.initialize();

  // Stripe webhook endpoint
  fastify.post('/stripe', {
    config: {
      rawBody: true, // Need raw body for signature verification
    },
  }, async (request, reply) => {
    try {
      const signature = request.headers['stripe-signature'] as string;
      const payload = request.body as string;

      if (!signature) {
        securityLogger.warn('Stripe webhook received without signature');
        return reply.status(400).send({
          success: false,
          message: 'Missing stripe-signature header',
        });
      }

      logger.info('Stripe webhook received', {
        signature: signature.substring(0, 20) + '...',
        payloadLength: payload.length,
      });

      await paymentService.handleWebhook('stripe', payload, signature);

      return reply.send({
        success: true,
        message: 'Webhook processed successfully',
      });
    } catch (error) {
      logger.error('Stripe webhook processing failed:', error);
      securityLogger.error('Stripe webhook processing failed', {
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      
      return reply.status(400).send({
        success: false,
        message: 'Webhook processing failed',
        error: error.message,
      });
    }
  });

  // iyzico webhook endpoint
  fastify.post('/iyzico', {
    config: {
      rawBody: true,
    },
  }, async (request, reply) => {
    try {
      const signature = request.headers['x-iyzico-signature'] as string;
      const payload = request.body as string;

      if (!signature) {
        securityLogger.warn('iyzico webhook received without signature');
        return reply.status(400).send({
          success: false,
          message: 'Missing x-iyzico-signature header',
        });
      }

      logger.info('iyzico webhook received', {
        signature: signature.substring(0, 20) + '...',
        payloadLength: payload.length,
      });

      await paymentService.handleWebhook('iyzico', payload, signature);

      return reply.send({
        success: true,
        message: 'Webhook processed successfully',
      });
    } catch (error) {
      logger.error('iyzico webhook processing failed:', error);
      securityLogger.error('iyzico webhook processing failed', {
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      
      return reply.status(400).send({
        success: false,
        message: 'Webhook processing failed',
        error: error.message,
      });
    }
  });

  // Generic webhook health check
  fastify.get('/health', async (request, reply) => {
    return reply.send({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      webhooks: {
        stripe: '/webhooks/stripe',
        iyzico: '/webhooks/iyzico',
      },
    });
  });

  // Cleanup on close
  fastify.addHook('onClose', async () => {
    await paymentService.disconnect();
  });
};

export { webhooksRoutes };