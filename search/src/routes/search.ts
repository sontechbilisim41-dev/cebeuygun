import { FastifyPluginAsync } from 'fastify';
import { 
  SearchRequestSchema, 
  SuggestionRequestSchema, 
  PopularProductsRequestSchema,
  SearchResponseSchema,
  SuggestionResponseSchema 
} from '@/types';
import { ElasticsearchService } from '@/services/elasticsearch';
import { logger, logPerformance } from '@/utils/logger';
import { config } from '@/config';

const searchRoutes: FastifyPluginAsync = async (fastify) => {
  const elasticsearchService = fastify.elasticsearch as ElasticsearchService;

  // Main search endpoint
  fastify.get('/search', {
    schema: {
      querystring: SearchRequestSchema,
      response: {
        200: SearchResponseSchema,
      },
    },
  }, async (request, reply) => {
    const startTime = Date.now();
    const searchParams = SearchRequestSchema.parse(request.query);

    try {
      logger.info('Search request received', {
        query: searchParams.q,
        filters: {
          category_id: searchParams.category_id,
          brand: searchParams.brand,
          price_range: {
            min: searchParams.min_price,
            max: searchParams.max_price,
          },
          delivery_time: searchParams.delivery_time,
          express_only: searchParams.express_only,
          location: searchParams.location,
        },
        pagination: {
          page: searchParams.page,
          size: searchParams.size,
        },
        sort_by: searchParams.sort_by,
      });

      const result = await elasticsearchService.search(searchParams);
      const totalPages = Math.ceil(result.total / searchParams.size);
      const responseTime = Date.now() - startTime;

      // Log performance metrics
      logPerformance('search_endpoint', responseTime, {
        es_query_time_ms: result.queryTimeMs,
        total_results: result.total,
        returned_results: result.products.length,
        page: searchParams.page,
        has_query: !!searchParams.q,
        has_facets: !!result.facets,
        performance_target_met: result.queryTimeMs <= config.performance.targetP95,
      });

      // Warn if performance target not met
      if (result.queryTimeMs > config.performance.targetP95) {
        logger.warn(`Search performance target exceeded: ${result.queryTimeMs}ms > ${config.performance.targetP95}ms`, {
          query: searchParams.q,
          filters: searchParams,
        });
      }

      const response = {
        success: true,
        message: 'Search completed successfully',
        data: {
          products: result.products,
          total: result.total,
          page: searchParams.page,
          size: searchParams.size,
          total_pages: totalPages,
          facets: result.facets,
          query_time_ms: result.queryTimeMs,
          suggestions: result.suggestions,
          search_metadata: result.searchMetadata,
        },
      };

      return reply.send(response);
    } catch (error) {
      logger.error('Search failed:', {
        error: error.message,
        stack: error.stack,
        query: searchParams.q,
        filters: searchParams,
        response_time_ms: Date.now() - startTime,
      });

      return reply.status(500).send({
        success: false,
        message: 'Search failed',
        error: config.nodeEnv === 'development' ? error.message : 'Internal server error',
      });
    }
  });

  // Smart suggestions endpoint
  fastify.get('/suggestions', {
    schema: {
      querystring: SuggestionRequestSchema,
      response: {
        200: SuggestionResponseSchema,
      },
    },
  }, async (request, reply) => {
    const startTime = Date.now();
    const { q, size } = SuggestionRequestSchema.parse(request.query);

    try {
      logger.debug('Suggestions request received', { query: q, size });

      const suggestions = await elasticsearchService.getSuggestions(q, size);
      const queryTimeMs = Date.now() - startTime;

      const response = {
        success: true,
        message: 'Suggestions retrieved successfully',
        data: {
          suggestions: suggestions.map((text, index) => ({
            text,
            score: 1.0 - (index * 0.05), // Simple scoring based on order
            type: 'product' as const, // In real implementation, determine type
            category: undefined,
            product_count: undefined,
          })),
          query_time_ms: queryTimeMs,
        },
      };

      logPerformance('suggestions', queryTimeMs, {
        query: q,
        suggestions_count: suggestions.length,
      });

      return reply.send(response);
    } catch (error) {
      logger.error('Suggestions failed:', {
        error: error.message,
        query: q,
        response_time_ms: Date.now() - startTime,
      });

      return reply.status(500).send({
        success: false,
        message: 'Failed to get suggestions',
        error: config.nodeEnv === 'development' ? error.message : 'Internal server error',
      });
    }
  });

  // Popular products endpoint (for empty search)
  fastify.get('/popular', {
    schema: {
      querystring: PopularProductsRequestSchema,
    },
  }, async (request, reply) => {
    const startTime = Date.now();
    const { category_id, location, size } = PopularProductsRequestSchema.parse(request.query);

    try {
      logger.debug('Popular products request received', { category_id, location, size });

      const products = await elasticsearchService.getPopularProducts(category_id, location, size);
      const queryTimeMs = Date.now() - startTime;

      const response = {
        success: true,
        message: 'Popular products retrieved successfully',
        data: {
          products,
          total: products.length,
          query_time_ms: queryTimeMs,
          search_metadata: {
            query_type: 'popular_products',
            filters_applied: category_id ? ['category'] : [],
            sort_applied: 'popularity',
          },
        },
      };

      logPerformance('popular_products', queryTimeMs, {
        category_id,
        location: !!location,
        products_count: products.length,
      });

      return reply.send(response);
    } catch (error) {
      logger.error('Popular products failed:', {
        error: error.message,
        category_id,
        location,
        response_time_ms: Date.now() - startTime,
      });

      return reply.status(500).send({
        success: false,
        message: 'Failed to get popular products',
        error: config.nodeEnv === 'development' ? error.message : 'Internal server error',
      });
    }
  });

  // Facets-only endpoint for fast filtering
  fastify.get('/facets', {
    schema: {
      querystring: SearchRequestSchema.omit({ page: true, size: true, highlight: true }),
    },
  }, async (request, reply) => {
    const startTime = Date.now();
    const searchParams = {
      ...SearchRequestSchema.parse({ ...request.query, page: 1, size: 0, facets: true }),
    };

    try {
      logger.debug('Facets request received', { filters: searchParams });

      const result = await elasticsearchService.search(searchParams);
      const queryTimeMs = Date.now() - startTime;

      // Check performance target for facets
      if (queryTimeMs > config.performance.targetP95) {
        logger.warn(`Facets performance target exceeded: ${queryTimeMs}ms > ${config.performance.targetP95}ms`, {
          filters: searchParams,
        });
      }

      const response = {
        success: true,
        message: 'Facets retrieved successfully',
        data: {
          facets: result.facets,
          total: result.total,
          query_time_ms: queryTimeMs,
          search_metadata: {
            query_type: 'facets_only',
            filters_applied: result.searchMetadata.filters_applied,
            sort_applied: 'none',
          },
        },
      };

      logPerformance('facets_only', queryTimeMs, {
        total_results: result.total,
        performance_target_met: queryTimeMs <= config.performance.targetP95,
      });

      return reply.send(response);
    } catch (error) {
      logger.error('Facets failed:', {
        error: error.message,
        filters: searchParams,
        response_time_ms: Date.now() - startTime,
      });

      return reply.status(500).send({
        success: false,
        message: 'Failed to get facets',
        error: config.nodeEnv === 'development' ? error.message : 'Internal server error',
      });
    }
  });

  // Advanced search with custom scoring
  fastify.post('/advanced-search', {
    schema: {
      body: SearchRequestSchema.extend({
        boost_fields: z.object({
          name: z.number().optional(),
          brand: z.number().optional(),
          category: z.number().optional(),
          description: z.number().optional(),
        }).optional(),
        custom_filters: z.array(z.object({
          field: z.string(),
          operator: z.enum(['term', 'range', 'match', 'exists']),
          value: z.any(),
        })).optional(),
      }),
    },
  }, async (request, reply) => {
    const startTime = Date.now();
    const searchParams = request.body as any;

    try {
      logger.info('Advanced search request received', {
        query: searchParams.q,
        boost_fields: searchParams.boost_fields,
        custom_filters: searchParams.custom_filters,
      });

      // For now, use regular search - in production, implement custom scoring
      const result = await elasticsearchService.search(searchParams);
      const queryTimeMs = Date.now() - startTime;

      const response = {
        success: true,
        message: 'Advanced search completed successfully',
        data: {
          products: result.products,
          total: result.total,
          page: searchParams.page || 1,
          size: searchParams.size || 20,
          total_pages: Math.ceil(result.total / (searchParams.size || 20)),
          facets: result.facets,
          query_time_ms: queryTimeMs,
          search_metadata: {
            ...result.searchMetadata,
            query_type: 'advanced_search',
          },
        },
      };

      logPerformance('advanced_search', queryTimeMs, {
        query: searchParams.q,
        total_results: result.total,
        has_custom_scoring: !!searchParams.boost_fields,
        has_custom_filters: !!searchParams.custom_filters,
      });

      return reply.send(response);
    } catch (error) {
      logger.error('Advanced search failed:', {
        error: error.message,
        query: searchParams.q,
        response_time_ms: Date.now() - startTime,
      });

      return reply.status(500).send({
        success: false,
        message: 'Advanced search failed',
        error: config.nodeEnv === 'development' ? error.message : 'Internal server error',
      });
    }
  });
};

export { searchRoutes };