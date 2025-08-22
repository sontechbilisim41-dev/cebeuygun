import { NotificationChannel, NotificationDelivery, ContactInfo } from '@/types';
import { logger } from '@/utils/logger';

export interface ChannelConfig {
  enabled: boolean;
  rateLimits: {
    maxPerMinute: number;
    maxPerHour: number;
  };
}

export interface DeliveryResult {
  success: boolean;
  messageId?: string;
  error?: string;
  retryable?: boolean;
}

export abstract class BaseNotificationChannel {
  protected channel: NotificationChannel;
  protected config: ChannelConfig;
  protected rateLimiters: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(channel: NotificationChannel, config: ChannelConfig) {
    this.channel = channel;
    this.config = config;
  }

  /**
   * Send notification through this channel
   */
  abstract sendNotification(
    delivery: NotificationDelivery,
    contactInfo: ContactInfo
  ): Promise<DeliveryResult>;

  /**
   * Validate if contact info is sufficient for this channel
   */
  abstract validateContactInfo(contactInfo: ContactInfo): boolean;

  /**
   * Check rate limits for user
   */
  protected checkRateLimit(userId: string): boolean {
    if (!this.config.enabled) {
      return false;
    }

    const now = Date.now();
    const userKey = `${this.channel}:${userId}`;
    const limiter = this.rateLimiters.get(userKey);

    if (!limiter || now > limiter.resetTime) {
      // Reset or create new limiter
      this.rateLimiters.set(userKey, {
        count: 1,
        resetTime: now + 60000, // 1 minute
      });
      return true;
    }

    if (limiter.count >= this.config.rateLimits.maxPerMinute) {
      logger.warn('Rate limit exceeded', {
        channel: this.channel,
        userId,
        count: limiter.count,
        limit: this.config.rateLimits.maxPerMinute,
      });
      return false;
    }

    limiter.count++;
    return true;
  }

  /**
   * Get channel name
   */
  getChannelName(): NotificationChannel {
    return this.channel;
  }

  /**
   * Check if channel is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Clean up expired rate limiters
   */
  cleanupRateLimiters(): void {
    const now = Date.now();
    for (const [key, limiter] of this.rateLimiters.entries()) {
      if (now > limiter.resetTime) {
        this.rateLimiters.delete(key);
      }
    }
  }
}

export { BaseNotificationChannel }