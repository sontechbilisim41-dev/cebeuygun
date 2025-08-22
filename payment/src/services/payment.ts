import { PaymentProviderFactory } from '@/providers/factory';
import { FraudDetectionService } from './fraud-detection';
import { TokenizationService } from './tokenization';
import { KafkaService } from './kafka';
import { 
  PaymentIntentRequest, 
  PaymentConfirmRequest, 
  RefundRequest,
  PaymentIntent,
  Payment,
  Refund,
  PaymentProvider 
} from '@/types';
import { logger, securityLogger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class PaymentService {
  private fraudDetection: FraudDetectionService;
  private tokenization: TokenizationService;
  private kafka: KafkaService;
  
  // In-memory storage for demo (use database in production)
  private paymentIntents: Map<string, PaymentIntent> = new Map();
  private payments: Map<string, Payment> = new Map();
  private refunds: Map<string, Refund> = new Map();

  constructor() {
    this.fraudDetection = new FraudDetectionService();
    this.tokenization = new TokenizationService();
    this.kafka = new KafkaService();
  }

  async initialize(): Promise<void> {
    await this.fraudDetection.initialize();
    await this.kafka.initialize();
    logger.info('Payment service initialized');
  }

  async createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntent> {
    const startTime = Date.now();
    
    try {
      logger.info('Creating payment intent', {
        amount: request.amount,
        currency: request.currency,
        orderId: request.order_id,
        provider: request.provider,
      });

      // Fraud detection check
      const fraudCheck = await this.fraudDetection.checkPayment(
        request.customer.id,
        uuidv4(), // Temporary ID for fraud check
        request.amount,
        request.currency,
        request.customer.address?.country
      );

      if (fraudCheck.action === 'block') {
        securityLogger.warn('Payment blocked by fraud detection', {
          customerId: request.customer.id,
          orderId: request.order_id,
          riskScore: fraudCheck.riskScore,
          riskFactors: fraudCheck.riskFactors,
          reason: fraudCheck.reason,
        });
        
        throw new Error(`Payment blocked: ${fraudCheck.reason}`);
      }

      if (fraudCheck.action === 'review') {
        securityLogger.info('Payment flagged for review', {
          customerId: request.customer.id,
          orderId: request.order_id,
          riskScore: fraudCheck.riskScore,
          riskFactors: fraudCheck.riskFactors,
        });
      }

      // Get payment provider
      const provider = PaymentProviderFactory.getProvider(request.provider);
      
      // Create payment intent with provider
      const providerResponse = await provider.createPaymentIntent({
        amount: request.amount,
        currency: request.currency,
        customerId: request.customer.id,
        orderId: request.order_id,
        description: request.description,
        metadata: request.metadata,
      });

      // Store payment intent
      const paymentIntent: PaymentIntent = {
        id: providerResponse.id,
        orderId: request.order_id,
        customerId: request.customer.id,
        amount: request.amount,
        currency: request.currency,
        status: providerResponse.status,
        provider: request.provider,
        clientSecret: providerResponse.clientSecret,
        metadata: request.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.paymentIntents.set(paymentIntent.id, paymentIntent);

      logger.info('Payment intent created successfully', {
        paymentIntentId: paymentIntent.id,
        orderId: request.order_id,
        provider: request.provider,
        processingTime: Date.now() - startTime,
      });

      return paymentIntent;
    } catch (error) {
      logger.error('Failed to create payment intent:', error);
      throw error;
    }
  }

  async confirmPayment(request: PaymentConfirmRequest): Promise<Payment> {
    const startTime = Date.now();
    
    try {
      logger.info('Confirming payment', {
        paymentIntentId: request.payment_intent_id,
        paymentMethodType: request.payment_method.type,
        threeDSecure: request.three_d_secure,
      });

      // Get payment intent
      const paymentIntent = this.paymentIntents.get(request.payment_intent_id);
      if (!paymentIntent) {
        throw new Error('Payment intent not found');
      }

      // Get payment provider
      const provider = PaymentProviderFactory.getProvider(paymentIntent.provider);

      // Tokenize card if needed (PCI compliance)
      let tokenData: { token: string; lastFour: string; brand: string } | undefined;
      if (request.payment_method.type === 'card') {
        tokenData = await this.tokenization.tokenizeCard(
          paymentIntent.customerId,
          request.payment_method.card!,
          paymentIntent.provider
        );

        // Log card tokenization for audit
        securityLogger.info('Card tokenized for payment', {
          paymentIntentId: request.payment_intent_id,
          customerId: paymentIntent.customerId,
          tokenId: tokenData.token,
          lastFour: tokenData.lastFour,
          brand: tokenData.brand,
        });
      }

      // Confirm payment with provider
      const providerResponse = await provider.confirmPayment({
        paymentIntentId: request.payment_intent_id,
        paymentMethod: request.payment_method,
        threeDSecure: request.three_d_secure,
        returnUrl: request.return_url,
      });

      // Create payment record
      const payment: Payment = {
        id: providerResponse.id,
        paymentIntentId: request.payment_intent_id,
        orderId: paymentIntent.orderId,
        customerId: paymentIntent.customerId,
        amount: providerResponse.amount,
        currency: providerResponse.currency,
        status: providerResponse.status,
        provider: paymentIntent.provider,
        providerPaymentId: providerResponse.id,
        tokenId: tokenData?.token || providerResponse.token,
        lastFour: tokenData?.lastFour || providerResponse.lastFour,
        brand: tokenData?.brand || providerResponse.brand,
        threeDSecureUrl: providerResponse.threeDSecureUrl,
        metadata: paymentIntent.metadata,
        processedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.payments.set(payment.id, payment);

      // Publish events based on payment status
      if (payment.status === 'succeeded') {
        await this.kafka.publishOrderPaidEvent({
          orderId: payment.orderId,
          customerId: payment.customerId,
          paymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          provider: payment.provider,
        });

        securityLogger.info('Payment completed successfully', {
          paymentId: payment.id,
          orderId: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          provider: payment.provider,
        });
      } else if (payment.status === 'failed') {
        await this.kafka.publishPaymentFailedEvent({
          orderId: payment.orderId,
          customerId: payment.customerId,
          paymentIntentId: payment.paymentIntentId,
          amount: payment.amount,
          currency: payment.currency,
          provider: payment.provider,
          reason: payment.failureReason || 'Payment failed',
        });
      }

      logger.info('Payment confirmation completed', {
        paymentId: payment.id,
        status: payment.status,
        orderId: payment.orderId,
        processingTime: Date.now() - startTime,
      });

      return payment;
    } catch (error) {
      logger.error('Failed to confirm payment:', error);
      
      // Publish payment failed event
      const paymentIntent = this.paymentIntents.get(request.payment_intent_id);
      if (paymentIntent) {
        await this.kafka.publishPaymentFailedEvent({
          orderId: paymentIntent.orderId,
          customerId: paymentIntent.customerId,
          paymentIntentId: request.payment_intent_id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          provider: paymentIntent.provider,
          reason: error.message,
        });
      }
      
      throw error;
    }
  }

  async createRefund(request: RefundRequest): Promise<Refund> {
    const startTime = Date.now();
    
    try {
      logger.info('Creating refund', {
        paymentId: request.payment_id,
        amount: request.amount,
        reason: request.reason,
      });

      // Get original payment
      const payment = this.payments.get(request.payment_id);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'succeeded') {
        throw new Error('Can only refund succeeded payments');
      }

      // Get payment provider
      const provider = PaymentProviderFactory.getProvider(payment.provider);

      // Create refund with provider
      const providerResponse = await provider.createRefund({
        paymentId: request.payment_id,
        amount: request.amount,
        reason: request.reason,
        metadata: request.metadata,
      });

      // Create refund record
      const refund: Refund = {
        id: providerResponse.id,
        paymentId: request.payment_id,
        amount: providerResponse.amount,
        currency: providerResponse.currency,
        status: providerResponse.status,
        reason: providerResponse.reason || request.reason,
        providerRefundId: providerResponse.id,
        metadata: request.metadata,
        processedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.refunds.set(refund.id, refund);

      // Publish refund processed event
      await this.kafka.publishRefundProcessedEvent({
        orderId: payment.orderId,
        paymentId: payment.id,
        refundId: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        reason: refund.reason,
      });

      securityLogger.info('Refund processed', {
        refundId: refund.id,
        paymentId: payment.id,
        orderId: payment.orderId,
        amount: refund.amount,
        reason: refund.reason,
      });

      logger.info('Refund created successfully', {
        refundId: refund.id,
        paymentId: payment.id,
        amount: refund.amount,
        processingTime: Date.now() - startTime,
      });

      return refund;
    } catch (error) {
      logger.error('Failed to create refund:', error);
      throw error;
    }
  }

  async getPayment(paymentId: string): Promise<Payment | null> {
    return this.payments.get(paymentId) || null;
  }

  async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent | null> {
    return this.paymentIntents.get(paymentIntentId) || null;
  }

  async getRefund(refundId: string): Promise<Refund | null> {
    return this.refunds.get(refundId) || null;
  }

  async handleWebhook(provider: PaymentProvider, payload: string, signature: string): Promise<void> {
    try {
      const providerInstance = PaymentProviderFactory.getProvider(provider);
      const validation = await providerInstance.validateWebhook(payload, signature);

      if (!validation.isValid) {
        securityLogger.warn('Invalid webhook received', {
          provider,
          error: validation.error,
        });
        throw new Error('Invalid webhook signature');
      }

      const event = validation.event!;
      
      logger.info('Processing webhook event', {
        provider,
        eventType: event.type,
        eventId: event.id,
      });

      // Process different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
        case 'payment.succeeded':
          await this.handlePaymentSucceeded(event);
          break;
        case 'payment_intent.payment_failed':
        case 'payment.failed':
          await this.handlePaymentFailed(event);
          break;
        case 'charge.dispute.created':
          await this.handleChargeDispute(event);
          break;
        default:
          logger.debug('Unhandled webhook event type', { eventType: event.type });
      }
    } catch (error) {
      logger.error('Failed to handle webhook:', error);
      throw error;
    }
  }

  private async handlePaymentSucceeded(event: any): Promise<void> {
    // Update payment status and publish events
    logger.info('Payment succeeded webhook received', { eventId: event.id });
  }

  private async handlePaymentFailed(event: any): Promise<void> {
    // Update payment status and publish events
    logger.info('Payment failed webhook received', { eventId: event.id });
  }

  private async handleChargeDispute(event: any): Promise<void> {
    // Handle chargeback/dispute
    securityLogger.warn('Chargeback/dispute received', {
      eventId: event.id,
      chargeId: event.data?.object?.charge,
      amount: event.data?.object?.amount,
      reason: event.data?.object?.reason,
    });
  }

  async disconnect(): Promise<void> {
    await this.fraudDetection.disconnect();
    await this.kafka.disconnect();
  }
}