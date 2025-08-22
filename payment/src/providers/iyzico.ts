import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { BasePaymentProvider, CreatePaymentIntentRequest, CreatePaymentIntentResponse, ConfirmPaymentRequest, ConfirmPaymentResponse, CreateRefundRequest, CreateRefundResponse, WebhookValidationResult } from './base';
import { PaymentStatus, RefundStatus } from '@/types';
import { logger, securityLogger } from '@/utils/logger';

export class IyzicoProvider extends BasePaymentProvider {
  private client: AxiosInstance;

  constructor(config: any) {
    super(config, 'iyzico');
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> {
    try {
      logger.info('Creating iyzico payment intent', {
        amount: request.amount,
        currency: request.currency,
        orderId: request.orderId,
      });

      // iyzico uses different terminology - we create a "checkout form initialize"
      const iyzicoRequest = {
        locale: 'tr',
        conversationId: request.orderId,
        price: (request.amount / 100).toFixed(2), // Convert from kuruş to TRY
        paidPrice: (request.amount / 100).toFixed(2),
        currency: request.currency,
        basketId: request.orderId,
        paymentGroup: 'PRODUCT',
        buyer: {
          id: request.customerId,
          name: 'Customer', // Would come from customer service
          surname: 'User',
          email: 'customer@example.com',
          identityNumber: '11111111111',
          registrationAddress: 'Address',
          city: 'Istanbul',
          country: 'Turkey',
          zipCode: '34000',
          ip: '127.0.0.1',
        },
        basketItems: [
          {
            id: request.orderId,
            name: request.description || 'Order',
            category1: 'General',
            itemType: 'PHYSICAL',
            price: (request.amount / 100).toFixed(2),
          },
        ],
      };

      const response = await this.makeIyzicoRequest('/payment/iyzipos/checkoutform/initialize/auth/ecom', iyzicoRequest);

      if (response.status !== 'success') {
        throw new Error(`iyzico error: ${response.errorMessage}`);
      }

      return {
        id: response.token,
        clientSecret: response.checkoutFormContent,
        status: 'pending',
        amount: request.amount,
        currency: request.currency,
      };
    } catch (error) {
      logger.error('Failed to create iyzico payment intent:', error);
      throw new Error(`iyzico payment intent creation failed: ${error.message}`);
    }
  }

  async confirmPayment(request: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> {
    try {
      logger.info('Confirming iyzico payment', {
        paymentIntentId: request.paymentIntentId,
        paymentMethodType: request.paymentMethod.type,
      });

      // For iyzico, we typically retrieve the checkout form result
      const iyzicoRequest = {
        locale: 'tr',
        token: request.paymentIntentId,
      };

      const response = await this.makeIyzicoRequest('/payment/iyzipos/checkoutform/auth/ecom/detail', iyzicoRequest);

      if (response.status !== 'success') {
        throw new Error(`iyzico error: ${response.errorMessage}`);
      }

      const payment = response.payments?.[0];
      if (!payment) {
        throw new Error('No payment found in iyzico response');
      }

      return {
        id: payment.paymentId,
        status: this.mapIyzicoStatus(payment.paymentStatus),
        amount: Math.round(parseFloat(payment.paidPrice) * 100), // Convert to kuruş
        currency: payment.currency,
        lastFour: payment.cardLastFourDigits,
        brand: payment.cardType,
      };
    } catch (error) {
      logger.error('Failed to confirm iyzico payment:', error);
      throw new Error(`iyzico payment confirmation failed: ${error.message}`);
    }
  }

  async createRefund(request: CreateRefundRequest): Promise<CreateRefundResponse> {
    try {
      logger.info('Creating iyzico refund', {
        paymentId: request.paymentId,
        amount: request.amount,
        reason: request.reason,
      });

      const iyzicoRequest = {
        locale: 'tr',
        paymentTransactionId: request.paymentId,
        price: request.amount ? (request.amount / 100).toFixed(2) : undefined,
        reason: request.reason,
      };

      const response = await this.makeIyzicoRequest('/payment/refund', iyzicoRequest);

      if (response.status !== 'success') {
        throw new Error(`iyzico error: ${response.errorMessage}`);
      }

      return {
        id: response.paymentId,
        paymentId: request.paymentId,
        amount: Math.round(parseFloat(response.price) * 100),
        currency: response.currency,
        status: 'succeeded',
        reason: request.reason,
      };
    } catch (error) {
      logger.error('Failed to create iyzico refund:', error);
      throw new Error(`iyzico refund creation failed: ${error.message}`);
    }
  }

  async validateWebhook(payload: string, signature: string): Promise<WebhookValidationResult> {
    try {
      // iyzico webhook validation (simplified)
      const expectedSignature = crypto
        .createHmac('sha256', this.config.webhookSecret!)
        .update(payload)
        .digest('hex');

      if (signature !== expectedSignature) {
        return {
          isValid: false,
          error: 'Invalid signature',
        };
      }

      const event = JSON.parse(payload);
      return {
        isValid: true,
        event: {
          id: event.iyziEventId,
          type: event.iyziEventType,
          data: event,
          created: Date.now() / 1000,
          provider: 'iyzico',
        },
      };
    } catch (error) {
      logger.warn('iyzico webhook validation failed:', error);
      return {
        isValid: false,
        error: error.message,
      };
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const iyzicoRequest = {
        locale: 'tr',
        paymentId: paymentId,
      };

      const response = await this.makeIyzicoRequest('/payment/detail', iyzicoRequest);

      if (response.status !== 'success') {
        throw new Error(`iyzico error: ${response.errorMessage}`);
      }

      return this.mapIyzicoStatus(response.paymentStatus);
    } catch (error) {
      logger.error('Failed to get iyzico payment status:', error);
      throw new Error(`Failed to retrieve payment status: ${error.message}`);
    }
  }

  private async makeIyzicoRequest(endpoint: string, data: any): Promise<any> {
    const requestString = this.prepareRequestString(endpoint, data);
    const authorization = this.generateAuthorizationHeader(requestString);

    const response = await this.client.post(endpoint, data, {
      headers: {
        Authorization: authorization,
      },
    });

    return response.data;
  }

  private prepareRequestString(endpoint: string, data: any): string {
    const sortedKeys = Object.keys(data).sort();
    const requestString = sortedKeys
      .map(key => `${key}=${data[key]}`)
      .join('&');
    
    return `[POST]${this.config.baseUrl}${endpoint}[${requestString}]`;
  }

  private generateAuthorizationHeader(requestString: string): string {
    const hash = crypto
      .createHmac('sha256', this.config.secretKey)
      .update(requestString)
      .digest('base64');
    
    return `IYZWS ${this.config.apiKey}:${hash}`;
  }

  private mapIyzicoStatus(status: string): PaymentStatus {
    switch (status) {
      case 'SUCCESS':
        return 'succeeded';
      case 'FAILURE':
        return 'failed';
      case 'INIT_THREEDS':
        return 'requires_action';
      default:
        return 'pending';
    }
  }
}