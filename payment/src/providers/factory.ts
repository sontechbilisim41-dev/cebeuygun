import { BasePaymentProvider } from './base';
import { StripeProvider } from './stripe';
import { IyzicoProvider } from './iyzico';
import { MockProvider } from './mock';
import { PaymentProvider } from '@/types';
import { config } from '@/config';

export class PaymentProviderFactory {
  private static providers: Map<PaymentProvider, BasePaymentProvider> = new Map();

  static getProvider(provider: PaymentProvider): BasePaymentProvider {
    if (this.providers.has(provider)) {
      return this.providers.get(provider)!;
    }

    let providerInstance: BasePaymentProvider;

    switch (provider) {
      case 'stripe':
        if (config.nodeEnv === 'test') {
          providerInstance = new MockProvider();
        } else {
          providerInstance = new StripeProvider(config.providers.stripe);
        }
        break;
      case 'iyzico':
        if (config.nodeEnv === 'test') {
          providerInstance = new MockProvider();
        } else {
          providerInstance = new IyzicoProvider(config.providers.iyzico);
        }
        break;
      default:
        throw new Error(`Unsupported payment provider: ${provider}`);
    }

    this.providers.set(provider, providerInstance);
    return providerInstance;
  }

  static getAllProviders(): BasePaymentProvider[] {
    return Array.from(this.providers.values());
  }

  static clearProviders(): void {
    this.providers.clear();
  }
}