import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectAccessToken, selectCourier } from '@/store/slices/authSlice';
import { selectUseMockData } from '@/store/slices/settingsSlice';
import { addNewOrder, updateOrderInList } from '@/store/slices/ordersSlice';
import { addNotification } from '@/store/slices/notificationSlice';
import { WebSocketMessage } from '@/types';

interface UseWebSocketReturn {
  isConnected: boolean;
  error: string | null;
  sendMessage: (message: any) => void;
  reconnect: () => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const courier = useAppSelector(selectCourier);
  const useMockData = useAppSelector(selectUseMockData);
  
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000);

  const connect = useCallback(() => {
    if (!accessToken || !courier || useMockData) {
      return;
    }

    try {
      const wsUrl = `wss://api.courierapp.com/ws?token=${accessToken}&courierId=${courier.id}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        reconnectDelay.current = 1000;

        // Start heartbeat
        startHeartbeat();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error');
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        stopHeartbeat();

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          scheduleReconnect();
        }
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setError('Failed to connect');
    }
  }, [accessToken, courier, useMockData]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    
    stopHeartbeat();
    clearReconnectTimeout();
    setIsConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [disconnect, connect]);

  const scheduleReconnect = useCallback(() => {
    clearReconnectTimeout();
    
    reconnectAttempts.current += 1;
    
    console.log(`Scheduling reconnect attempt ${reconnectAttempts.current} in ${reconnectDelay.current}ms`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
      reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000); // Max 30 seconds
    }, reconnectDelay.current);
  }, [connect]);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    stopHeartbeat();
    
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // 30 seconds
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }, []);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    console.log('WebSocket message received:', message);

    switch (message.type) {
      case 'order_assigned':
        // New order assigned
        dispatch(addNewOrder(message.payload));
        dispatch(addNotification({
          id: `notif-${Date.now()}`,
          type: 'order_assigned',
          title: 'Yeni Sipariş!',
          message: `${message.payload.restaurantName} - ${(message.payload.totalAmount.amount / 100).toFixed(2)}₺`,
          data: { orderId: message.payload.id },
          isRead: false,
          createdAt: new Date().toISOString(),
        }));
        break;

      case 'order_cancelled':
        // Order cancelled
        dispatch(updateOrderInList(message.payload));
        dispatch(addNotification({
          id: `notif-${Date.now()}`,
          type: 'order_cancelled',
          title: 'Sipariş İptal Edildi',
          message: `${message.payload.restaurantName} siparişi iptal edildi`,
          data: { orderId: message.payload.id },
          isRead: false,
          createdAt: new Date().toISOString(),
        }));
        break;

      case 'order_updated':
        // Order status updated
        dispatch(updateOrderInList(message.payload));
        break;

      case 'location_update':
        // Location update request
        // This could trigger a location update
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }, [dispatch]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground
        if (accessToken && courier && !useMockData && !isConnected) {
          connect();
        }
      } else if (nextAppState === 'background') {
        // App went to background - keep connection alive
        // WebSocket should continue working in background
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [accessToken, courier, useMockData, isConnected, connect]);

  // Connect when dependencies are ready
  useEffect(() => {
    if (accessToken && courier && !useMockData) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [accessToken, courier, useMockData, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
      clearReconnectTimeout();
    };
  }, [disconnect, clearReconnectTimeout]);

  return {
    isConnected,
    error,
    sendMessage,
    reconnect,
  };
};