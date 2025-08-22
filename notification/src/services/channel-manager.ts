import { BaseNotificationChannel } from './channels/base-channel';
import { PushNotificationChannel } from './channels/push-channel';
import { SMSChannel } from './channels/sms-channel';
import { EmailChannel } from './channels/email-channel';
import { NotificationChannel, NotificationDelivery, ContactInfo } from '@/types';
import { logger } from '@/utils/logger';

export class ChannelManager {
  private channels: Map<NotificationChannel, BaseNotificationChannel> = new Map();

  constructor() {
    this.initializeChannels();
  }

  /**
   * Initialize all notification channels
   */
  private initializeChannels(): void {
    try {
      // Initialize push notifications
      const pushChannel = new PushNotificationChannel();
      this.channels.set('push', pushChannel);

      // Initialize SMS
      const smsChannel = new SMSChannel();
      this.channels.set('sms', smsChannel);

      // Initialize email
      const emailChannel = new EmailChannel();
      this.channels.set('email', emailChannel);

      logger.info('Notification channels initialized', {
        enabledChannels: Array.from(this.channels.entries())
          .filter(([_, channel]) => channel.isEnabled())
          .map(([name, _]) => name),
      });
    } catch (error) {
      logger.error('Failed to initialize notification channels:', error);
      throw error;
    }
  }

  /**
   * Send notification through specific channel
   */
  async sendNotification(
    channel: NotificationChannel,
    delivery: NotificationDelivery,
    contactInfo: ContactInfo
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
    retryable?: boolean;
  }> {
    const channelInstance = this.channels.get(channel);
    
    if (!channelInstance) {
      return {
        success: false,
        error: `Channel ${channel} not available`,
        retryable: false,
      };
    }

    if (!channelInstance.isEnabled()) {
      return {
        success: false,
        error: `Channel ${channel} is disabled`,
        retryable: false,
      };
    }

    try {
      const result = await channelInstance.sendNotification(delivery, contactInfo);
      
      logger.debug('Channel delivery result', {
        channel,
        deliveryId: delivery.id,
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      });

      return result;
    } catch (error) {
      logger.error(`Channel ${channel} delivery failed:`, error);
      return {
        success: false,
        error: error.message,
        retryable: true,
      };
    }
  }

  /**
   * Validate contact info for channel
   */
  validateContactInfo(channel: NotificationChannel, contactInfo: ContactInfo): boolean {
    const channelInstance = this.channels.get(channel);
    return channelInstance ? channelInstance.validateContactInfo(contactInfo) : false;
  }

  /**
   * Get all enabled channels
   */
  getEnabledChannels(): NotificationChannel[] {
    return Array.from(this.channels.entries())
      .filter(([_, channel]) => channel.isEnabled())
      .map(([name, _]) => name);
  }

  /**
   * Get channel health status
   */
  getChannelHealth(): Record<NotificationChannel, { enabled: boolean; healthy: boolean }> {
    const health: Record<string, { enabled: boolean; healthy: boolean }> = {};

    for (const [name, channel] of this.channels.entries()) {
      health[name] = {
        enabled: channel.isEnabled(),
        healthy: true, // Could implement actual health checks
      };
    }

    return health as Record<NotificationChannel, { enabled: boolean; healthy: boolean }>;
  }

  /**
   * Cleanup rate limiters across all channels
   */
  cleanupRateLimiters(): void {
    for (const [_, channel] of this.channels.entries()) {
      channel.cleanupRateLimiters();
    }
  }
}