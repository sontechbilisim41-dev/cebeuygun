import { BasePaymentProvider, CreatePaymentIntentRequest, CreatePaymentIntentResponse, ConfirmPaymentRequest, ConfirmPaymentResponse, CreateRefundRequest, CreateRefundResponse, WebhookValidationResult } from './base';
import { PaymentStatus } from '@/types';
import { logger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class MockProvider extends BasePaymentProvider {
  private payments: Map<string, any> = new Map();
  private refunds: Map<string, any> = new Map();

  constructor() {
    super({ apiKey: 'mock', secretKey: 'mock' }, 'stripe');
  }

  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> {
    logger.info('Creating mock payment intent', {
      amount: request.amount,
      currency: request.currency,
      orderId: request.orderId,
    });

    const paymentIntentId = `pi_mock_${uuidv4()}`;
    const clientSecret = `${paymentIntentId}_secret_mock`;

    this.payments.set(paymentIntentId, {
      id: paymentIntentId,
      amount: request.amount,
      currency: request.currency,
      status: 'pending',
      orderId: request.orderId,
      customerId: request.customerId,
      createdAt: new Date(),
    });

    return {
      id: paymentIntentId,
      clientSecret,
      status: 'pending',
      amount: request.amount,
      currency: request.currency,
    };
  }

  async confirmPayment(request: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> {
    logger.info('Confirming mock payment', {
      paymentIntentId: request.paymentIntentId,
      paymentMethodType: request.paymentMethod.type,
    });

    const payment = this.payments.get(request.paymentIntentId);
    if (!payment) {
      throw new Error('Payment intent not found');
    }

    // Simulate different outcomes based on card number
    let status: PaymentStatus = 'succeeded';
    let threeDSecureUrl: string | undefined;

    if (request.paymentMethod.type === 'card') {
      const cardNumber = request.paymentMethod.card!.number;
      
      // Test card numbers for different scenarios
      if (cardNumber === '4000000000000002') {
        status = 'failed';
      } else if (cardNumber === '4000000000003220') {
        status = 'requires_action';
        threeDSecureUrl = 'https://mock-3ds.example.com/challenge';
      }
    }

    // Update payment status
    payment.status = status;
    payment.processedAt = new Date();
    
    if (request.paymentMethod.type === 'card') {
      payment.lastFour = request.paymentMethod.card!.number.slice(-4);
      payment.brand = this.detectCardBrand(request.paymentMethod.card!.number);
    }

    this.payments.set(request.paymentIntentId, payment);

    return {
      id: `pay_mock_${uuidv4()}`,
      status,
      amount: payment.amount,
      currency: payment.currency,
      threeDSecureUrl,
      lastFour: payment.lastFour,
      brand: payment.brand,
      token: request.paymentMethod.type === 'card' ? `pm_mock_${uuidv4()}` : undefined,
    };
  }

  async createRefund(request: CreateRefundRequest): Promise<CreateRefundResponse> {
    logger.info('Creating mock refund', {
      paymentId: request.paymentId,
      amount: request.amount,
      reason: request.reason,
    });

    const refundId = `re_mock_${uuidv4()}`;
    
    // Simulate refund processing
    const refund = {
      id: refundId,
      paymentId: request.paymentId,
      amount: request.amount || 1000, // Mock amount
      currency: 'TRY',
      status: 'succeeded',
      reason: request.reason,
      processedAt: new Date(),
    };

    this.refunds.set(refundId, refund);

    return refund;
  }

  async validateWebhook(payload: string, signature: string): Promise<WebhookValidationResult> {
    // Mock webhook validation - always valid in test mode
    try {
      const event = JSON.parse(payload);
      return {
        isValid: true,
        event: {
          id: event.id || `evt_mock_${uuidv4()}`,
          type: event.type || 'payment_intent.succeeded',
          data: event.data || {},
          created: Math.floor(Date.now() / 1000),
          provider: 'stripe',
        },
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid JSON payload',
      };
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const payment = this.payments.get(paymentId);
    return payment?.status || 'failed';
  }

  async tokenizeCard(card: any): Promise<{ token: string; lastFour: string; brand: string }> {
    logger.info('Tokenizing card with mock provider');

    const token = `pm_mock_${uuidv4()}`;
    const lastFour = card.number.slice(-4);
    const brand = this.detectCardBrand(card.number);

    securityLogger.info('Card tokenized via mock provider', {
      token,
      lastFour,
      brand,
    });

    return { token, lastFour, brand };
  }

  private detectCardBrand(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '');
    
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    
    return 'unknown';
  }
}