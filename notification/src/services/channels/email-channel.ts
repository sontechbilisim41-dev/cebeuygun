import { BaseNotificationChannel, DeliveryResult } from './base-channel';
import { NotificationDelivery, ContactInfo } from '@/types';
import { config } from '@/config';
import { logger, deliveryLogger } from '@/utils/logger';
import sgMail from '@sendgrid/mail';
import AWS from 'aws-sdk';

export class EmailChannel extends BaseNotificationChannel {
  private ses: AWS.SES | null = null;

  constructor() {
    super('email', {
      enabled: config.channels.email.enabled,
      rateLimits: config.rateLimiting.email,
    });

    this.initializeEmailProvider();
  }

  private initializeEmailProvider(): void {
    if (!this.config.enabled) {
      logger.info('Email notifications disabled');
      return;
    }

    try {
      if (config.nodeEnv === 'test' || config.channels.email.sendgridApiKey === 'mock') {
        logger.info('Using mock email provider for testing');
        return;
      }

      if (config.channels.email.provider === 'sendgrid') {
        sgMail.setApiKey(config.channels.email.sendgridApiKey);
        logger.info('SendGrid email client initialized');
      } else if (config.channels.email.provider === 'ses') {
        this.ses = new AWS.SES({
          region: config.channels.email.sesRegion,
          accessKeyId: config.channels.email.sesAccessKeyId,
          secretAccessKey: config.channels.email.sesSecretAccessKey,
        });
        logger.info('AWS SES email client initialized');
      }
    } catch (error) {
      logger.error('Failed to initialize email provider:', error);
      this.config.enabled = false;
    }
  }

  async sendNotification(delivery: NotificationDelivery, contactInfo: ContactInfo): Promise<DeliveryResult> {
    const startTime = Date.now();

    try {
      if (!this.config.enabled) {
        return { success: false, error: 'Email notifications not configured', retryable: false };
      }

      if (!this.validateContactInfo(contactInfo)) {
        return { success: false, error: 'No valid email address', retryable: false };
      }

      if (!this.checkRateLimit(contactInfo.userId)) {
        return { success: false, error: 'Email rate limit exceeded', retryable: true };
      }

      // Mock email sending for development/testing
      if (config.nodeEnv === 'test' || config.channels.email.sendgridApiKey === 'mock') {
        return this.sendMockEmail(delivery, contactInfo, startTime);
      }

      // Send real email
      if (config.channels.email.provider === 'sendgrid') {
        return this.sendViaSendGrid(delivery, contactInfo, startTime);
      } else if (config.channels.email.provider === 'ses') {
        return this.sendViaSES(delivery, contactInfo, startTime);
      }

      return { success: false, error: 'No email provider configured', retryable: false };
    } catch (error) {
      logger.error('Email sending failed:', error);
      
      return {
        success: false,
        error: error.message,
        retryable: this.isRetryableError(error),
      };
    }
  }

  validateContactInfo(contactInfo: ContactInfo): boolean {
    return !!(contactInfo.email && this.isValidEmail(contactInfo.email));
  }

  /**
   * Send email via SendGrid
   */
  private async sendViaSendGrid(
    delivery: NotificationDelivery,
    contactInfo: ContactInfo,
    startTime: number
  ): Promise<DeliveryResult> {
    const msg = {
      to: contactInfo.email!,
      from: {
        email: config.channels.email.fromEmail,
        name: config.channels.email.fromName,
      },
      subject: delivery.content.subject || 'Cebeuygun Bildirimi',
      html: delivery.content.body,
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
      },
      customArgs: {
        delivery_id: delivery.id,
        user_id: contactInfo.userId,
        event_type: delivery.requestId,
      },
    };

    const response = await sgMail.send(msg);
    const messageId = response[0].headers['x-message-id'];

    deliveryLogger.info('Email sent via SendGrid', {
      deliveryId: delivery.id,
      userId: contactInfo.userId,
      messageId,
      to: contactInfo.email,
      subject: delivery.content.subject,
      processingTime: Date.now() - startTime,
    });

    return {
      success: true,
      messageId,
    };
  }

  /**
   * Send email via AWS SES
   */
  private async sendViaSES(
    delivery: NotificationDelivery,
    contactInfo: ContactInfo,
    startTime: number
  ): Promise<DeliveryResult> {
    if (!this.ses) {
      throw new Error('SES client not initialized');
    }

    const params = {
      Source: `${config.channels.email.fromName} <${config.channels.email.fromEmail}>`,
      Destination: {
        ToAddresses: [contactInfo.email!],
      },
      Message: {
        Subject: {
          Data: delivery.content.subject || 'Cebeuygun Bildirimi',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: delivery.content.body,
            Charset: 'UTF-8',
          },
        },
      },
      Tags: [
        { Name: 'delivery_id', Value: delivery.id },
        { Name: 'user_id', Value: contactInfo.userId },
        { Name: 'event_type', Value: delivery.requestId },
      ],
    };

    const response = await this.ses.sendEmail(params).promise();

    deliveryLogger.info('Email sent via SES', {
      deliveryId: delivery.id,
      userId: contactInfo.userId,
      messageId: response.MessageId,
      to: contactInfo.email,
      subject: delivery.content.subject,
      processingTime: Date.now() - startTime,
    });

    return {
      success: true,
      messageId: response.MessageId,
    };
  }

  /**
   * Send mock email for testing
   */
  private async sendMockEmail(
    delivery: NotificationDelivery,
    contactInfo: ContactInfo,
    startTime: number
  ): Promise<DeliveryResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 150));

    const messageId = `mock_email_${Date.now()}`;

    deliveryLogger.info('Mock email sent', {
      deliveryId: delivery.id,
      userId: contactInfo.userId,
      messageId,
      to: contactInfo.email,
      subject: delivery.content.subject,
      body: delivery.content.body.substring(0, 100) + '...',
      processingTime: Date.now() - startTime,
    });

    return {
      success: true,
      messageId,
    };
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (error.code) {
      const nonRetryableErrors = [
        'MessageRejected',
        'InvalidParameterValue',
        'InvalidDestination',
      ];
      return !nonRetryableErrors.includes(error.code);
    }

    return true;
  }
}