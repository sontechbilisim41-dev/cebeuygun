import { Notification } from '@/types';

const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'order_assigned',
    title: 'Yeni Sipariş!',
    message: 'Pizza Palace\'tan yeni bir sipariş atandı. 61₺ - 5.2km',
    data: { orderId: 'order-001' },
    isRead: false,
    createdAt: '2024-01-20T18:15:00Z',
  },
  {
    id: 'notif-002',
    type: 'payment_received',
    title: 'Ödeme Alındı',
    message: 'Bugünkü kazancınız hesabınıza yatırıldı: 245.50₺',
    data: { amount: 24550, currency: 'TRY' },
    isRead: false,
    createdAt: '2024-01-20T17:30:00Z',
  },
  {
    id: 'notif-003',
    type: 'system_message',
    title: 'Sistem Güncellemesi',
    message: 'Uygulama yeni özelliklerle güncellendi. Yenilikleri keşfedin!',
    data: { version: '1.2.0' },
    isRead: true,
    createdAt: '2024-01-20T16:00:00Z',
  },
  {
    id: 'notif-004',
    type: 'order_cancelled',
    title: 'Sipariş İptal Edildi',
    message: 'Burger House siparişi müşteri tarafından iptal edildi.',
    data: { orderId: 'order-002' },
    isRead: true,
    createdAt: '2024-01-20T15:45:00Z',
  },
  {
    id: 'notif-005',
    type: 'system_message',
    title: 'Haftalık Özet',
    message: 'Bu hafta 23 sipariş tamamladınız ve 1,247₺ kazandınız!',
    data: { weeklyStats: { orders: 23, earnings: 124700 } },
    isRead: true,
    createdAt: '2024-01-19T20:00:00Z',
  },
];

class MockNotificationService {
  async getNotifications(params: { page?: number; limit?: number } = {}): Promise<Notification[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const { page = 1, limit = 20 } = params;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return mockNotifications.slice(startIndex, endIndex);
  }

  async markAsRead(notificationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  async markAllAsRead(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    mockNotifications.forEach(notification => {
      notification.isRead = true;
    });
  }

  async createMockNotification(type: Notification['type'], title: string, message: string, data?: any): Promise<Notification> {
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      type,
      title,
      message,
      data,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    mockNotifications.unshift(notification);
    return notification;
  }

  async simulateNewOrderNotification(): Promise<void> {
    await this.createMockNotification(
      'order_assigned',
      'Yeni Sipariş!',
      `${['Pizza Palace', 'Burger House', 'Sushi Tokyo'][Math.floor(Math.random() * 3)]} - ${Math.floor(Math.random() * 50 + 20)}₺`,
      { orderId: `order-${Date.now()}` }
    );
  }

  async simulatePaymentNotification(): Promise<void> {
    const amount = Math.floor(Math.random() * 20000 + 5000); // 50-250₺
    await this.createMockNotification(
      'payment_received',
      'Ödeme Alındı',
      `Hesabınıza ${(amount / 100).toFixed(2)}₺ yatırıldı`,
      { amount, currency: 'TRY' }
    );
  }

  getUnreadCount(): number {
    return mockNotifications.filter(n => !n.isRead).length;
  }
}

export const mockNotificationService = new MockNotificationService();