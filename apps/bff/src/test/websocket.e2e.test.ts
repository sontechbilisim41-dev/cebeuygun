import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { app } from './e2e-setup';
import { io as Client, Socket } from 'socket.io-client';
import jwt from 'jsonwebtoken';

describe('WebSocket E2E Tests', () => {
  let clientSocket: Socket;
  let serverAddress: string;
  let authToken: string;
  
  const mockUser = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    role: 'CUSTOMER',
  };

  beforeEach(async () => {
    await app.listen({ port: 0 });
    const address = app.server.address();
    const port = typeof address === 'string' ? address : address?.port;
    serverAddress = `http://localhost:${port}`;
    
    authToken = jwt.sign(mockUser, process.env.JWT_SECRET!, { expiresIn: '1h' });
  });

  afterEach(async () => {
    if (clientSocket) {
      clientSocket.disconnect();
    }
    await app.close();
  });

  it('should authenticate WebSocket connection', (done) => {
    clientSocket = Client(serverAddress, {
      auth: {
        token: authToken,
      },
    });

    clientSocket.on('connect', () => {
      expect(clientSocket.connected).toBe(true);
      done();
    });

    clientSocket.on('connect_error', (error) => {
      done(error);
    });
  });

  it('should reject unauthenticated connections', (done) => {
    clientSocket = Client(serverAddress);

    clientSocket.on('connect', () => {
      done(new Error('Should not connect without authentication'));
    });

    clientSocket.on('connect_error', (error) => {
      expect(error.message).toBe('Authentication required');
      done();
    });
  });

  it('should reject invalid tokens', (done) => {
    clientSocket = Client(serverAddress, {
      auth: {
        token: 'invalid-token',
      },
    });

    clientSocket.on('connect', () => {
      done(new Error('Should not connect with invalid token'));
    });

    clientSocket.on('connect_error', (error) => {
      expect(error.message).toBe('Invalid token');
      done();
    });
  });

  it('should handle order subscription', (done) => {
    clientSocket = Client(serverAddress, {
      auth: {
        token: authToken,
      },
    });

    clientSocket.on('connect', () => {
      clientSocket.emit('subscribe:orders');
      
      // Simulate order update broadcast
      setTimeout(() => {
        (app as any).broadcastOrderUpdate(
          '123e4567-e89b-12d3-a456-426614174010',
          mockUser.userId,
          {
            status: 'preparing',
            estimatedDeliveryTime: 25,
          }
        );
      }, 100);
    });

    clientSocket.on('order_update', (data) => {
      expect(data).toHaveProperty('orderId', '123e4567-e89b-12d3-a456-426614174010');
      expect(data).toHaveProperty('status', 'preparing');
      expect(data).toHaveProperty('timestamp');
      done();
    });
  });

  it('should handle courier location subscription', (done) => {
    clientSocket = Client(serverAddress, {
      auth: {
        token: authToken,
      },
    });

    const orderId = '123e4567-e89b-12d3-a456-426614174010';

    clientSocket.on('connect', () => {
      clientSocket.emit('subscribe:courier_location', orderId);
      
      // Simulate courier location update
      setTimeout(() => {
        const courierToken = jwt.sign(
          { userId: 'courier-123', role: 'COURIER' },
          process.env.JWT_SECRET!,
          { expiresIn: '1h' }
        );
        
        const courierSocket = Client(serverAddress, {
          auth: { token: courierToken },
        });
        
        courierSocket.on('connect', () => {
          courierSocket.emit('courier:location_update', {
            orderId,
            location: {
              latitude: 41.0082,
              longitude: 28.9784,
            },
          });
        });
      }, 100);
    });

    clientSocket.on('courier_location_update', (data) => {
      expect(data).toHaveProperty('orderId', orderId);
      expect(data).toHaveProperty('location');
      expect(data.location).toHaveProperty('latitude', 41.0082);
      expect(data.location).toHaveProperty('longitude', 28.9784);
      expect(data).toHaveProperty('timestamp');
      done();
    });
  });

  it('should only allow couriers to send location updates', (done) => {
    clientSocket = Client(serverAddress, {
      auth: {
        token: authToken, // Customer token
      },
    });

    const orderId = '123e4567-e89b-12d3-a456-426614174010';

    clientSocket.on('connect', () => {
      clientSocket.emit('courier:location_update', {
        orderId,
        location: {
          latitude: 41.0082,
          longitude: 28.9784,
        },
      });
      
      // Wait a bit to ensure no broadcast happens
      setTimeout(() => {
        done(); // Test passes if no location update is received
      }, 200);
    });

    clientSocket.on('courier_location_update', () => {
      done(new Error('Customer should not be able to send location updates'));
    });
  });

  it('should handle user-specific broadcasts', (done) => {
    clientSocket = Client(serverAddress, {
      auth: {
        token: authToken,
      },
    });

    clientSocket.on('connect', () => {
      // Simulate user-specific broadcast
      setTimeout(() => {
        (app as any).broadcastToUser(mockUser.userId, 'notification', {
          type: 'order_confirmed',
          message: 'Your order has been confirmed',
        });
      }, 100);
    });

    clientSocket.on('notification', (data) => {
      expect(data).toHaveProperty('type', 'order_confirmed');
      expect(data).toHaveProperty('message', 'Your order has been confirmed');
      done();
    });
  });

  it('should handle role-specific broadcasts', (done) => {
    clientSocket = Client(serverAddress, {
      auth: {
        token: authToken,
      },
    });

    clientSocket.on('connect', () => {
      // Simulate role-specific broadcast
      setTimeout(() => {
        (app as any).broadcastToRole('CUSTOMER', 'announcement', {
          title: 'New Feature Available',
          message: 'Check out our new express delivery option',
        });
      }, 100);
    });

    clientSocket.on('announcement', (data) => {
      expect(data).toHaveProperty('title', 'New Feature Available');
      expect(data).toHaveProperty('message', 'Check out our new express delivery option');
      done();
    });
  });
});