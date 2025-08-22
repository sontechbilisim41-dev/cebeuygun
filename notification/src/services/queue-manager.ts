import Bull, { Queue, Job } from 'bull';
import IORedis from 'ioredis';
import { NotificationDelivery, ContactInfo, NotificationPriority } from '@/types';
import { config } from '@/config';
import { logger, deliveryLogger } from '@/utils/logger';
import { ChannelManager } from './channel-manager';
import { DatabaseService } from '@/config/database';

export class QueueManager {
  private redis: IORedis;
  private queues: Map<NotificationPriority, Queue> = new Map();
  private channelManager: ChannelManager;
  private database: DatabaseService;

  constructor(channelManager: ChannelManager, database: DatabaseService) {
    this.channelManager = channelManager;
    this.database = database;
    
    // Initialize Redis connection
    this.redis = new IORedis(config.redis.url, {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
    });

    this.initializeQueues();
  }

  /**
   * Initialize Bull queues for different priorities
   */
  private initializeQueues(): void {
    const priorities: NotificationPriority[] = ['urgent', 'high', 'normal', 'low'];
    
    priorities.forEach((priority) => {
      const queue = new Bull(`notifications:${priority}`, {
        redis: {
          host: this.redis.options.host,
          port: this.redis.options.port,
          password: this.redis.options.password,
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: config.retry.maxAttempts,
          backoff: {
            type: 'exponential',
            settings: {
              delay: config.retry.initialDelay,
            },
          },
        },
      });

      // Set concurrency based on priority
      const concurrency = this.getConcurrencyForPriority(priority);
      queue.process(concurrency, this.processDeliveryJob.bind(this));

      // Event handlers
      queue.on('completed', (job) => {
        logger.debug('Delivery job completed', {
          jobId: job.id,
          deliveryId: job.data.deliveryId,
          priority,
        });
      });

      queue.on('failed', (job, error) => {
        logger.error('Delivery job failed', {
          jobId: job.id,
          deliveryId: job.data.deliveryId,
          priority,
          error: error.message,
          attempts: job.attemptsMade,
        });
      });

      queue.on('stalled', (job) => {
        logger.warn('Delivery job stalled', {
          jobId: job.id,
          deliveryId: job.data.deliveryId,
          priority,
        });
      });

      this.queues.set(priority, queue);
    });

    logger.info('Notification queues initialized', {
      priorities: priorities,
      concurrency: config.performance.concurrency,
    });
  }

  /**
   * Queue delivery for processing
   */
  async queueDelivery(delivery: NotificationDelivery, priority: NotificationPriority): Promise<void> {
    const startTime = Date.now();

    try {
      const queue = this.queues.get(priority);
      if (!queue) {
        throw new Error(`Queue for priority ${priority} not found`);
      }

      const jobData = {
        deliveryId: delivery.id,
        userId: delivery.userId,
        channel: delivery.channel,
        priority,
      };

      const jobOptions = {
        priority: this.getPriorityScore(priority),
        delay: delivery.scheduleAt ? delivery.scheduleAt.getTime() - Date.now() : 0,
      };

      await queue.add('send-notification', jobData, jobOptions);

      const queueTime = Date.now() - startTime;
      
      logger.debug('Delivery queued successfully', {
        deliveryId: delivery.id,
        channel: delivery.channel,
        priority,
        queueTime,
      });

      // Check performance target
      if (queueTime > config.performance.targetQueueTime) {
        logger.warn('Queue time exceeded target', {
          deliveryId: delivery.id,
          queueTime,
          target: config.performance.targetQueueTime,
        });
      }
    } catch (error) {
      logger.error('Failed to queue delivery:', error);
      throw error;
    }
  }

  /**
   * Process delivery job
   */
  private async processDeliveryJob(job: Job): Promise<void> {
    const { deliveryId, userId, channel } = job.data;
    const startTime = Date.now();

    try {
      logger.debug('Processing delivery job', {
        jobId: job.id,
        deliveryId,
        userId,
        channel,
        attempt: job.attemptsMade + 1,
      });

      // Get delivery details
      const delivery = await this.getDelivery(deliveryId);
      if (!delivery) {
        throw new Error('Delivery not found');
      }

      // Check if delivery has expired
      if (delivery.expiresAt && new Date() > delivery.expiresAt) {
        await this.updateDeliveryStatus(deliveryId, 'skipped', undefined, 'Delivery expired');
        return;
      }

      // Get contact info
      const contactInfo = await this.getContactInfo(userId);
      if (!contactInfo) {
        throw new Error('Contact info not found');
      }

      // Update attempt count
      await this.incrementAttemptCount(deliveryId);

      // Send notification
      const result = await this.channelManager.sendNotification(channel, delivery, contactInfo);

      if (result.success) {
        await this.updateDeliveryStatus(deliveryId, 'delivered', result.messageId);
        
        deliveryLogger.info('Notification delivered successfully', {
          deliveryId,
          userId,
          channel,
          messageId: result.messageId,
          processingTime: Date.now() - startTime,
          attempt: job.attemptsMade + 1,
        });
      } else {
        const status = result.retryable ? 'failed' : 'failed';
        await this.updateDeliveryStatus(deliveryId, status, undefined, result.error);
        
        if (!result.retryable) {
          logger.warn('Delivery failed with non-retryable error', {
            deliveryId,
            error: result.error,
          });
          return; // Don't retry
        }

        throw new Error(result.error || 'Delivery failed');
      }
    } catch (error) {
      logger.error('Delivery job processing failed:', {
        jobId: job.id,
        deliveryId,
        error: error.message,
        attempt: job.attemptsMade + 1,
      });

      await this.updateDeliveryStatus(deliveryId, 'failed', undefined, error.message);
      throw error;
    }
  }

