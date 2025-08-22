import { Kafka, Producer } from 'kafkajs';
import { config } from '@/config';
import { logger } from '@/utils/logger';

export class KafkaService {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000,
    });
  }

  async initialize(): Promise<void> {
    try {
      await this.producer.connect();
      logger.info('Kafka producer connected');
    } catch (error) {
      logger.error('Failed to initialize Kafka producer:', error);
      throw error;
    }
  }

  async publishOrderPaidEvent(orderData: {
    orderId: string;
    customerId: string;
    paymentId: string;
    amount: number;
    currency: string;
    provider: string;
  }): Promise<void> {
    try {
      const event = {
        order_id: orderData.orderId,
        customer_id: orderData.customerId,
        payment_id: orderData.paymentId,
        amount: orderData.amount,
        currency: orderData.currency,
        provider: orderData.provider,
        timestamp: new Date().toISOString(),
        event_type: 'order_paid',
      };

      await this.producer.send({
        topic: config.kafka.topics.orderPaid,
        messages: [
          {
            key: orderData.orderId,
            value: JSON.stringify(event),
            headers: {
              event_type: 'order_paid',
              order_id: orderData.orderId,
              timestamp: new Date().toISOString(),
            },
          },
        ],
      });

      logger.info('Order paid event published', {
        orderId: orderData.orderId,
        paymentId: orderData.paymentId,
        amount: orderData.amount,
      });
    } catch (error) {
      logger.error('Failed to publish order paid event:', error);
      throw error;
    }
  }

  async publishPaymentFailedEvent(paymentData: {
    orderId: string;
    customerId: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
    provider: string;
    reason: string;
  }): Promise<void> {
    try {
      const event = {
        order_id: paymentData.orderId,
        customer_id: paymentData.customerId,
        payment_intent_id: paymentData.paymentIntentId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        provider: paymentData.provider,
        failure_reason: paymentData.reason,
        timestamp: new Date().toISOString(),
        event_type: 'payment_failed',
      };

      await this.producer.send({
        topic: config.kafka.topics.paymentFailed,
        messages: [
          {
            key: paymentData.orderId,
            value: JSON.stringify(event),
            headers: {
              event_type: 'payment_failed',
              order_id: paymentData.orderId,
              timestamp: new Date().toISOString(),
            },
          },
        ],
      });

      logger.info('Payment failed event published', {
        orderId: paymentData.orderId,
        paymentIntentId: paymentData.paymentIntentId,
        reason: paymentData.reason,
      });
    } catch (error) {
      logger.error('Failed to publish payment failed event:', error);
      throw error;
    }
  }

  async publishRefundProcessedEvent(refundData: {
    orderId: string;
    paymentId: string;
    refundId: string;
    amount: number;
    currency: string;
    reason: string;
  }): Promise<void> {
    try {
      const event = {
        order_id: refundData.orderId,
        payment_id: refundData.paymentId,
        refund_id: refundData.refundId,
        amount: refundData.amount,
        currency: refundData.currency,
        reason: refundData.reason,
        timestamp: new Date().toISOString(),
        event_type: 'refund_processed',
      };

      await this.producer.send({
        topic: config.kafka.topics.refundProcessed,
        messages: [
          {
            key: refundData.orderId,
            value: JSON.stringify(event),
            headers: {
              event_type: 'refund_processed',
              order_id: refundData.orderId,
              timestamp: new Date().toISOString(),
            },
          },
        ],
      });

      logger.info('Refund processed event published', {
        orderId: refundData.orderId,
        refundId: refundData.refundId,
        amount: refundData.amount,
      });
    } catch (error) {
      logger.error('Failed to publish refund processed event:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      logger.info('Kafka producer disconnected');
    } catch (error) {
      logger.error('Failed to disconnect Kafka producer:', error);
    }
  }

  async healthCheck(): Promise<{ status: string; topics?: string[] }> {
    try {
      const admin = this.kafka.admin();
      await admin.connect();
      
      const metadata = await admin.fetchTopicMetadata({
        topics: Object.values(config.kafka.topics),
      });
      
      await admin.disconnect();
      
      return {
        status: 'healthy',
        topics: metadata.topics.map(t => t.name),
      };
    } catch (error) {
      logger.error('Kafka health check failed:', error);
      return { status: 'unhealthy' };
    }
  }
}