import Stripe from 'stripe';
import { BasePaymentProvider, CreatePaymentIntentRequest, CreatePaymentIntentResponse, ConfirmPaymentRequest, ConfirmPaymentResponse, CreateRefundRequest, CreateRefundResponse, WebhookValidationResult } from './base';
import { PaymentStatus, RefundStatus } from '@/types';
import { logger, securityLogger } from '@/utils/logger';

export class StripeProvider extends BasePaymentProvider {
  private stripe: Stripe;

  constructor(config: any) {
    super(config, 'stripe');
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: config.apiVersion,
    });
  }

  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> {
    try {
      logger.info('Creating Stripe payment intent', {
        amount: request.amount,
        currency: request.currency,
        orderId: request.orderId,
      });

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: request.amount,
        currency: request.currency.toLowerCase(),
        customer: request.customerId,
        description: request.description,
        metadata: {
          order_id: request.orderId,
          customer_id: request.customerId,
          ...request.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || undefined,
        status: this.mapStripeStatus(paymentIntent.status),
        amount: paymentIntent.amount,
        currency: paymentIntent.currency.toUpperCase(),
      };
    } catch (error) {
      logger.error('Failed to create Stripe payment intent:', error);
      throw new Error(`Stripe payment intent creation failed: ${error.message}`);
    }
  }

  async confirmPayment(request: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> {
    try {
      logger.info('Confirming Stripe payment', {
        paymentIntentId: request.paymentIntentId,
        paymentMethodType: request.paymentMethod.type,
        threeDSecure: request.threeDSecure,
      });

      let paymentMethodId: string;

      if (request.paymentMethod.type === 'card') {
        // Create payment method from card details
        const paymentMethod = await this.stripe.paymentMethods.create({
          type: 'card',
          card: {
            number: request.paymentMethod.card!.number,
            exp_month: request.paymentMethod.card!.expMonth,
            exp_year: request.paymentMethod.card!.expYear,
            cvc: request.paymentMethod.card!.cvc,
          },
          billing_details: {
            name: request.paymentMethod.card!.holderName,
          },
        });

        paymentMethodId = paymentMethod.id;

        // Log card tokenization for security audit
        securityLogger.info('Card tokenized', {
          paymentMethodId: paymentMethod.id,
          lastFour: paymentMethod.card?.last4,
          brand: paymentMethod.card?.brand,
          paymentIntentId: request.paymentIntentId,
        });
      } else {
        paymentMethodId = request.paymentMethod.token!;
      }

      // Confirm payment intent
      const paymentIntent = await this.stripe.paymentIntents.confirm(request.paymentIntentId, {
        payment_method: paymentMethodId,
        return_url: request.returnUrl,
        use_stripe_sdk: request.threeDSecure,
      });

      const response: ConfirmPaymentResponse = {
        id: paymentIntent.id,
        status: this.mapStripeStatus(paymentIntent.status),
        amount: paymentIntent.amount,
        currency: paymentIntent.currency.toUpperCase(),
      };

      // Handle 3D Secure
      if (paymentIntent.next_action?.type === 'use_stripe_sdk') {
        response.threeDSecureUrl = paymentIntent.next_action.use_stripe_sdk?.stripe_js;
      }

      // Add card details if available
      if (paymentIntent.payment_method && typeof paymentIntent.payment_method === 'object') {
        const pm = paymentIntent.payment_method as Stripe.PaymentMethod;
        if (pm.card) {
          response.lastFour = pm.card.last4;
          response.brand = pm.card.brand;
          response.token = pm.id; // For future use
        }
      }

      return response;
    } catch (error) {
      logger.error('Failed to confirm Stripe payment:', error);
      throw new Error(`Stripe payment confirmation failed: ${error.message}`);
    }
  }

  async createRefund(request: CreateRefundRequest): Promise<CreateRefundResponse> {
    try {
      logger.info('Creating Stripe refund', {
        paymentId: request.paymentId,
        amount: request.amount,
        reason: request.reason,
      });

      const refund = await this.stripe.refunds.create({
        payment_intent: request.paymentId,
        amount: request.amount,
        reason: request.reason as Stripe.RefundCreateParams.Reason,
        metadata: request.metadata,
      });

      return {
        id: refund.id,
        paymentId: request.paymentId,
        amount: refund.amount,
        currency: refund.currency.toUpperCase(),
        status: this.mapStripeRefundStatus(refund.status),
        reason: refund.reason || request.reason,
      };
    } catch (error) {
      logger.error('Failed to create Stripe refund:', error);
      throw new Error(`Stripe refund creation failed: ${error.message}`);
    }
  }

  async validateWebhook(payload: string, signature: string): Promise<WebhookValidationResult> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.webhookSecret!
      );

      return {
        isValid: true,
        event: {
          id: event.id,
          type: event.type,
          data: event.data,
          created: event.created,
          provider: 'stripe',
        },
      };
    } catch (error) {
      logger.warn('Stripe webhook validation failed:', error);
      return {
        isValid: false,
        error: error.message,
      };
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
      return this.mapStripeStatus(paymentIntent.status);
    } catch (error) {
      logger.error('Failed to get Stripe payment status:', error);
      throw new Error(`Failed to retrieve payment status: ${error.message}`);
    }
  }

  async tokenizeCard(card: any): Promise<{ token: string; lastFour: string; brand: string }> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: card.number,
          exp_month: card.expMonth,
          exp_year: card.expYear,
          cvc: card.cvc,
        },
        billing_details: {
          name: card.holderName,
        },
      });

      securityLogger.info('Card tokenized via Stripe', {
        paymentMethodId: paymentMethod.id,
        lastFour: paymentMethod.card?.last4,
        brand: paymentMethod.card?.brand,
      });

      return {
        token: paymentMethod.id,
        lastFour: paymentMethod.card?.last4 || '',
        brand: paymentMethod.card?.brand || '',
      };
    } catch (error) {
      logger.error('Failed to tokenize card with Stripe:', error);
      throw new Error(`Card tokenization failed: ${error.message}`);
    }
  }

  private mapStripeStatus(status: string): PaymentStatus {
    switch (status) {
      case 'requires_payment_method':
      case 'requires_confirmation':
        return 'pending';
      case 'processing':
        return 'processing';
      case 'succeeded':
        return 'succeeded';
      case 'requires_action':
        return 'requires_action';
      case 'canceled':
        return 'canceled';
      default:
        return 'failed';
    }
  }

  private mapStripeRefundStatus(status: string): RefundStatus {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'succeeded':
        return 'succeeded';
      case 'failed':
        return 'failed';
      case 'canceled':
        return 'canceled';
      default:
        return 'failed';
    }
  }
}