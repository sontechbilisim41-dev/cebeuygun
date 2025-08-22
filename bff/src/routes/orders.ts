import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { OrderSchema } from '@/types';
import { logger } from '@/utils/logger';

const OrderParamsSchema = z.object({
  id: z.string().uuid(),
});

const ordersRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/orders/:id', {
    schema: {
      params: OrderParamsSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          data: OrderSchema.optional(),
          error: z.string().optional(),
        }),
      },
    },
  }, async (request, reply) => {
    const { id: orderId } = OrderParamsSchema.parse(request.params);
    const user = request.user!;

    try {
      logger.info(`Fetching order ${orderId} for user ${user.userId}`);

      // Parallel requests to get comprehensive order data
      const [
        orderResponse,
        courierResponse,
        trackingResponse,
      ] = await Promise.allSettled([
        // Get basic order information
        fastify.services.order.get(`/orders/${orderId}`, {
          headers: { 'x-user-id': user.userId },
        }),
        
        // Get courier information if order is dispatched
        fastify.services.order.get(`/orders/${orderId}/courier`, {
          headers: { 'x-user-id': user.userId },
        }),
        
        // Get tracking information
        fastify.services.order.get(`/orders/${orderId}/tracking`, {
          headers: { 'x-user-id': user.userId },
        }),
      ]);

      if (orderResponse.status === 'rejected') {
        return reply.status(404).send({
          success: false,
          error: 'Order not found',
          message: 'The requested order could not be found',
        });
      }

      const order = orderResponse.value.data;
      
      // Verify user has access to this order
      if (user.role === 'CUSTOMER' && order.customerId !== user.userId) {
        return reply.status(403).send({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to view this order',
        });
      }

      if (user.role === 'SELLER' && order.sellerId !== user.userId) {
        return reply.status(403).send({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to view this order',
        });
      }

      // Enrich order data with additional information
      const enrichedOrder = {
        ...order,
        courier: courierResponse.status === 'fulfilled' ? courierResponse.value.data : null,
        tracking: trackingResponse.status === 'fulfilled' ? trackingResponse.value.data : null,
      };

      // Get real-time updates if order is active
      if (['confirmed', 'preparing', 'ready', 'dispatched'].includes(order.status)) {
        // Subscribe user to real-time updates for this order
        (fastify as any).broadcastToUser(user.userId, 'order_subscription', {
          orderId,
          status: 'subscribed',
        });
      }

      logger.info(`Order ${orderId} fetched successfully for user ${user.userId}`, {
        orderStatus: order.status,
        hasCourier: !!enrichedOrder.courier,
        hasTracking: !!enrichedOrder.tracking,
      });

      return reply.send({
        success: true,
        data: enrichedOrder,
      });

    } catch (error) {
      logger.error(`Error fetching order ${orderId}:`, error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch order',
        message: 'Unable to retrieve order information at this time',
      });
    }
  });

  // Get user's orders list
  fastify.get('/orders', {
    schema: {
      querystring: z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(50).default(20),
        status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled']).optional(),
      }),
    },
  }, async (request, reply) => {
    const query = request.query as any;
    const user = request.user!;

    try {
      logger.info(`Fetching orders list for user ${user.userId}`, { query });

      const ordersResponse = await fastify.services.order.get('/orders', {
        headers: { 'x-user-id': user.userId },
        query: {
          ...query,
          userId: user.userId,
          userRole: user.role,
        },
      });

      return reply.send({
        success: true,
        data: ordersResponse.data?.orders || [],
        pagination: ordersResponse.data?.pagination,
      });

    } catch (error) {
      logger.error('Error fetching orders list:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch orders',
        message: 'Unable to retrieve orders at this time',
      });
    }
  });

  // Update order status (for sellers and couriers)
  fastify.patch('/orders/:id/status', {
    schema: {
      params: OrderParamsSchema,
      body: z.object({
        status: z.enum(['confirmed', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled']),
        notes: z.string().optional(),
      }),
    },
  }, async (request, reply) => {
    const { id: orderId } = OrderParamsSchema.parse(request.params);
    const { status, notes } = request.body as any;
    const user = request.user!;

    // Only sellers and couriers can update order status
    if (!['SELLER', 'COURIER', 'ADMIN'].includes(user.role)) {
      return reply.status(403).send({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to update order status',
      });
    }

    try {
      logger.info(`Updating order ${orderId} status to ${status} by user ${user.userId}`);

      const updateResponse = await fastify.services.order.patch(`/orders/${orderId}/status`, {
        status,
        notes,
        updatedBy: user.userId,
        updatedByRole: user.role,
      }, {
        headers: { 'x-user-id': user.userId },
      });

      if (!updateResponse.success) {
        return reply.status(400).send({
          success: false,
          error: 'Status update failed',
          message: updateResponse.message || 'Unable to update order status',
        });
      }

      const order = updateResponse.data;

      // Send real-time update to customer
      (fastify as any).broadcastOrderUpdate(orderId, order.customerId, {
        status,
        notes,
        updatedAt: new Date().toISOString(),
      });

      logger.info(`Order ${orderId} status updated successfully to ${status}`);

      return reply.send({
        success: true,
        data: order,
      });

    } catch (error) {
      logger.error(`Error updating order ${orderId} status:`, error);
      return reply.status(500).send({
        success: false,
        error: 'Status update failed',
        message: 'Unable to update order status at this time',
      });
    }
  });
};

export { ordersRoutes };