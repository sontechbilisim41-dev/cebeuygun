import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { NotificationOrchestrator } from './notification-orchestrator';
import { OrderEvent, CourierEvent, PaymentEvent, OrderEventSchema, CourierEventSchema, PaymentEventSchema } from '@/types';

export class KafkaConsumerService {
  private kafka: Kafka;
  private consumer: Consumer;
  private orchestrator: NotificationOrchestrator;

  constructor(orchestrator: NotificationOrchestrator) {
    this.orchestrator = orchestrator;
    
    this.kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    this.consumer = this.kafka.consumer({
      groupId: config.kafka.groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
      maxWaitTimeInMs: 5000,
    });
  }

  async initialize(): Promise<void> {
    try {
      await this.consumer.connect();
      logger.info('Kafka consumer connected');

      // Subscribe to all order-related topics
      const topics = Object.values(config.kafka.topics);
      for (const topic of topics) {
        await this.consumer.subscribe({
          topic,
          fromBeginning: false,
        });
      }

      await this.consumer.run({
        eachMessage: this.handleMessage.bind(this),
        partitionsConsumedConcurrently: 3,
      });

      logger.info('Kafka consumer initialized', {
        topics,
        groupId: config.kafka.groupId,
      });
    } catch (error) {
      logger.error('Failed to initialize Kafka consumer:', error);
      throw error;
    }
  }

