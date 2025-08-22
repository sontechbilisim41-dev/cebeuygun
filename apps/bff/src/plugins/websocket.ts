import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import { config } from '@/config/index';
import { logger } from '@/utils/logger';
import { JWTPayload } from '@/types';

declare module 'fastify' {
  interface FastifyInstance {
    io: SocketIOServer;
    redisSubscriber: any;
    redisPublisher: any;
  }
}

interface LocationUpdate {
  orderId: string;
  courierId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp: string;
}

interface OrderStatusUpdate {
  orderId: string;
  status: string;
  estimatedArrival?: string;
  notes?: string;
  timestamp: string;
}

const websocketPlugin: FastifyPluginAsync = async (fastify) => {
  // Initialize Redis clients for pub/sub
  const redisSubscriber = createClient({ url: config.redis.url });
  const redisPublisher = createClient({ url: config.redis.url });
  
  await redisSubscriber.connect();
  await redisPublisher.connect();
  
  fastify.decorate('redisSubscriber', redisSubscriber);
  fastify.decorate('redisPublisher', redisPublisher);

  const io = new SocketIOServer(fastify.server, {
    cors: {
      origin: config.cors.origins,
      credentials: true,
    },
    pingTimeout: config.websocket.pingTimeout,
    pingInterval: config.websocket.pingInterval,
    transports: ['websocket', 'polling'],
    allowEIO3: true,
  });

  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Redis subscription for location updates
  redisSubscriber.subscribe('courier:location:*', (message, channel) => {
    try {
      const locationUpdate: LocationUpdate = JSON.parse(message);
      const orderId = locationUpdate.orderId;
      
      // Broadcast to customers tracking this order
      io.to(`order:${orderId}:location`).emit('courier_location_update', {
        orderId,
        location: {
          latitude: locationUpdate.latitude,
          longitude: locationUpdate.longitude,
          heading: locationUpdate.heading,
          speed: locationUpdate.speed,
          accuracy: locationUpdate.accuracy,
        },
        timestamp: locationUpdate.timestamp,
      });
      
      logger.debug(`Broadcasted location update for order ${orderId}`, {
        latitude: locationUpdate.latitude,
        longitude: locationUpdate.longitude,
      });
    } catch (error) {
      logger.error('Failed to process location update:', error);
    }
  });

  // Redis subscription for order status updates
  redisSubscriber.subscribe('order:status:*', (message, channel) => {
    try {
      const statusUpdate: OrderStatusUpdate = JSON.parse(message);
      const orderId = statusUpdate.orderId;
      
      // Broadcast to all subscribers of this order
      io.to(`order:${orderId}:status`).emit('order_status_update', statusUpdate);
      
      logger.debug(`Broadcasted status update for order ${orderId}`, {
        status: statusUpdate.status,
      });
    } catch (error) {
      logger.error('Failed to process status update:', error);
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    const user = socket.data.user as JWTPayload;
    logger.info(`User connected: ${user.userId} (${user.role})`);

    // Join user-specific room
    socket.join(`user:${user.userId}`);
    
    // Join role-specific room
    socket.join(`role:${user.role.toLowerCase()}`);

    // Subscribe to order location tracking (customers)
    socket.on('subscribe:order_location', (orderId: string) => {
      if (user.role === 'CUSTOMER') {
        socket.join(`order:${orderId}:location`);
        logger.debug(`Customer ${user.userId} subscribed to location updates for order ${orderId}`);
        
        // Send current location if available
        fastify.redisSubscriber.get(`order:${orderId}:current_location`).then((locationData) => {
          if (locationData) {
            const location = JSON.parse(locationData);
            socket.emit('courier_location_update', {
              orderId,
              location,
              timestamp: new Date().toISOString(),
            });
          }
        }).catch((error) => {
          logger.warn('Failed to get current location:', error);
        });
      }
    });

    // Subscribe to order status updates
    socket.on('subscribe:order_status', (orderId: string) => {
      socket.join(`order:${orderId}:status`);
      logger.debug(`User ${user.userId} subscribed to status updates for order ${orderId}`);
      
      // Send current status if available
      fastify.redisSubscriber.get(`order:${orderId}:current_status`).then((statusData) => {
        if (statusData) {
          const status = JSON.parse(statusData);
          socket.emit('order_status_update', status);
        }
      }).catch((error) => {
        logger.warn('Failed to get current status:', error);
      });
    });

    // Handle courier location updates (couriers only)
    socket.on('courier:location_update', async (data: {
      orderId: string;
      latitude: number;
      longitude: number;
      heading?: number;
      speed?: number;
      accuracy?: number;
    }) => {
      if (user.role === 'COURIER') {
        try {
          const locationUpdate: LocationUpdate = {
            orderId: data.orderId,
            courierId: user.userId,
            latitude: data.latitude,
            longitude: data.longitude,
            heading: data.heading,
            speed: data.speed,
            accuracy: data.accuracy,
            timestamp: new Date().toISOString(),
          };
          
          // Publish to Redis for distribution
          await fastify.redisPublisher.publish(
            `courier:location:${data.orderId}`,
            JSON.stringify(locationUpdate)
          );
          
          // Cache current location
          await fastify.redisPublisher.setEx(
            `order:${data.orderId}:current_location`,
            300, // 5 minutes
            JSON.stringify({
              latitude: data.latitude,
              longitude: data.longitude,
              heading: data.heading,
              speed: data.speed,
              accuracy: data.accuracy,
            })
          );
          
          logger.debug(`Courier ${user.userId} updated location for order ${data.orderId}`);
        } catch (error) {
          logger.error('Failed to process courier location update:', error);
          socket.emit('error', { message: 'Failed to update location' });
        }
      }
    });

    // Handle order status updates (sellers, couriers, admin)
    socket.on('order:status_update', async (data: {
      orderId: string;
      status: string;
      estimatedArrival?: string;
      notes?: string;
    }) => {
      if (['SELLER', 'COURIER', 'ADMIN'].includes(user.role)) {
        try {
          const statusUpdate: OrderStatusUpdate = {
            orderId: data.orderId,
            status: data.status,
            estimatedArrival: data.estimatedArrival,
            notes: data.notes,
            timestamp: new Date().toISOString(),
          };
          
          // Publish to Redis for distribution
          await fastify.redisPublisher.publish(
            `order:status:${data.orderId}`,
            JSON.stringify(statusUpdate)
          );
          
          // Cache current status
          await fastify.redisPublisher.setEx(
            `order:${data.orderId}:current_status`,
            3600, // 1 hour
            JSON.stringify(statusUpdate)
          );
          
          logger.debug(`User ${user.userId} updated status for order ${data.orderId} to ${data.status}`);
        } catch (error) {
          logger.error('Failed to process status update:', error);
          socket.emit('error', { message: 'Failed to update status' });
        }
      }
    });

    // Handle disconnection cleanup
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${user.userId}`);
      
      // Clean up any courier-specific data if needed
      if (user.role === 'COURIER') {
        // Mark courier as potentially offline after disconnect
        // This could trigger a background job to check courier status
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${user.userId}:`, error);
    });
  });

  fastify.decorate('io', io);

  // Enhanced helper methods for broadcasting
  fastify.decorate('broadcastLocationUpdate', async (orderId: string, locationData: any) => {
    try {
      await redisPublisher.publish(
        `courier:location:${orderId}`,
        JSON.stringify({
          orderId,
          courierId: locationData.courierId,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          heading: locationData.heading,
          speed: locationData.speed,
          accuracy: locationData.accuracy,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (error) {
      logger.error('Failed to broadcast location update:', error);
    }
  });

  fastify.decorate('broadcastStatusUpdate', async (orderId: string, statusData: any) => {
    try {
      await redisPublisher.publish(
        `order:status:${orderId}`,
        JSON.stringify({
          orderId,
          status: statusData.status,
          estimatedArrival: statusData.estimatedArrival,
          notes: statusData.notes,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (error) {
      logger.error('Failed to broadcast status update:', error);
    }
  });

  // Helper methods for broadcasting
  fastify.decorate('broadcastToUser', (userId: string, event: string, data: any) => {
    io.to(`user:${userId}`).emit(event, data);
  });

  fastify.decorate('broadcastToRole', (role: string, event: string, data: any) => {
    io.to(`role:${role.toLowerCase()}`).emit(event, data);
  });

  fastify.decorate('broadcastOrderUpdate', async (orderId: string, customerId: string, data: any) => {
    // Broadcast via Socket.IO
    io.to(`order:${orderId}:status`).emit('order_status_update', {
      orderId,
      ...data,
      timestamp: new Date().toISOString(),
    });
    
    // Also publish to Redis for persistence
    await fastify.broadcastStatusUpdate(orderId, data);
  });

  // Cleanup on service shutdown
  fastify.addHook('onClose', async () => {
    await redisSubscriber.quit();
    await redisPublisher.quit();
  });
};

export { websocketPlugin };
export default fp(websocketPlugin);