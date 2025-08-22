import { FastifyPluginAsync } from 'fastify';
import { 
  PaymentIntentRequestSchema, 
  PaymentIntentResponseSchema,
  PaymentConfirmRequestSchema,
  PaymentConfirmResponseSchema,
  RefundRequestSchema,
  RefundResponseSchema 
} from '@/types';
import { PaymentService } from '@/services/payment';
import { logger } from '@/utils/logger';

const paymentsRoutes: FastifyPluginAsync = async (fastify) => {
  const paymentService = new PaymentService();
  await paymentService.initialize();

  // Create payment intent
  fastify.post('/intent', {
    schema: {
      body: PaymentIntentRequestSchema,
      response: {
        200: PaymentIntentResponseSchema,
      },
    },
  }, async (request, reply) => {
    const startTime = Date.now();
    
    try {
      const intentRequest = PaymentIntentRequestSchema.parse(request.body);
      
      logger.info('Payment intent request received', {
        amount: intentRequest.amount,
        currency: intentRequest.currency,
        orderId: intentRequest.order_id,
        provider: intentRequest.provider,
      });

      const paymentIntent = await paymentService.createPaymentIntent(intentRequest);

      const response = {
        success: true,
        message: 'Payment intent created successfully',
        data: {
          payment_intent_id: paymentIntent.id,
          client_secret: paymentIntent.clientSecret,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          provider: paymentIntent.provider,
          created_at: paymentIntent.createdAt.toISOString(),
        },
      };

      logger.info('Payment intent created successfully', {
        paymentIntentId: paymentIntent.id,
        orderId: intentRequest.order_id,
        processingTime: Date.now() - startTime,
      });

      return reply.send(response);
    } catch (error) {
      logger.error('Payment intent creation failed:', error);
      
      return reply.status(400).send({
        success: false,
        message: 'Failed to create payment intent',
        error: error.message,
      });
    }
  });

  // Confirm payment
  fastify.post('/confirm', {
    schema: {
      body: PaymentConfirmRequestSchema,
      response: {
        200: PaymentConfirmResponseSchema,
      },
    },
  }, async (request, reply) => {
    const startTime = Date.now();
    
    try {
      const confirmRequest = PaymentConfirmRequestSchema.parse(request.body);
      
      logger.info('Payment confirmation request received', {
        paymentIntentId: confirmRequest.payment_intent_id,
        paymentMethodType: confirmRequest.payment_method.type,
        threeDSecure: confirmRequest.three_d_secure,
      });

      const payment = await paymentService.confirmPayment(confirmRequest);

      const response = {
        success: true,
        message: payment.status === 'succeeded' 
          ? 'Payment processed successfully' 
          : payment.status === 'requires_action'
          ? 'Payment requires additional authentication'
          : 'Payment processing failed',
        data: {
          payment_id: payment.id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          provider: payment.provider,
          three_d_secure_url: payment.threeDSecureUrl,
          token: payment.tokenId,
          last_four: payment.lastFour,
          brand: payment.brand,
          processed_at: payment.processedAt?.toISOString() || new Date().toISOString(),
        },
      };

      logger.info('Payment confirmation completed', {
        paymentId: payment.id,
        status: payment.status,
        orderId: payment.orderId,
        processingTime: Date.now() - startTime,
      });

      const statusCode = payment.status === 'succeeded' ? 200 : 
                        payment.status === 'requires_action' ? 200 : 400;

      return reply.status(statusCode).send(response);
    } catch (error) {
      logger.error('Payment confirmation failed:', error);
      
      return reply.status(400).send({
        success: false,
        message: 'Payment confirmation failed',
        error: error.message,
      });
    }
  });

  // Create refund
  fastify.post('/refund', {
    schema: {
      body: RefundRequestSchema,
      response: {
        200: RefundResponseSchema,
      },
    },
  }, async (request, reply) => {
    const startTime = Date.now();
    
    try {
      const refundRequest = RefundRequestSchema.parse(request.body);
      
      logger.info('Refund request received', {
        paymentId: refundRequest.payment_id,
        amount: refundRequest.amount,
        reason: refundRequest.reason,
      });

      const refund = await paymentService.createRefund(refundRequest);

      const response = {
        success: true,
        message: 'Refund processed successfully',
        data: {
          refund_id: refund.id,
          payment_id: refund.paymentId,
          amount: refund.amount,
          currency: refund.currency,
          status: refund.status,
          reason: refund.reason,
          processed_at: refund.processedAt?.toISOString() || new Date().toISOString(),
        },
      };

      logger.info('Refund processed successfully', {
        refundId: refund.id,
        paymentId: refund.paymentId,
        amount: refund.amount,
        processingTime: Date.now() - startTime,
      });

      return reply.send(response);
    } catch (error) {
      logger.error('Refund processing failed:', error);
      
      return reply.status(400).send({
        success: false,
        message: 'Refund processing failed',
        error: error.message,
      });
    }
  });

  // Get payment details
  fastify.get('/payments/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const payment = await paymentService.getPayment(id);
      if (!payment) {
        return reply.status(404).send({
          success: false,
          message: 'Payment not found',
        });
      }

      return reply.send({
        success: true,
        message: 'Payment retrieved successfully',
        data: {
          payment_id: payment.id,
          order_id: payment.orderId,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          provider: payment.provider,
          last_four: payment.lastFour,
          brand: payment.brand,
          processed_at: payment.processedAt?.toISOString(),
          created_at: payment.createdAt.toISOString(),
        },
      });
    } catch (error) {
      logger.error('Failed to get payment:', error);
      
      return reply.status(500).send({
        success: false,
        message: 'Failed to retrieve payment',
        error: error.message,
      });
    }
  });

  // Cleanup on close
  fastify.addHook('onClose', async () => {
    await paymentService.disconnect();
  });
};

export { paymentsRoutes };