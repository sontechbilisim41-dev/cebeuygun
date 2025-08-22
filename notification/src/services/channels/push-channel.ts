import admin from 'firebase-admin';
import { BaseNotificationChannel, DeliveryResult } from './base-channel';
import { NotificationDelivery, ContactInfo } from '@/types';
import { config } from '@/config';
import { logger, deliveryLogger } from '@/utils/logger';

export class PushNotificationChannel extends BaseNotificationChannel {
  private firebaseApp: admin.app.App | null = null;

  constructor() {
    super('push', {
      enabled: config.channels.fcm.enabled,
      rateLimits: config.rateLimiting.push,
    });

    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    if (!this.config.enabled) {
      logger.info('FCM push notifications disabled');
      return;
    }

    try {
      // Initialize Firebase Admin SDK
      if (config.nodeEnv === 'test') {
        // Mock for testing
        logger.info('Using mock FCM for testing');
        return;
      }

      const serviceAccount = require(config.channels.fcm.serviceAccountPath);
      
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: config.channels.fcm.projectId,
      }, 'notification-service');

      logger.info('Firebase Admin SDK initialized for push notifications');
    } catch (error) {
      logger.error('Failed to initialize Firebase Admin SDK:', error);
      this.config.enabled = false;
    }
  }

  async sendNotification(delivery: NotificationDelivery, contactInfo: ContactInfo): Promise<DeliveryResult> {
    const startTime = Date.now();

    try {
      if (!this.config.enabled || !this.firebaseApp) {
        return { success: false, error: 'Push notifications not configured', retryable: false };
      }

      if (!this.validateContactInfo(contactInfo)) {
        return { success: false, error: 'No valid push tokens', retryable: false };
      }

      if (!this.checkRateLimit(contactInfo.userId)) {
        return { success: false, error: 'Rate limit exceeded', retryable: true };
      }

      // Prepare FCM message
      const message: admin.messaging.MulticastMessage = {
        tokens: contactInfo.pushTokens,
        notification: {
          title: delivery.content.title || 'Cebeuygun',
          body: delivery.content.body,
        },
        data: {
          event_type: delivery.requestId,
          order_id: delivery.metadata?.orderId || '',
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'order_updates',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: delivery.content.title || 'Cebeuygun',
                body: delivery.content.body,
              },
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      // Send message
      const response = await admin.messaging(this.firebaseApp).sendMulticast(message);

      // Process results
      const successCount = response.successCount;
      const failureCount = response.failureCount;

      if (successCount > 0) {
        deliveryLogger.info('Push notification sent successfully', {
          deliveryId: delivery.id,
          userId: contactInfo.userId,
          successCount,
          failureCount,
          tokens: contactInfo.pushTokens.length,
          processingTime: Date.now() - startTime,
        });

        return {
          success: true,
          messageId: response.responses[0]?.messageId,
        };
      } else {
        const firstError = response.responses[0]?.error;
        logger.warn('Push notification failed', {
          deliveryId: delivery.id,
          error: firstError?.message,
          errorCode: firstError?.code,
        });

        return {
          success: false,
          error: firstError?.message || 'Unknown FCM error',
          retryable: this.isRetryableError(firstError?.code),
        };
      }
    } catch (error) {
      logger.error('Push notification sending failed:', error);
      return {
        success: false,
        error: error.message,
        retryable: true,
      };
    }
  }

  validateContactInfo(contactInfo: ContactInfo): boolean {
    return contactInfo.pushTokens && contactInfo.pushTokens.length > 0;
  }

  /**
   * Check if FCM error is retryable
   */
  private isRetryableError(errorCode?: string): boolean {
    const retryableErrors = [
      'messaging/internal-error',
      'messaging/server-unavailable',
      'messaging/quota-exceeded',
    ];
    
    return errorCode ? retryableErrors.includes(errorCode) : true;
  }

  /**
   * Clean up invalid tokens
   */
  async cleanupInvalidTokens(userId: string, invalidTokens: string[]): Promise<void> {
    if (invalidTokens.length === 0) return;

    try {
      // Remove invalid tokens from user's contact info
      const query = `
        UPDATE contact_info 
        SET push_tokens = array_remove_multiple(push_tokens, $1),
            updated_at = NOW()
        WHERE user_id = $2`;

      await this.database.query(query, [invalidTokens, userId]);

      logger.info('Cleaned up invalid push tokens', {
        userId,
        removedTokens: invalidTokens.length,
      });
    } catch (error) {
      logger.error('Failed to cleanup invalid tokens:', error);
    }
  }
}