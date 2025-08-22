import { DatabaseService } from '@/config/database';
import { TemplateEngine } from './template-engine';
import { ChannelManager } from './channel-manager';
import { QueueManager } from './queue-manager';
import { 
  NotificationRequest, 
  NotificationDelivery, 
  ContactInfo, 
  NotificationChannel,
  SendNotificationRequest 
} from '@/types';
import { logger, logPerformance } from '@/utils/logger';
import { config } from '@/config';
import { v4 as uuidv4 } from 'uuid';
import { isWithinInterval, setHours, setMinutes } from 'date-fns';

export class NotificationOrchestrator {
  private database: DatabaseService;
  private templateEngine: TemplateEngine;
  private channelManager: ChannelManager;
  private queueManager: QueueManager;

  constructor(
    database: DatabaseService,
    templateEngine: TemplateEngine,
    channelManager: ChannelManager,
    queueManager: QueueManager
  ) {
    this.database = database;
    this.templateEngine = templateEngine;
    this.channelManager = channelManager;
    this.queueManager = queueManager;
  }

  /**
   * Process notification request and queue deliveries
   */
  async processNotification(request: SendNotificationRequest): Promise<{
    success: boolean;
    requestId: string;
    queuedDeliveries: number;
    skippedChannels: string[];
    processingTime: number;
  }> {
    const startTime = Date.now();
    const requestId = uuidv4();

    try {
      logger.info('Processing notification request', {
        requestId,
        userId: request.userId,
        eventType: request.eventType,
        channels: request.channels,
        priority: request.priority,
      });

      // Get user contact information
      const contactInfo = await this.getUserContactInfo(request.userId);
      if (!contactInfo) {
        throw new Error('User contact information not found');
      }

      // Create notification request record
      const notificationRequest: NotificationRequest = {
        id: requestId,
        userId: request.userId,
        eventType: request.eventType,
        channels: request.channels,
        priority: request.priority,
        data: request.data,
        metadata: request.metadata,
        scheduleAt: request.scheduleAt ? new Date(request.scheduleAt) : undefined,
        expiresAt: request.expiresAt ? new Date(request.expiresAt) : undefined,
        createdAt: new Date(),
      };

      await this.storeNotificationRequest(notificationRequest);

      // Process each channel
      const deliveries: NotificationDelivery[] = [];
      const skippedChannels: string[] = [];

      for (const channel of request.channels) {
        try {
          // Check if channel is available for user
          if (!this.isChannelAvailable(channel, contactInfo)) {
            skippedChannels.push(`${channel}:no_contact_info`);
            continue;
          }

          // Check quiet hours
          if (this.isQuietHours() && !this.isChannelAllowedInQuietHours(channel)) {
            skippedChannels.push(`${channel}:quiet_hours`);
            continue;
          }

          // Render template
          const content = await this.templateEngine.renderNotification(
            request.eventType,
            channel,
            contactInfo.language,
            request.data
          );

          // Create delivery record
          const delivery: NotificationDelivery = {
            id: uuidv4(),
            requestId,
            userId: request.userId,
            channel,
            templateId: content.templateId,
            status: 'pending',
            content: {
              subject: content.subject,
              title: content.title,
              body: content.body,
              recipient: this.getRecipientForChannel(channel, contactInfo),
            },
            attempts: 0,
            metadata: request.metadata,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          deliveries.push(delivery);
        } catch (error) {
          logger.error(`Failed to prepare ${channel} delivery:`, error);
          skippedChannels.push(`${channel}:template_error`);
        }
      }

      // Store deliveries
      if (deliveries.length > 0) {
        await this.storeDeliveries(deliveries);
        
        // Queue deliveries for processing
        for (const delivery of deliveries) {
          await this.queueManager.queueDelivery(delivery, request.priority);
        }
      }

      const processingTime = Date.now() - startTime;

      logPerformance('notification_orchestration', processingTime, {
        requestId,
        userId: request.userId,
        eventType: request.eventType,
        queuedDeliveries: deliveries.length,
        skippedChannels: skippedChannels.length,
      });

      logger.info('Notification request processed successfully', {
        requestId,
        queuedDeliveries: deliveries.length,
        skippedChannels,
        processingTime,
      });

      return {
        success: true,
        requestId,
        queuedDeliveries: deliveries.length,
        skippedChannels,
        processingTime,
      };
    } catch (error) {
      logger.error('Notification processing failed:', error);
      throw error;
    }
  }

  /**
   * Process bulk notification request
   */
  async processBulkNotification(request: {
    userIds: string[];
    eventType: string;
    channels: NotificationChannel[];
    priority: string;
    data: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<{
    success: boolean;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    processingTime: number;
  }> {
    const startTime = Date.now();
    
    try {
      logger.info('Processing bulk notification request', {
        userCount: request.userIds.length,
        eventType: request.eventType,
        channels: request.channels,
      });

      let successfulRequests = 0;
      let failedRequests = 0;

      // Process in batches to avoid overwhelming the system
      const batchSize = config.performance.batchSize;
      
      for (let i = 0; i < request.userIds.length; i += batchSize) {
        const batch = request.userIds.slice(i, i + batchSize);
        const batchPromises = batch.map(async (userId) => {
          try {
            await this.processNotification({
              userId,
              eventType: request.eventType,
              channels: request.channels,
              priority: request.priority as any,
              data: request.data,
              metadata: request.metadata,
            });
            return true;
          } catch (error) {
            logger.error(`Failed to process notification for user ${userId}:`, error);
            return false;
          }
        });

        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result) => {
          if (result.status === 'fulfilled' && result.value) {
            successfulRequests++;
          } else {
            failedRequests++;
          }
        });
      }

      const processingTime = Date.now() - startTime;

      logger.info('Bulk notification processing completed', {
        totalRequests: request.userIds.length,
        successfulRequests,
        failedRequests,
        processingTime,
      });

      return {
        success: failedRequests === 0,
        totalRequests: request.userIds.length,
        successfulRequests,
        failedRequests,
        processingTime,
      };
    } catch (error) {
      logger.error('Bulk notification processing failed:', error);
      throw error;
    }
  }

  /**
   * Get user contact information
   */
  private async getUserContactInfo(userId: string): Promise<ContactInfo | null> {
    const query = `
      SELECT user_id, email, phone, push_tokens, language, timezone, preferences, created_at, updated_at
      FROM contact_info 
      WHERE user_id = $1`;

    try {
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
    } catch (error) {
      logger.error('Failed to get user contact info:', error);
      return null;
    }
  }

  /**
   * Check if channel is available for user
   */
  private isChannelAvailable(channel: NotificationChannel, contactInfo: ContactInfo): boolean {
    // Check user preferences
    if (!contactInfo.preferences[channel]) {
      return false;
    }

    // Check if contact info is available
    switch (channel) {
      case 'push':
        return contactInfo.pushTokens && contactInfo.pushTokens.length > 0;
      case 'sms':
        return !!(contactInfo.phone);
      case 'email':
        return !!(contactInfo.email);
      default:
        return false;
    }
  }

  /**
   * Check if it's currently quiet hours
   */
  private isQuietHours(): boolean {
    if (!config.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const startHour = config.quietHours.startHour;
    const endHour = config.quietHours.endHour;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startHour > endHour) {
      const quietStart = setHours(setMinutes(now, 0), startHour);
      const quietEnd = setHours(setMinutes(now, 0), endHour);
      
      return now >= quietStart || now < quietEnd;
    } else {
      // Same day quiet hours
      const quietStart = setHours(setMinutes(now, 0), startHour);
      const quietEnd = setHours(setMinutes(now, 0), endHour);
      
      return isWithinInterval(now, { start: quietStart, end: quietEnd });
    }
  }

  /**
   * Check if channel is allowed during quiet hours
   */
  private isChannelAllowedInQuietHours(channel: NotificationChannel): boolean {
    return config.quietHours.allowedChannels.includes(channel);
  }

  /**
   * Get recipient identifier for channel
   */
  private getRecipientForChannel(channel: NotificationChannel, contactInfo: ContactInfo): string {
    switch (channel) {
      case 'push':
        return contactInfo.pushTokens[0] || '';
      case 'sms':
        return contactInfo.phone || '';
      case 'email':
        return contactInfo.email || '';
      default:
        return '';
    }
  }

  /**
   * Store notification request
   */
  private async storeNotificationRequest(request: NotificationRequest): Promise<void> {
    const query = `
      INSERT INTO notification_requests (id, user_id, event_type, channels, priority, data, metadata, schedule_at, expires_at, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;

    await this.database.query(query, [
      request.id,
      request.userId,
      request.eventType,
      JSON.stringify(request.channels),
      request.priority,
      JSON.stringify(request.data),
      JSON.stringify(request.metadata || {}),
      request.scheduleAt,
      request.expiresAt,
      request.createdAt,
    ]);
  }

  /**
   * Store notification deliveries
   */
  private async storeDeliveries(deliveries: NotificationDelivery[]): Promise<void> {
    if (deliveries.length === 0) return;

    const values = deliveries.map((delivery, index) => {
      const baseIndex = index * 11;
      return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9}, $${baseIndex + 10}, $${baseIndex + 11})`;
    }).join(', ');

