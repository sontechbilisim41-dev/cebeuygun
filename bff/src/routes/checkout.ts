import { FastifyPluginAsync } from 'fastify';
import { CheckoutRequestSchema, CheckoutResponseSchema } from '@/types';
import { logger } from '@/utils/logger';

const checkoutRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/checkout', {
    schema: {
      body: CheckoutRequestSchema,
      response: {
        200: CheckoutResponseSchema,
      },
    },
  }, async (request, reply) => {
    const checkoutData = CheckoutRequestSchema.parse(request.body);
    const user = request.user!;

    try {
      logger.info(`Processing checkout for user ${user.userId}`, {
        itemsCount: checkoutData.items.length,
        totalItems: checkoutData.items.reduce((sum, item) => sum + item.quantity, 0),
      });

      // Step 1: Validate products and get pricing
      const productIds = checkoutData.items.map(item => item.productId);
      const [catalogValidation, pricingData, inventoryCheck] = await Promise.allSettled([
        fastify.services.catalog.post('/products/validate', {
          productIds,
          items: checkoutData.items,
        }, {
          headers: { 'x-user-id': user.userId },
        }),
        
        fastify.services.pricing.post('/pricing/calculate', {
          items: checkoutData.items,
          location: checkoutData.deliveryAddress,
          couponCode: checkoutData.couponCode,
        }, {
          headers: { 'x-user-id': user.userId },
        }),
        
        fastify.services.inventory.post('/inventory/check', {
          items: checkoutData.items,
        }, {
          headers: { 'x-user-id': user.userId },
        }),
      ]);

      // Check if any validation failed
      if (catalogValidation.status === 'rejected') {
        return reply.status(400).send({
          success: false,
          error: 'Product validation failed',
          message: 'One or more products are invalid or unavailable',
        });
      }

      if (inventoryCheck.status === 'rejected') {
        return reply.status(400).send({
          success: false,
          error: 'Inventory check failed',
          message: 'One or more items are out of stock',
        });
      }

      const pricing = pricingData.status === 'fulfilled' ? pricingData.value.data : null;
      if (!pricing) {
        return reply.status(400).send({
          success: false,
          error: 'Pricing calculation failed',
          message: 'Unable to calculate order total',
        });
      }

      // Step 2: Create order
      const orderData = {
        customerId: user.userId,
        items: checkoutData.items,
        deliveryAddress: checkoutData.deliveryAddress,
        totalAmount: pricing.totalAmount,
        subtotal: pricing.subtotal,
        deliveryFee: pricing.deliveryFee,
        taxes: pricing.taxes,
        discounts: pricing.discounts,
        couponCode: checkoutData.couponCode,
        notes: checkoutData.notes,
      };

      const orderResponse = await fastify.services.order.post('/orders', orderData, {
        headers: { 'x-user-id': user.userId },
      });

      if (!orderResponse.success) {
        return reply.status(400).send({
          success: false,
          error: 'Order creation failed',
          message: orderResponse.message || 'Unable to create order',
        });
      }

      const order = orderResponse.data;

      // Step 3: Process payment (if payment method provided)
      let paymentStatus = 'pending';
      if (checkoutData.paymentMethodId) {
        try {
          const paymentResponse = await fastify.services.order.post('/payments/process', {
            orderId: order.id,
            paymentMethodId: checkoutData.paymentMethodId,
            amount: pricing.totalAmount,
          }, {
            headers: { 'x-user-id': user.userId },
          });

          paymentStatus = paymentResponse.data?.status || 'pending';
        } catch (error) {
          logger.warn(`Payment processing failed for order ${order.id}:`, error);
          // Continue with order creation even if payment fails
        }
      }

      // Step 4: Reserve inventory
      try {
        await fastify.services.inventory.post('/inventory/reserve', {
          orderId: order.id,
          items: checkoutData.items,
        }, {
          headers: { 'x-user-id': user.userId },
        });
      } catch (error) {
        logger.error(`Inventory reservation failed for order ${order.id}:`, error);
        // This is critical - we might need to cancel the order
      }

      // Step 5: Send real-time update
      (fastify as any).broadcastOrderUpdate(order.id, user.userId, {
        status: order.status,
        paymentStatus,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
      });

      const response = {
        success: true,
        data: {
          orderId: order.id,
          totalAmount: pricing.totalAmount,
          estimatedDeliveryTime: order.estimatedDeliveryTime || 30, // minutes
          paymentStatus,
        },
      };

      logger.info(`Checkout completed successfully for user ${user.userId}`, {
        orderId: order.id,
        totalAmount: pricing.totalAmount,
        paymentStatus,
      });

      return reply.send(response);

    } catch (error) {
      logger.error('Checkout process failed:', error);
      return reply.status(500).send({
        success: false,
        error: 'Checkout failed',
        message: 'Unable to process checkout at this time',
      });
    }
  });
};

export { checkoutRoutes };