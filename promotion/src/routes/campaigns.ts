import { FastifyPluginAsync } from 'fastify';
import { 
  CreateCampaignSchema,
  ApplyCampaignsRequestSchema,
  ApplyCampaignsResponseSchema 
} from '@/types';
import { PromotionService } from '@/services/promotion';
import { logger } from '@/utils/logger';

const campaignsRoutes: FastifyPluginAsync = async (fastify) => {
  const promotionService = new PromotionService();
  await promotionService.initialize();

  // Apply campaigns to cart
  fastify.post('/apply', {
    schema: {
      body: ApplyCampaignsRequestSchema,
      response: {
        200: ApplyCampaignsResponseSchema,
      },
    },
  }, async (request, reply) => {
    const startTime = Date.now();
    
    try {
      const applicationRequest = ApplyCampaignsRequestSchema.parse(request.body);
      
      logger.info('Campaign application request received', {
        customerId: applicationRequest.customer.id,
        cartTotal: applicationRequest.cart.totalAmount.amount,
        itemCount: applicationRequest.cart.items.length,
        couponCodes: applicationRequest.couponCodes?.length || 0,
      });

      const result = await promotionService.applyCampaigns(applicationRequest);

      logger.info('Campaign application completed', {
        customerId: applicationRequest.customer.id,
        appliedCampaigns: result.data.appliedCampaigns.length,
        totalDiscount: result.data.totalDiscount.amount,
        processingTime: Date.now() - startTime,
      });

      return reply.send(result);
    } catch (error) {
      logger.error('Campaign application failed:', error);
      
      return reply.status(500).send({
        success: false,
        message: 'Failed to apply campaigns',
        error: error.message,
      });
    }
  });

  // Create new campaign
  fastify.post('/', {
    schema: {
      body: CreateCampaignSchema,
    },
  }, async (request, reply) => {
    try {
      const campaignData = CreateCampaignSchema.parse(request.body);
      
      logger.info('Campaign creation request received', {
        name: campaignData.name,
        type: campaignData.type,
        rulesCount: campaignData.rules.length,
      });

      const campaign = await promotionService.createCampaign(campaignData);

      return reply.status(201).send({
        success: true,
        message: 'Campaign created successfully',
        data: campaign,
      });
    } catch (error) {
      logger.error('Campaign creation failed:', error);
      
      return reply.status(400).send({
        success: false,
        message: 'Failed to create campaign',
        error: error.message,
      });
    }
  });

  // Get active campaigns
  fastify.get('/active', async (request, reply) => {
    try {
      const campaigns = await promotionService.getActiveCampaigns();

      return reply.send({
        success: true,
        message: 'Active campaigns retrieved successfully',
        data: { campaigns },
      });
    } catch (error) {
      logger.error('Failed to get active campaigns:', error);
      
      return reply.status(500).send({
        success: false,
        message: 'Failed to retrieve campaigns',
        error: error.message,
      });
    }
  });

  // Validate coupon
  fastify.post('/coupons/validate', {
    schema: {
      body: z.object({
        code: z.string().min(1),
        customer: CustomerSchema,
        cart: CartSchema,
      }),
    },
  }, async (request, reply) => {
    try {
      const { code, customer, cart } = request.body as any;
      
      const validation = await promotionService.validateCoupon(code, customer, cart);

      return reply.send({
        success: true,
        message: validation.isValid ? 'Coupon is valid' : 'Coupon is invalid',
        data: validation,
      });
    } catch (error) {
      logger.error('Coupon validation failed:', error);
      
      return reply.status(500).send({
        success: false,
        message: 'Failed to validate coupon',
        error: error.message,
      });
    }
  });

  // Get campaign statistics
  fastify.get('/:id/stats', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const stats = await promotionService.getCampaignStats(id);

      return reply.send({
        success: true,
        message: 'Campaign statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      logger.error('Failed to get campaign stats:', error);
      
      return reply.status(500).send({
        success: false,
        message: 'Failed to retrieve campaign statistics',
        error: error.message,
      });
    }
  });

  // Cleanup on close
  fastify.addHook('onClose', async () => {
    await promotionService.disconnect();
  });
};

export { campaignsRoutes };