  /**
   * Get delivery from database
   */
  private async getDelivery(deliveryId: string): Promise<NotificationDelivery | null> {
    const query = `
      SELECT id, request_id, user_id, channel, template_id, status, content, attempts, 
             last_attempt_at, delivered_at, failure_reason, metadata, created_at, updated_at
      FROM notification_deliveries 
      WHERE id = $1`;

    const result = await this.database.query(query, [deliveryId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      requestId: row.request_id,
      userId: row.user_id,
      channel: row.channel,
      templateId: row.template_id,
      status: row.status,
      content: JSON.parse(row.content),
      attempts: row.attempts,
      lastAttemptAt: row.last_attempt_at,
      deliveredAt: row.delivered_at,
      failureReason: row.failure_reason,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Get contact info from database
   */
  private async getContactInfo(userId: string): Promise<ContactInfo | null> {
    const query = `
      SELECT user_id, email, phone, push_tokens, language, timezone, preferences, created_at, updated_at
      FROM contact_info 
      WHERE user_id = $1`;

    const result = await this.database.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      userId: row.user_id,
      email: row.email,
      phone: row.phone,
      pushTokens: row.push_tokens || [],
      language: row.language || 'tr',
      timezone: row.timezone || 'Europe/Istanbul',
      preferences: row.preferences || {
        push: true,
        sms: true,
        email: true,
        quietHours: true,
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Update delivery status
   */
  private async updateDeliveryStatus(
    deliveryId: string,
    status: string,
    messageId?: string,
    error?: string
  ): Promise<void> {
    const query = `
      UPDATE notification_deliveries 
      SET status = $1, 
          message_id = $2, 
          failure_reason = $3,
          last_attempt_at = NOW(),
          delivered_at = CASE WHEN $1 = 'delivered' THEN NOW() ELSE delivered_at END,
          updated_at = NOW()
      WHERE id = $4`;

    await this.database.query(query, [status, messageId, error, deliveryId]);
  }

  /**
   * Increment attempt count
   */
  private async incrementAttemptCount(deliveryId: string): Promise<void> {
    const query = `
      UPDATE notification_deliveries 
      SET attempts = attempts + 1, updated_at = NOW()
      WHERE id = $1`;

    await this.database.query(query, [deliveryId]);
  }

  /**
   * Get concurrency for priority level
   */
  private getConcurrencyForPriority(priority: NotificationPriority): number {
    const baseConcurrency = config.performance.concurrency;
    
    switch (priority) {
      case 'urgent':
        return baseConcurrency * 2;
      case 'high':
        return baseConcurrency;
      case 'normal':
        return Math.floor(baseConcurrency * 0.7);
      case 'low':
        return Math.floor(baseConcurrency * 0.3);
      default:
        return baseConcurrency;
    }
  }

  /**
   * Get priority score for Bull queue
   */
  private getPriorityScore(priority: NotificationPriority): number {
    switch (priority) {
      case 'urgent':
        return 100;
      case 'high':
        return 75;
      case 'normal':
        return 50;
      case 'low':
        return 25;
      default:
        return 50;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};

    for (const [priority, queue] of this.queues.entries()) {
      const waiting = await queue.getWaiting();
      const active = await queue.getActive();
      const completed = await queue.getCompleted();
      const failed = await queue.getFailed();

      stats[priority] = {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
      };
    }

    return stats;
  }

  /**
   * Cleanup completed and failed jobs
   */
  async cleanupJobs(): Promise<void> {
    for (const [priority, queue] of this.queues.entries()) {
      try {
        await queue.clean(24 * 60 * 60 * 1000, 'completed'); // 24 hours
        await queue.clean(7 * 24 * 60 * 60 * 1000, 'failed'); // 7 days
        
        logger.debug(`Cleaned up ${priority} queue jobs`);
      } catch (error) {
        logger.error(`Failed to cleanup ${priority} queue:`, error);
      }
    }
  }

  /**
   * Disconnect all queues
   */
  async disconnect(): Promise<void> {
    for (const [_, queue] of this.queues.entries()) {
      await queue.close();
    }
    await this.redis.disconnect();
  }
}