    const query = `
      INSERT INTO notification_deliveries (id, request_id, user_id, channel, template_id, status, content, attempts, metadata, created_at, updated_at)
      VALUES ${values}`;

    const params = deliveries.flatMap(delivery => [
      delivery.id,
      delivery.requestId,
      delivery.userId,
      delivery.channel,
      delivery.templateId,
      delivery.status,
      JSON.stringify(delivery.content),
      delivery.attempts,
      JSON.stringify(delivery.metadata || {}),
      delivery.createdAt,
      delivery.updatedAt,
    ]);

    await this.database.query(query, params);
  }

  /**
   * Update delivery status
   */
  async updateDeliveryStatus(
    deliveryId: string,
    status: NotificationStatus,
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
   * Get notification metrics
   */
  async getNotificationMetrics(
    startDate: Date,
    endDate: Date,
    channel?: NotificationChannel
  ): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    deliveryRate: number;
    averageProcessingTime: number;
    channelBreakdown: Record<string, any>;
  }> {
    let whereClause = 'WHERE created_at >= $1 AND created_at <= $2';
    const params = [startDate, endDate];

    if (channel) {
      whereClause += ' AND channel = $3';
      params.push(channel);
    }

    const query = `
      SELECT 
        channel,
        COUNT(*) as total_sent,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as total_delivered,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as total_failed,
        AVG(EXTRACT(EPOCH FROM (delivered_at - created_at)) * 1000) as avg_processing_time
      FROM notification_deliveries 
      ${whereClause}
      GROUP BY channel`;

    const result = await this.database.query(query, params);
    
    let totalSent = 0;
    let totalDelivered = 0;
    let totalFailed = 0;
    let totalProcessingTime = 0;
    const channelBreakdown: Record<string, any> = {};

    result.rows.forEach((row: any) => {
      const sent = parseInt(row.total_sent);
      const delivered = parseInt(row.total_delivered);
      const failed = parseInt(row.total_failed);
      const avgTime = parseFloat(row.avg_processing_time || '0');

      totalSent += sent;
      totalDelivered += delivered;
      totalFailed += failed;
      totalProcessingTime += avgTime * sent;

      channelBreakdown[row.channel] = {
        sent,
        delivered,
        failed,
        deliveryRate: sent > 0 ? (delivered / sent) * 100 : 0,
        averageProcessingTime: avgTime,
      };
    });

    return {
      totalSent,
      totalDelivered,
      totalFailed,
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      averageProcessingTime: totalSent > 0 ? totalProcessingTime / totalSent : 0,
      channelBreakdown,
    };
  }
}