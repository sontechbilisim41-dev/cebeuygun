import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiClient } from './apiClient';
import { mockNotificationService } from './mockData/mockNotificationService';
import { Notification } from '@/types';
import { store } from '@/store';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  private get useMockData(): boolean {
    return store.getState().settings.useMockData;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permission denied');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('orders', {
          name: 'Order Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#667eea',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('earnings', {
          name: 'Earnings Notifications',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
          lightColor: '#2ed573',
        });
      }

      return true;
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  }

  async registerForPushNotifications(): Promise<string> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Notification permission required');
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      console.log('Push token:', token.data);

      // Register token with backend
      if (!this.useMockData) {
        await apiClient.post('/notifications/register-token', {
          token: token.data,
          platform: Platform.OS,
        });
      }

      return token.data;
    } catch (error) {
      console.error('Push notification registration error:', error);
      throw error;
    }
  }

  async getNotifications(params: { page?: number; limit?: number } = {}): Promise<Notification[]> {
    if (this.useMockData) {
      return mockNotificationService.getNotifications(params);
    }

    const response = await apiClient.get('/notifications', { params });
    return response.data;
  }

  async markAsRead(notificationId: string): Promise<void> {
    if (this.useMockData) {
      return mockNotificationService.markAsRead(notificationId);
    }

    await apiClient.put(`/notifications/${notificationId}/read`);
  }

  async markAllAsRead(): Promise<void> {
    if (this.useMockData) {
      return mockNotificationService.markAllAsRead();
    }

    await apiClient.put('/notifications/read-all');
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: trigger || null,
      });

      return notificationId;
    } catch (error) {
      console.error('Schedule notification error:', error);
      throw error;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Cancel notification error:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Cancel all notifications error:', error);
    }
  }

  async showOrderNotification(order: any): Promise<void> {
    const state = store.getState();
    const settings = state.settings;

    if (!settings.notificationsEnabled) {
      return;
    }

    await this.scheduleLocalNotification(
      'Yeni Sipariş!',
      `${order.restaurantName} - ${order.totalAmount.amount / 100}₺`,
      { orderId: order.id, type: 'new_order' },
      null
    );

    // Vibrate if enabled
    if (settings.vibrationEnabled && Platform.OS === 'ios') {
      // Haptic feedback for iOS
      // For Android, vibration is handled by notification channel
    }
  }

  async showDeliveryReminderNotification(order: any): Promise<void> {
    await this.scheduleLocalNotification(
      'Teslimat Hatırlatması',
      `${order.customerName} - ${order.deliveryAddress.address}`,
      { orderId: order.id, type: 'delivery_reminder' },
      { seconds: 300 } // 5 minutes
    );
  }

  async showEarningsNotification(amount: number, currency: string): Promise<void> {
    await this.scheduleLocalNotification(
      'Ödeme Alındı!',
      `${(amount / 100).toFixed(2)} ${currency} hesabınıza yatırıldı`,
      { type: 'earnings_received' },
      null
    );
  }

  // Handle incoming push notifications
  setupNotificationListeners(): {
    notificationListener: Notifications.Subscription;
    responseListener: Notifications.Subscription;
  } {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      
      // Handle notification based on type
      const data = notification.request.content.data;
      if (data?.type === 'new_order') {
        // Handle new order notification
        this.handleNewOrderNotification(data);
      }
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      
      // Handle notification tap
      const data = response.notification.request.content.data;
      if (data?.orderId) {
        // Navigate to order details
        // This would be handled by the navigation service
      }
    });

    return { notificationListener, responseListener };
  }

  private handleNewOrderNotification(data: any): void {
    // This would trigger app state updates
    // For example, refresh available orders
    console.log('Handling new order notification:', data);
  }

  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Get badge count error:', error);
      return 0;
    }
  }

  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Set badge count error:', error);
    }
  }
}

export const notificationService = new NotificationService();