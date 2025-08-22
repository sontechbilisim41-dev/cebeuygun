import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { SyncJobData, WebhookJobData, SyncResult } from '@/types';
import { integrationService } from './integrationService';
import { webhookService } from './webhookService';
import { metricsService } from './metricsService';

class QueueService {
  private redis: IORedis;
  private syncQueue: Queue<SyncJobData>;
  private webhookQueue: Queue<WebhookJobData>;
  private exportQueue: Queue<any>;
  private syncWorker: Worker<SyncJobData>;
  private webhookWorker: Worker<WebhookJobData>;
  private exportWorker: Worker<any>;
  private queueEvents: QueueEvents;

  constructor() {
    // Initialize Redis connection
    this.redis = new IORedis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });

    // Initialize queues
    this.syncQueue = new Queue<SyncJobData>('sync-jobs', {
      connection: this.redis,
      defaultJobOptions: config.queue.defaultJobOptions,
    });

    this.webhookQueue = new Queue<WebhookJobData>('webhook-jobs', {
      connection: this.redis,
      defaultJobOptions: {
        ...config.queue.defaultJobOptions,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });

    this.exportQueue = new Queue('export-jobs', {
      connection: this.redis,
      defaultJobOptions: {
        ...config.queue.defaultJobOptions,
        attempts: 2,
      },
    });

    // Initialize queue events
    this.queueEvents = new QueueEvents('sync-jobs', { connection: this.redis });
    this.setupQueueEventListeners();
  }

  async initialize(): Promise<void> {
    try {
      // Initialize workers
      this.syncWorker = new Worker<SyncJobData>(
        'sync-jobs',
        this.processSyncJob.bind(this),
        {
          connection: this.redis,
          concurrency: config.queue.concurrency.sync,
        }
      );

      this.webhookWorker = new Worker<WebhookJobData>(
        'webhook-jobs',
        this.processWebhookJob.bind(this),
        {
          connection: this.redis,
          concurrency: config.queue.concurrency.webhook,
        }
      );

      this.exportWorker = new Worker(
        'export-jobs',
        this.processExportJob.bind(this),
        {
          connection: this.redis,
          concurrency: config.queue.concurrency.export,
        }
      );

      // Setup worker event listeners
      this.setupWorkerEventListeners();

      logger.info('Queue service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize queue service:', error);
      throw error;
    }
  }

  // Sync Job Management
  async addSyncJob(
    integrationId: string,
    type: SyncJobData['type'],
    priority: number = 0,
    delay: number = 0,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      const idempotencyKey = `${integrationId}-${type}-${Date.now()}`;
      
      const job = await this.syncQueue.add(
        `sync-${type}`,
        {
          integrationId,
          type,
          priority,
          metadata: metadata || {},
          idempotencyKey,
        },
        {
          priority,
          delay,
          jobId: idempotencyKey,
        }
      );

      logger.info(`Sync job added: ${job.id}`, {
        integrationId,
        type,
        priority,
      });

      return job.id!;
    } catch (error) {
      logger.error('Failed to add sync job:', error);
      throw error;
    }
  }

  async addWebhookJob(
    integrationId: string,
    event: any,
    priority: number = 0
  ): Promise<string> {
    try {
      const idempotencyKey = `${integrationId}-webhook-${event.id}`;
      
      const job = await this.webhookQueue.add(
        'process-webhook',
        {
          integrationId,
          event,
          idempotencyKey,
        },
        {
          priority,
          jobId: idempotencyKey,
        }
      );

      logger.info(`Webhook job added: ${job.id}`, {
        integrationId,
        eventType: event.eventType,
      });

      return job.id!;
    } catch (error) {
      logger.error('Failed to add webhook job:', error);
      throw error;
    }
  }

  // Job Processors
  private async processSyncJob(job: Job<SyncJobData>): Promise<SyncResult> {
    const { integrationId, type, metadata, idempotencyKey } = job.data;
    
    logger.info(`Processing sync job: ${job.id}`, {
      integrationId,
      type,
      idempotencyKey,
    });

    try {
      // Check for duplicate processing
      const existingResult = await this.checkIdempotency(idempotencyKey);
      if (existingResult) {
        logger.info(`Duplicate sync job detected: ${job.id}`);
        return existingResult;
      }

      // Update job progress
      await job.updateProgress(10);

      // Get integration configuration
      const integration = await integrationService.getIntegration(integrationId);
      if (!integration) {
        throw new Error(`Integration not found: ${integrationId}`);
      }

      await job.updateProgress(20);

      // Perform synchronization
      const result = await integrationService.performSync(integration, type, {
        onProgress: (progress: number) => job.updateProgress(20 + (progress * 0.7)),
        metadata,
      });

      await job.updateProgress(100);

      // Store result for idempotency
      await this.storeIdempotencyResult(idempotencyKey, result);

      // Update metrics
      await metricsService.recordSyncMetrics(integrationId, result);

      logger.info(`Sync job completed: ${job.id}`, {
        integrationId,
        type,
        recordsProcessed: result.recordsProcessed,
        duration: result.duration,
      });

      return result;
    } catch (error) {
      logger.error(`Sync job failed: ${job.id}`, {
        integrationId,
        type,
        error: error.message,
      });

      // Update integration error count
      await integrationService.incrementErrorCount(integrationId);

      throw error;
    }
  }

  private async processWebhookJob(job: Job<WebhookJobData>): Promise<SyncResult> {
    const { integrationId, event, idempotencyKey } = job.data;
    
    logger.info(`Processing webhook job: ${job.id}`, {
      integrationId,
      eventType: event.eventType,
      idempotencyKey,
    });

    try {
      // Check for duplicate processing
      const existingResult = await this.checkIdempotency(idempotencyKey);
      if (existingResult) {
        logger.info(`Duplicate webhook job detected: ${job.id}`);
        return existingResult;
      }

      // Process webhook event
      const result = await webhookService.processEvent(integrationId, event);

      // Store result for idempotency
      await this.storeIdempotencyResult(idempotencyKey, result);

      logger.info(`Webhook job completed: ${job.id}`, {
        integrationId,
        eventType: event.eventType,
        recordsProcessed: result.recordsProcessed,
      });

      return result;
    } catch (error) {
      logger.error(`Webhook job failed: ${job.id}`, {
        integrationId,
        eventType: event.eventType,
        error: error.message,
      });

      throw error;
    }
  }

  private async processExportJob(job: Job): Promise<any> {
    const { integrationId, format, filters } = job.data;
    
    logger.info(`Processing export job: ${job.id}`, {
      integrationId,
      format,
    });

    try {
      await job.updateProgress(10);

      // Generate export
      const exportResult = await integrationService.exportData(
        integrationId,
        format,
        filters,
        (progress: number) => job.updateProgress(10 + (progress * 0.9))
      );

      logger.info(`Export job completed: ${job.id}`, {
        integrationId,
        format,
        recordCount: exportResult.recordCount,
      });

      return exportResult;
    } catch (error) {
      logger.error(`Export job failed: ${job.id}`, {
        integrationId,
        format,
        error: error.message,
      });

      throw error;
    }
  }

  // Idempotency Management
  private async checkIdempotency(key: string): Promise<SyncResult | null> {
    try {
      const result = await this.redis.get(`idempotency:${key}`);
      return result ? JSON.parse(result) : null;
    } catch (error) {
      logger.error('Failed to check idempotency:', error);
      return null;
    }
  }

  private async storeIdempotencyResult(key: string, result: SyncResult): Promise<void> {
    try {
      await this.redis.setex(
        `idempotency:${key}`,
        24 * 60 * 60, // 24 hours
        JSON.stringify(result)
      );
    } catch (error) {
      logger.error('Failed to store idempotency result:', error);
    }
  }

  // Queue Management
  async getQueueStats(): Promise<{
    sync: any;
    webhook: any;
    export: any;
  }> {
    try {
      const [syncStats, webhookStats, exportStats] = await Promise.all([
        this.syncQueue.getJobCounts(),
        this.webhookQueue.getJobCounts(),
        this.exportQueue.getJobCounts(),
      ]);

      return {
        sync: syncStats,
        webhook: webhookStats,
        export: exportStats,
      };
    } catch (error) {
      logger.error('Failed to get queue stats:', error);
      throw error;
    }
  }

  async pauseQueue(queueName: string): Promise<void> {
    try {
      const queue = this.getQueueByName(queueName);
      await queue.pause();
      logger.info(`Queue paused: ${queueName}`);
    } catch (error) {
      logger.error(`Failed to pause queue ${queueName}:`, error);
      throw error;
    }
  }

  async resumeQueue(queueName: string): Promise<void> {
    try {
      const queue = this.getQueueByName(queueName);
      await queue.resume();
      logger.info(`Queue resumed: ${queueName}`);
    } catch (error) {
      logger.error(`Failed to resume queue ${queueName}:`, error);
      throw error;
    }
  }

  async clearQueue(queueName: string): Promise<void> {
    try {
      const queue = this.getQueueByName(queueName);
      await queue.obliterate({ force: true });
      logger.info(`Queue cleared: ${queueName}`);
    } catch (error) {
      logger.error(`Failed to clear queue ${queueName}:`, error);
      throw error;
    }
  }

  private getQueueByName(name: string): Queue {
    switch (name) {
      case 'sync':
        return this.syncQueue;
      case 'webhook':
        return this.webhookQueue;
      case 'export':
        return this.exportQueue;
      default:
        throw new Error(`Unknown queue: ${name}`);
    }
  }

  // Event Listeners
  private setupQueueEventListeners(): void {
    this.queueEvents.on('completed', ({ jobId, returnvalue }) => {
      logger.info(`Job completed: ${jobId}`, { returnvalue });
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      logger.error(`Job failed: ${jobId}`, { failedReason });
    });

    this.queueEvents.on('stalled', ({ jobId }) => {
      logger.warn(`Job stalled: ${jobId}`);
    });
  }

  private setupWorkerEventListeners(): void {
    // Sync worker events
    this.syncWorker.on('completed', (job, result) => {
      logger.info(`Sync worker completed job: ${job.id}`, {
        integrationId: job.data.integrationId,
        type: job.data.type,
        result,
      });
    });

    this.syncWorker.on('failed', (job, err) => {
      logger.error(`Sync worker failed job: ${job?.id}`, {
        integrationId: job?.data.integrationId,
        type: job?.data.type,
        error: err.message,
      });
    });

    // Webhook worker events
    this.webhookWorker.on('completed', (job, result) => {
      logger.info(`Webhook worker completed job: ${job.id}`, {
        integrationId: job.data.integrationId,
        result,
      });
    });

    this.webhookWorker.on('failed', (job, err) => {
      logger.error(`Webhook worker failed job: ${job?.id}`, {
        integrationId: job?.data.integrationId,
        error: err.message,
      });
    });

    // Export worker events
    this.exportWorker.on('completed', (job, result) => {
      logger.info(`Export worker completed job: ${job.id}`, { result });
    });

    this.exportWorker.on('failed', (job, err) => {
      logger.error(`Export worker failed job: ${job?.id}`, {
        error: err.message,
      });
    });
  }

  // Cleanup
  async shutdown(): Promise<void> {
    try {
      await Promise.all([
        this.syncWorker.close(),
        this.webhookWorker.close(),
        this.exportWorker.close(),
        this.syncQueue.close(),
        this.webhookQueue.close(),
        this.exportQueue.close(),
        this.queueEvents.close(),
      ]);

      await this.redis.quit();
      logger.info('Queue service shutdown completed');
    } catch (error) {
      logger.error('Error during queue service shutdown:', error);
    }
  }
}

export const queueService = new QueueService();