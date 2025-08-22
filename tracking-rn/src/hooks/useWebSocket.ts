import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Alert } from 'react-native';

interface CourierLocation {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp: string;
}

interface OrderStatus {
  status: string;
  estimatedArrival?: string;
  notes?: string;
  timestamp: string;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  courierLocation: CourierLocation | null;
  orderStatus: OrderStatus | null;
  connectionError: string | null;
  subscribeToOrder: (orderId: string) => void;
  disconnect: () => void;
}

const WEBSOCKET_URL = 'http://localhost:3001'; // BFF service URL
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE3MDUwNjAwMDAsImV4cCI6MTcwNTE0NjQwMH0.mock-signature';

export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [courierLocation, setCourierLocation] = useState<CourierLocation | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentOrderIdRef = useRef<string | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    console.log('Connecting to WebSocket server...');
    
    const socket = io(WEBSOCKET_URL, {
      auth: {
        token: MOCK_TOKEN,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0;
      
      // Re-subscribe to current order if exists
      if (currentOrderIdRef.current) {
        socket.emit('subscribe:order_location', currentOrderIdRef.current);
        socket.emit('subscribe:order_status', currentOrderIdRef.current);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        setConnectionError('Sunucu bağlantısı kesildi');
      } else if (reason === 'transport close' || reason === 'transport error') {
        setConnectionError('Bağlantı kesildi - yeniden bağlanılıyor...');
        scheduleReconnect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
      setConnectionError(`Bağlantı hatası: ${error.message}`);
      scheduleReconnect();
    });

    // Location updates
    socket.on('courier_location_update', (data: {
      orderId: string;
      location: CourierLocation;
      timestamp: string;
    }) => {
      console.log('Received location update:', data);
      setCourierLocation({
        ...data.location,
        timestamp: data.timestamp,
      });
    });

    // Status updates
    socket.on('order_status_update', (data: OrderStatus) => {
      console.log('Received status update:', data);
      setOrderStatus(data);
      
      // Show notification for important status changes
      if (data.status === 'delivered') {
        Alert.alert('Sipariş Teslim Edildi', 'Siparişiniz başarıyla teslim edilmiştir.');
      } else if (data.status === 'on_the_way') {
        Alert.alert('Kurye Yolda', 'Kuryeniz siparişinizi getirmek için yola çıktı.');
      }
    });

    socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
      setConnectionError(error.message);
    });

    socketRef.current = socket;
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    // Exponential backoff with max delay
    const delay = Math.min(3000 * Math.pow(2, reconnectAttempts.current), 30000);
    reconnectAttempts.current++;
    
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`Attempting to reconnect (attempt ${reconnectAttempts.current})...`);
      connect();
    }, delay);
  }, [connect]);

  const subscribeToOrder = useCallback((orderId: string) => {
    currentOrderIdRef.current = orderId;
    
    if (socketRef.current?.connected) {
      console.log(`Subscribing to order ${orderId}`);
      socketRef.current.emit('subscribe:order_location', orderId);
      socketRef.current.emit('subscribe:order_status', orderId);
    }
    
    // Reset state for new order
    setCourierLocation(null);
    setOrderStatus(null);
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setIsConnected(false);
    setCourierLocation(null);
    setOrderStatus(null);
    setConnectionError(null);
    currentOrderIdRef.current = null;
    reconnectAttempts.current = 0;
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    courierLocation,
    orderStatus,
    connectionError,
    subscribeToOrder,
    disconnect,
  };
};