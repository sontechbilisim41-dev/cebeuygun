import { Kafka, Consumer, Producer } from 'kafkajs';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { EarningsCalculator } from './earnings-calculator';
import { Delivery, DeliverySchema } from '@/types';

export class KafkaService {
  private kafka: Kafka;
  private consumer: Consumer;
  private producer: Producer;
  private earningsCalculator: EarningsCalculator;

  constructor(earningsCalculator: EarningsCalculator) {
    this.kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    this.consumer = this.kafka.consumer({
      groupId: 'courier-earnings-group',
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });

    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000,
    });

    this.earningsCalculator = earningsCalculator;
  }

  async initialize(): Promise<void> {
    try {
      await this.consumer.connect();
      await this.producer.connect();
      
      await this.consumer.subscribe({
        topic: config.kafka.topics.orderDelivered,
        fromBeginning: false,
      });

      await this.consumer.run({
        eachMessage: this.handleOrderDeliveredEvent.bind(this),
        partitionsConsumedConcurrently: 3,
      });

      logger.info('Kafka service initialized');
      logger.info(`Subscribed to topic: ${config.kafka.topics.orderDelivered}`);
    } catch (error) {
      logger.error('Failed to initialize Kafka service:', error);
      throw error;
    }
  }

  /**
   * Handle order.delivered event
   */
  private async handleOrderDeliveredEvent({ topic, partition, message }: any): Promise<void> {
    const startTime = Date.now();
    
    try {
      if (!message.value) {
        logger.warn('Received empty message', { topic, partition, offset: message.offset });
        return;
      }

      const eventData = JSON.parse(message.value.toString());
      logger.debug('Processing order.delivered event', {
        orderId: eventData.order_id,
        courierId: eventData.courier_id,
        topic,
        partition,
        offset: message.offset,
      });

      // Validate and parse delivery data
      const delivery = this.parseDeliveryEvent(eventData);
      
      if (!delivery) {
        logger.warn('Invalid delivery event data', { eventData });
        return;
      }

      // Calculate earnings for this delivery
      const earnings = await this.earningsCalculator.calculateDeliveryEarnings(delivery);

      logger.info('Earnings calculated from event', {
        deliveryId: delivery.id,
        courierId: delivery.courierId,
        totalEarning: earnings.totalEarning.amount,
        processingTime: Date.now() - startTime,
      });

      // Publish payout generated event if this completes a payout period
      await this.checkAndPublishPayoutEvent(delivery.courierId, delivery.completedAt);

    } catch (error) {
      logger.error('Failed to process order.delivered event:', {
        error: error.message,
        stack: error.stack,
        topic,
        partition,
        offset: message.offset,
        processingTime: Date.now() - startTime,
      });
    }
  }

  /**
   * Parse delivery event data
   */
  private parseDeliveryEvent(eventData: any): Delivery | null {
    try {
      // Map event data to delivery format
      const deliveryData = {
        id: eventData.delivery_id || eventData.assignment_id,
        orderId: eventData.order_id,
        courierId: eventData.courier_id,
        status: 'completed' as const,
        pickupLocation: {
          latitude: eventData.pickup_location?.latitude || 0,
          longitude: eventData.pickup_location?.longitude || 0,
          address: eventData.pickup_location?.address,
        },
        deliveryLocation: {
          latitude: eventData.delivery_location?.latitude || 0,
          longitude: eventData.delivery_location?.longitude || 0,
          address: eventData.delivery_location?.address,
        },
        actualDistance: eventData.actual_distance || eventData.distance || 0,
        actualDuration: eventData.actual_duration || eventData.duration || 0,
        isExpressDelivery: eventData.is_express_delivery || false,
        vehicleType: eventData.vehicle_type || 'BICYCLE',
        completedAt: eventData.completed_at || eventData.timestamp,
        pickupTime: eventData.pickup_time || eventData.timestamp,
        deliveryTime: eventData.delivery_time || eventData.timestamp,
        metadata: eventData.metadata || {},
      };

      // Validate using Zod schema
      const validatedDelivery = DeliverySchema.parse(deliveryData);
      
      return {
        ...validatedDelivery,
        completedAt: new Date(validatedDelivery.completedAt),
        pickupTime: new Date(validatedDelivery.pickupTime),
        deliveryTime: new Date(validatedDelivery.deliveryTime),
      };
    } catch (error) {
      logger.error('Failed to parse delivery event:', error);
      return null;
    }
  }

  /**
   * Check if payout should be generated and publish event
   */
  private async checkAndPublishPayoutEvent(courierId: string, completedAt: Date): Promise<void> {
    try {
      // Check if this is the end of a payout period (simplified logic)
      const dayOfWeek = completedAt.getDay();
      const hour = completedAt.getHours();
      
      // Generate payout on Monday morning (day 1, hour 0-6)
      if (dayOfWeek === config.earnings.payoutDay && hour < 6) {
        await this.publishPayoutGeneratedEvent(courierId, completedAt);
      }
    } catch (error) {
      logger.error('Failed to check payout generation:', error);
    }
  }

  /**
   * Publish courier.payout.generated event
   */
  async publishPayoutGeneratedEvent(courierId: string, periodEnd: Date): Promise<void> {
    try {
      const event = {
        courier_id: courierId,
        period_end: periodEnd.toISOString(),
        event_type: 'courier_payout_generated',
        timestamp: new Date().toISOString(),
        metadata: {
          generated_by: 'earnings_service',
          payout_day: config.earnings.payoutDay,
        },
      };

      await this.producer.send({
        topic: config.kafka.topics.courierPayoutGenerated,
        messages: [
          {
            key: courierId,
            value: JSON.stringify(event),
            headers: {
              event_type: 'courier_payout_generated',
              courier_id: courierId,
              timestamp: event.timestamp,
            },
          },
        ],
      });

      logger.info('Payout generated event published', {
        courierId,
        periodEnd: periodEnd.toISOString(),
      });
    } catch (error) {
      logger.error('Failed to publish payout generated event:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.consumer.disconnect();
      await this.producer.disconnect();
      logger.info('Kafka service disconnected');
    } catch (error) {
      logger.error('Failed to disconnect Kafka service:', error);
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