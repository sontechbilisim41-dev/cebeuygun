import { BaseNotificationChannel, DeliveryResult } from './base-channel';
import { NotificationDelivery, ContactInfo } from '@/types';
import { config } from '@/config';
import { logger, deliveryLogger } from '@/utils/logger';
import { Twilio } from 'twilio';

export class SMSChannel extends BaseNotificationChannel {
  private twilioClient: Twilio | null = null;

  constructor() {
    super('sms', {
      enabled: config.channels.sms.enabled,
      rateLimits: config.rateLimiting.sms,
    });

    this.initializeTwilio();
  }

  private initializeTwilio(): void {
    if (!this.config.enabled) {
      logger.info('SMS notifications disabled');
      return;
    }

    try {
      if (config.nodeEnv === 'test' || config.channels.sms.twilioAccountSid === 'mock') {
        logger.info('Using mock SMS provider for testing');
        return;
      }

      this.twilioClient = new Twilio(
        config.channels.sms.twilioAccountSid,
        config.channels.sms.twilioAuthToken
      );

      logger.info('Twilio SMS client initialized');
    } catch (error) {
      logger.error('Failed to initialize Twilio client:', error);
      this.config.enabled = false;
    }
  }

  async sendNotification(delivery: NotificationDelivery, contactInfo: ContactInfo): Promise<DeliveryResult> {
    const startTime = Date.now();

    try {
      if (!this.config.enabled) {
        return { success: false, error: 'SMS notifications not configured', retryable: false };
      }

      if (!this.validateContactInfo(contactInfo)) {
        return { success: false, error: 'No valid phone number', retryable: false };
      }

      if (!this.checkRateLimit(contactInfo.userId)) {
        return { success: false, error: 'SMS rate limit exceeded', retryable: true };
      }

      // Mock SMS sending for development/testing
      if (!this.twilioClient || config.nodeEnv === 'test') {
        return this.sendMockSMS(delivery, contactInfo, startTime);
      }

      // Send real SMS via Twilio
      const message = await this.twilioClient.messages.create({
        body: delivery.content.body,
        from: config.channels.sms.twilioFromNumber,
        to: contactInfo.phone!,
      });

      deliveryLogger.info('SMS sent successfully', {
        deliveryId: delivery.id,
        userId: contactInfo.userId,
        messageId: message.sid,
        to: contactInfo.phone,
        processingTime: Date.now() - startTime,
      });

      return {
        success: true,
        messageId: message.sid,
      };
    } catch (error) {
      logger.error('SMS sending failed:', error);
      
      return {
        success: false,
        error: error.message,
        retryable: this.isRetryableError(error),
      };
    }
  }

  validateContactInfo(contactInfo: ContactInfo): boolean {
    return !!(contactInfo.phone && this.isValidPhoneNumber(contactInfo.phone));
  }

  /**
   * Send mock SMS for testing
   */
  private async sendMockSMS(
    delivery: NotificationDelivery,
    contactInfo: ContactInfo,
    startTime: number
  ): Promise<DeliveryResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const messageId = `mock_sms_${Date.now()}`;

    deliveryLogger.info('Mock SMS sent', {
      deliveryId: delivery.id,
      userId: contactInfo.userId,
      messageId,
      to: contactInfo.phone,
      body: delivery.content.body.substring(0, 50) + '...',
      processingTime: Date.now() - startTime,
    });

    return {
      success: true,
      messageId,
    };
  }

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Turkish phone number validation
    const turkishPhoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
    return turkishPhoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (!error.code) return true;

    const nonRetryableErrors = [
      21211, // Invalid phone number
      21614, // Phone number not verified
      21408, // Permission denied
    ];

    return !nonRetryableErrors.includes(error.code);
  }

  /**
   * Format phone number for Twilio
   */
  private formatPhoneNumber(phone: string): string {
    // Remove spaces and format for Turkish numbers
    const cleaned = phone.replace(/\s/g, '');
    
    if (cleaned.startsWith('0')) {
      return '+90' + cleaned.substring(1);
    } else if (cleaned.startsWith('5')) {
      return '+90' + cleaned;
    } else if (cleaned.startsWith('+90')) {
      return cleaned;
    }
    
    return phone;
  }
}