  /**
   * Handle incoming Kafka messages
   */
  private async handleMessage({ topic, partition, message }: EachMessagePayload): Promise<void> {
    const startTime = Date.now();
    
    try {
      if (!message.value) {
        logger.warn('Received empty message', { topic, partition, offset: message.offset });
        return;
      }

      const eventData = JSON.parse(message.value.toString());
      
      logger.debug('Processing Kafka message', {
        topic,
        partition,
        offset: message.offset,
        eventType: eventData.event_type || 'unknown',
      });

      // Route to appropriate handler based on topic
      switch (topic) {
        case config.kafka.topics.orderCreated:
        case config.kafka.topics.orderPaid:
        case config.kafka.topics.orderAssigned:
        case config.kafka.topics.orderPickedUp:
        case config.kafka.topics.orderOnTheWay:
        case config.kafka.topics.orderDelivered:
        case config.kafka.topics.orderCanceled:
          await this.handleOrderEvent(topic, eventData);
          break;

        case config.kafka.topics.courierAssigned:
          await this.handleCourierEvent(eventData);
          break;

        case config.kafka.topics.paymentFailed:
          await this.handlePaymentEvent(eventData);
          break;

        default:
          logger.warn('Unknown topic received', { topic });
      }

      const processingTime = Date.now() - startTime;
      
      if (processingTime > config.performance.targetQueueTime) {
        logger.warn('Event processing exceeded target time', {
          topic,
          processingTime,
          target: config.performance.targetQueueTime,
        });
      }
    } catch (error) {
      logger.error('Failed to process Kafka message:', {
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
   * Handle order-related events
   */
  private async handleOrderEvent(topic: string, eventData: any): Promise<void> {
    try {
      const event = OrderEventSchema.parse(eventData);
      const eventType = this.getEventTypeFromTopic(topic);

      logger.info('Processing order event', {
        eventType,
        orderId: event.order_id,
        customerId: event.customer_id,
        status: event.status,
      });

      // Determine notification channels based on event type
      const channels = this.getChannelsForOrderEvent(eventType);
      
      // Send notification to customer
      await this.orchestrator.processNotification({
        userId: event.customer_id,
        eventType,
        channels,
        priority: this.getPriorityForOrderEvent(eventType),
        data: {
          orderId: event.order_id,
          orderStatus: event.status,
          totalAmount: event.total_amount,
          currency: event.currency,
          estimatedDeliveryTime: event.estimated_delivery_time,
          ...event.metadata,
        },
        metadata: {
          orderId: event.order_id,
          source: 'order_event',
        },
      });

      // Send notification to seller if applicable
      if (event.seller_id && ['order_created', 'order_paid'].includes(eventType)) {
        await this.orchestrator.processNotification({
          userId: event.seller_id,
          eventType: `seller_${eventType}`,
          channels: ['push', 'email'],
          priority: 'high',
          data: {
            orderId: event.order_id,
            customerId: event.customer_id,
            orderStatus: event.status,
            totalAmount: event.total_amount,
            currency: event.currency,
            ...event.metadata,
          },
          metadata: {
            orderId: event.order_id,
            source: 'order_event',
          },
        });
      }

      // Send notification to courier if applicable
      if (event.courier_id && ['order_assigned', 'order_picked_up'].includes(eventType)) {
        await this.orchestrator.processNotification({
          userId: event.courier_id,
          eventType: `courier_${eventType}`,
          channels: ['push'],
          priority: 'urgent',
          data: {
            orderId: event.order_id,
            orderStatus: event.status,
            estimatedDeliveryTime: event.estimated_delivery_time,
            ...event.metadata,
          },
          metadata: {
            orderId: event.order_id,
            source: 'order_event',
          },
        });
      }
    } catch (error) {
      logger.error('Failed to handle order event:', error);
      throw error;
    }
  }

  /**
   * Handle courier assignment events
   */
  private async handleCourierEvent(eventData: any): Promise<void> {
    try {
      const event = CourierEventSchema.parse(eventData);

      logger.info('Processing courier event', {
        courierId: event.courier_id,
        orderId: event.order_id,
        estimatedETA: event.estimated_eta,
      });

      // Notify customer about courier assignment
      const customerNotification = await this.getCustomerFromOrder(event.order_id);
      if (customerNotification) {
        await this.orchestrator.processNotification({
          userId: customerNotification.customerId,
          eventType: 'courier_assigned',
          channels: ['push', 'sms'],
          priority: 'high',
          data: {
            orderId: event.order_id,
            courierId: event.courier_id,
            estimatedETA: event.estimated_eta,
            courierName: customerNotification.courierName,
            courierPhone: customerNotification.courierPhone,
            ...event.metadata,
          },
          metadata: {
            orderId: event.order_id,
            source: 'courier_event',
          },
        });
      }

      // Notify courier about new assignment
      await this.orchestrator.processNotification({
        userId: event.courier_id,
        eventType: 'new_assignment',
        channels: ['push'],
        priority: 'urgent',
        data: {
          orderId: event.order_id,
          assignmentId: event.assignment_id,
          estimatedETA: event.estimated_eta,
          ...event.metadata,
        },
        metadata: {
          orderId: event.order_id,
          source: 'courier_event',
        },
      });
    } catch (error) {
      logger.error('Failed to handle courier event:', error);
      throw error;
    }
  }

  /**
   * Handle payment failure events
   */
  private async handlePaymentEvent(eventData: any): Promise<void> {
    try {
      const event = PaymentEventSchema.parse(eventData);

      logger.info('Processing payment event', {
        orderId: event.order_id,
        customerId: event.customer_id,
        amount: event.amount,
        failureReason: event.failure_reason,
      });

      // Notify customer about payment failure
      await this.orchestrator.processNotification({
        userId: event.customer_id,
        eventType: 'payment_failed',
        channels: ['push', 'email'],
        priority: 'high',
        data: {
          orderId: event.order_id,
          amount: event.amount,
          currency: event.currency,
          failureReason: event.failure_reason,
          ...event.metadata,
        },
        metadata: {
          orderId: event.order_id,
          source: 'payment_event',
        },
      });
    } catch (error) {
      logger.error('Failed to handle payment event:', error);
      throw error;
    }
  }

  /**
   * Get event type from Kafka topic
   */
  private getEventTypeFromTopic(topic: string): string {
    const topicMap: Record<string, string> = {
      [config.kafka.topics.orderCreated]: 'order_created',
      [config.kafka.topics.orderPaid]: 'order_paid',
      [config.kafka.topics.orderAssigned]: 'order_assigned',
      [config.kafka.topics.orderPickedUp]: 'order_picked_up',
      [config.kafka.topics.orderOnTheWay]: 'order_on_the_way',
      [config.kafka.topics.orderDelivered]: 'order_delivered',
      [config.kafka.topics.orderCanceled]: 'order_canceled',
    };

    return topicMap[topic] || 'unknown';
  }

  /**
   * Get notification channels for order event
   */
  private getChannelsForOrderEvent(eventType: string): NotificationChannel[] {
    const channelMap: Record<string, NotificationChannel[]> = {
      'order_created': ['push', 'email'],
      'order_paid': ['push', 'sms'],
      'order_assigned': ['push', 'sms'],
      'order_picked_up': ['push'],
      'order_on_the_way': ['push'],
      'order_delivered': ['push', 'sms'],
      'order_canceled': ['push', 'email'],
    };

    return channelMap[eventType] || ['push'];
  }

  /**
   * Get priority for order event
   */
  private getPriorityForOrderEvent(eventType: string): 'urgent' | 'high' | 'normal' | 'low' {
    const priorityMap: Record<string, 'urgent' | 'high' | 'normal' | 'low'> = {
      'order_created': 'normal',
      'order_paid': 'high',
      'order_assigned': 'high',
      'order_picked_up': 'urgent',
      'order_on_the_way': 'urgent',
      'order_delivered': 'high',
      'order_canceled': 'high',
    };

    return priorityMap[eventType] || 'normal';
  }

  /**
   * Get customer info from order
   */
  private async getCustomerFromOrder(orderId: string): Promise<{
    customerId: string;
    courierName?: string;
    courierPhone?: string;
  } | null> {
    // This would typically call the order service
    // For now, return mock data
    return {
      customerId: 'mock-customer-id',
      courierName: 'Ahmet Kurye',
      courierPhone: '+905551234567',
    };
  }

  async disconnect(): Promise<void> {
    try {
      await this.consumer.disconnect();
      logger.info('Kafka consumer disconnected');
    } catch (error) {
      logger.error('Failed to disconnect Kafka consumer:', error);
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