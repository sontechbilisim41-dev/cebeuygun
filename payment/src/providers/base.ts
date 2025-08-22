import { PaymentProvider, PaymentStatus, RefundStatus } from '@/types';

export interface PaymentProviderConfig {
  apiKey: string;
  secretKey: string;
  baseUrl?: string;
  webhookSecret?: string;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  customerId: string;
  orderId: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentResponse {
  id: string;
  clientSecret?: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  paymentMethod: {
    type: 'card' | 'token';
    card?: {
      number: string;
      expMonth: number;
      expYear: number;
      cvc: string;
      holderName: string;
    };
    token?: string;
  };
  threeDSecure?: boolean;
  returnUrl?: string;
}

export interface ConfirmPaymentResponse {
  id: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  threeDSecureUrl?: string;
  token?: string;
  lastFour?: string;
  brand?: string;
}

export interface CreateRefundRequest {
  paymentId: string;
  amount?: number;
  reason?: string;
  metadata?: Record<string, string>;
}

export interface CreateRefundResponse {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: RefundStatus;
  reason?: string;
}

export interface WebhookValidationResult {
  isValid: boolean;
  event?: any;
  error?: string;
}

export abstract class BasePaymentProvider {
  protected config: PaymentProviderConfig;
  protected provider: PaymentProvider;

  constructor(config: PaymentProviderConfig, provider: PaymentProvider) {
    this.config = config;
    this.provider = provider;
  }

  abstract createPaymentIntent(request: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse>;
  abstract confirmPayment(request: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse>;
  abstract createRefund(request: CreateRefundRequest): Promise<CreateRefundResponse>;
  abstract validateWebhook(payload: string, signature: string): Promise<WebhookValidationResult>;
  abstract getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
  
  // Card tokenization (optional, provider-dependent)
  async tokenizeCard?(card: any): Promise<{ token: string; lastFour: string; brand: string }> {
    throw new Error('Card tokenization not implemented for this provider');
  }
}

export { BasePaymentProvider }