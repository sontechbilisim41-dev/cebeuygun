import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { ProductEvent, ProductEventSchema } from '@/types';
import { ElasticsearchService } from './elasticsearch';

export class KafkaService {
  private kafka: Kafka;
  private consumer: Consumer;
  private elasticsearchService: ElasticsearchService;

  constructor(elasticsearchService: ElasticsearchService) {
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

    this.elasticsearchService = elasticsearchService;
  }

  async initialize(): Promise<void> {
    try {
      await this.consumer.connect();
      logger.info('Kafka consumer connected');

      await this.consumer.subscribe({
        topic: config.kafka.topics.productUpsert,
        fromBeginning: false,
      });

      await this.consumer.run({
        eachMessage: this.handleMessage.bind(this),
        partitionsConsumedConcurrently: 3,
      });

      logger.info(`Subscribed to Kafka topic: ${config.kafka.topics.productUpsert}`);
    } catch (error) {
      logger.error('Failed to initialize Kafka consumer:', error);
      throw error;
    }
  }

  private async handleMessage({ topic, partition, message }: EachMessagePayload): Promise<void> {
    const startTime = Date.now();
    
    try {
      if (!message.value) {
        logger.warn('Received empty message', { topic, partition, offset: message.offset });
        return;
      }

      const eventData = JSON.parse(message.value.toString());
      const event = ProductEventSchema.parse(eventData);

      logger.debug(`Processing ${event.action} event for product ${event.product_id}`, {
        topic,
        partition,
        offset: message.offset,
      });

      switch (event.action) {
        case 'created':
        case 'updated':
          if (event.product) {
            await this.elasticsearchService.indexProduct(event.product);
            logger.info(`Indexed product ${event.product_id} from ${event.action} event`, {
              processing_time_ms: Date.now() - startTime,
            });
          } else {
            logger.warn(`No product data in ${event.action} event for ${event.product_id}`);
          }
          break;

        case 'deleted':
          await this.elasticsearchService.deleteProduct(event.product_id);
          logger.info(`Deleted product ${event.product_id} from index`, {
            processing_time_ms: Date.now() - startTime,
          });
          break;

        default:
          logger.warn(`Unknown event action: ${event.action}`, { event });
      }
    } catch (error) {
      logger.error('Failed to process Kafka message:', {
        error: error.message,
        stack: error.stack,
        topic,
        partition,
        offset: message.offset,
        processing_time_ms: Date.now() - startTime,
      });
      
      // Don't throw error to avoid infinite retry loop
      // In production, you might want to send to a dead letter queue
    }
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
        topics: [config.kafka.topics.productUpsert],
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