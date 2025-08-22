import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '@/stores/app-store';
import { useOrdersStore } from '@/stores/orders-store';
import type { WebSocketEvent, OrderUpdateEvent, InventoryUpdateEvent } from '@/types';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastConnected: Date | null;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectDelay = 3000,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef(0);

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastConnected: null,
  });

  const { user, addNotification } = useAppStore();
  const { updateOrder } = useOrdersStore();

  const connect = useCallback(() => {
    if (socketRef.current?.connected || state.isConnecting) {
      return;
    }

    if (!user?.sellerId) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3001', {
      auth: {
        token: localStorage.getItem('seller_token'),
        sellerId: user.sellerId,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    // Connection events
    socket.on('connect', () => {
      console.log('WebSocket connected');
      setState({
        isConnected: true,
        isConnecting: false,
        error: null,
        lastConnected: new Date(),
      });
      reconnectCountRef.current = 0;

      // Join seller-specific room
      socket.emit('join_seller_room', user.sellerId);
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
      }));

      // Auto-reconnect for certain disconnect reasons
      if (reason === 'io server disconnect') {
        setState(prev => ({ ...prev, error: 'Server disconnected' }));
      } else if (reason === 'transport close' || reason === 'transport error') {
        scheduleReconnect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: `Connection failed: ${error.message}`,
      }));
      scheduleReconnect();
    });

    // Business event handlers
    socket.on('order_update', (event: OrderUpdateEvent) => {
      console.log('Received order update:', event);
      
      updateOrder(event.data.orderId, {
        status: event.data.status,
        estimatedDeliveryTime: event.data.estimatedDeliveryTime,
        courierId: event.data.courierInfo?.id,
        courierName: event.data.courierInfo?.name,
        courierPhone: event.data.courierInfo?.phone,
        updatedAt: event.timestamp,
      });

      // Show notification for important status changes
      if (['confirmed', 'dispatched', 'delivered', 'cancelled'].includes(event.data.status)) {
        addNotification({
          type: event.data.status === 'cancelled' ? 'warning' : 'info',
          title: 'Sipariş Durumu Güncellendi',
          message: `Sipariş ${event.data.orderId.slice(-8)} durumu: ${getStatusText(event.data.status)}`,
          actionUrl: `/orders/${event.data.orderId}`,
        });
      }
    });

    socket.on('inventory_update', (event: InventoryUpdateEvent) => {
      console.log('Received inventory update:', event);
      
      // Show low stock warning
      if (event.data.newStock <= 5) {
        addNotification({
          type: 'warning',
          title: 'Düşük Stok Uyarısı',
          message: `Ürün stoku kritik seviyede: ${event.data.newStock} adet`,
          actionUrl: `/products/${event.data.productId}`,
        });
      }
    });

    socket.on('bulk_operation_update', (event: any) => {
      console.log('Received bulk operation update:', event);
      
      addNotification({
        type: event.data.status === 'completed' ? 'success' : 
              event.data.status === 'failed' ? 'error' : 'info',
        title: 'Toplu İşlem Güncellendi',
        message: `${event.data.fileName} - ${event.data.status}`,
        actionUrl: '/bulk-operations',
      });
    });

    socket.on('campaign_performance', (event: any) => {
      console.log('Received campaign performance update:', event);
      
      if (event.data.milestone) {
        addNotification({
          type: 'success',
          title: 'Kampanya Başarısı',
          message: `${event.data.campaignName} hedefine ulaştı!`,
          actionUrl: `/campaigns/${event.data.campaignId}`,
        });
      }
    });

    socketRef.current = socket;
  }, [user, addNotification, updateOrder]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectCountRef.current >= reconnectAttempts) {
      setState(prev => ({ 
        ...prev, 
        error: 'Maximum reconnection attempts reached' 
      }));
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delay = reconnectDelay * Math.pow(2, reconnectCountRef.current);
    reconnectCountRef.current++;

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`Attempting to reconnect (${reconnectCountRef.current}/${reconnectAttempts})...`);
      connect();
    }, delay);
  }, [connect, reconnectAttempts, reconnectDelay]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setState({
      isConnected: false,
      isConnecting: false,
      error: null,
      lastConnected: null,
    });
    reconnectCountRef.current = 0;
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && user?.sellerId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, user?.sellerId, connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    emit,
  };
};

// Helper function for status text
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Beklemede',
    confirmed: 'Onaylandı',
    preparing: 'Hazırlanıyor',
    ready: 'Hazır',
    dispatched: 'Yola Çıktı',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal Edildi',
  };
  return statusMap[status] || status;
}