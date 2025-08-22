import { FastifyPluginAsync } from 'fastify';
import { FeedRequestSchema, FeedResponseSchema } from '@/types';
import { logger } from '@/utils/logger';

const feedRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/feed', {
    schema: {
      querystring: FeedRequestSchema,
      response: {
        200: FeedResponseSchema,
      },
    },
  }, async (request, reply) => {
    const query = FeedRequestSchema.parse(request.query);
    const user = request.user!;

    try {
      logger.info(`Fetching feed for user ${user.userId}`, { query });

      // Parallel requests to multiple services
      const [
        catalogResponse,
        campaignResponse,
        pricingResponse,
        inventoryResponse,
      ] = await Promise.allSettled([
        // Get featured products from catalog service
        fastify.services.catalog.get('/products/featured', {
          headers: { 'x-user-id': user.userId },
        }),
        
        // Get active campaigns from promotion service
        fastify.services.promotion.get('/campaigns/active', {
          headers: { 'x-user-id': user.userId },
        }),
        
        // Get pricing information
        fastify.services.pricing.get('/pricing/bulk', {
          headers: { 'x-user-id': user.userId },
        }),
        
        // Get inventory status
        fastify.services.inventory.get('/inventory/status', {
          headers: { 'x-user-id': user.userId },
        }),
      ]);

      // Process catalog data
      const featuredProducts = catalogResponse.status === 'fulfilled' 
        ? catalogResponse.value.data?.products || []
        : [];

      const categories = catalogResponse.status === 'fulfilled'
        ? catalogResponse.value.data?.categories || []
        : [];

      // Process campaign data
      const campaigns = campaignResponse.status === 'fulfilled'
        ? campaignResponse.value.data?.campaigns || []
        : [];

      // Process pricing data
      const pricingData = pricingResponse.status === 'fulfilled'
        ? pricingResponse.value.data || {}
        : {};

      // Process inventory data
      const inventoryData = inventoryResponse.status === 'fulfilled'
        ? inventoryResponse.value.data || {}
        : {};

      // Apply pricing and inventory data to products
      const enrichedProducts = featuredProducts.map((product: any) => ({
        ...product,
        price: pricingData[product.id]?.currentPrice || product.price,
        originalPrice: pricingData[product.id]?.originalPrice || product.originalPrice,
        isAvailable: inventoryData[product.id]?.available !== false,
      }));

      // Get nearby products based on location
      let nearbyProducts = [];
      if (query.location) {
        try {
          const nearbyResponse = await fastify.services.catalog.post('/products/nearby', {
            location: query.location,
            limit: query.limit,
          }, {
            headers: { 'x-user-id': user.userId },
          });
          
          nearbyProducts = nearbyResponse.data?.products || [];
        } catch (error) {
          logger.warn('Failed to fetch nearby products:', error);
        }
      }

      const response = {
        success: true,
        data: {
          featuredProducts: enrichedProducts,
          campaigns,
          categories,
          nearbyProducts,
        },
      };

      logger.info(`Feed fetched successfully for user ${user.userId}`, {
        productsCount: enrichedProducts.length,
        campaignsCount: campaigns.length,
        categoriesCount: categories.length,
      });

      return reply.send(response);

    } catch (error) {
      logger.error('Error fetching feed:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch feed',
        message: 'Unable to retrieve feed data at this time',
      });
    }
  });
};

export { feedRoutes };