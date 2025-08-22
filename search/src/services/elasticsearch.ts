import { Client } from '@elastic/elasticsearch';
import { createClient } from 'redis';
import { config } from '@/config';
import { logger, logPerformance } from '@/utils/logger';
import { Product, SearchRequest, Facet } from '@/types';

export class ElasticsearchService {
  private client: Client;
  private redisClient: any;
  private index: string;

  constructor() {
    this.client = new Client({
      node: config.elasticsearch.node,
      maxRetries: config.elasticsearch.maxRetries,
      requestTimeout: config.elasticsearch.requestTimeout,
      sniffOnStart: config.elasticsearch.sniffOnStart,
    });
    this.index = config.elasticsearch.index;
    
    // Initialize Redis for caching
    this.redisClient = createClient({ url: config.redis.url });
    this.redisClient.on('error', (err: any) => logger.error('Redis Client Error', err));
  }

  async initialize(): Promise<void> {
    try {
      // Connect to Redis
      await this.redisClient.connect();
      logger.info('Redis connection established');

      // Check if Elasticsearch cluster is available
      await this.client.ping();
      logger.info('Elasticsearch connection established');

      // Create index if it doesn't exist
      const indexExists = await this.client.indices.exists({ index: this.index });
      if (!indexExists) {
        await this.createIndex();
        logger.info(`Created Elasticsearch index: ${this.index}`);
      }
    } catch (error) {
      logger.error('Failed to initialize Elasticsearch service:', error);
      throw error;
    }
  }

  private async createIndex(): Promise<void> {
    const indexConfig = {
      index: this.index,
      body: {
        settings: {
          number_of_shards: 3,
          number_of_replicas: 1,
          analysis: {
            analyzer: {
              turkish_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: [
                  'lowercase',
                  'turkish_stop',
                  'turkish_stemmer',
                  'synonym_filter',
                  'edge_ngram_filter',
                ],
              },
              search_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: [
                  'lowercase',
                  'turkish_stop',
                  'synonym_filter',
                ],
              },
              autocomplete_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: [
                  'lowercase',
                  'edge_ngram_filter',
                ],
              },
            },
            filter: {
              turkish_stop: {
                type: 'stop',
                stopwords: ['_turkish_'],
              },
              turkish_stemmer: {
                type: 'stemmer',
                language: 'turkish',
              },
              synonym_filter: {
                type: 'synonym',
                synonyms: [
                  'telefon,cep telefonu,mobil telefon,smartphone',
                  'bilgisayar,pc,laptop,notebook',
                  'ayakkabı,bot,spor ayakkabı,sneaker',
                  'gömlek,tişört,bluz,shirt',
                  'pantolon,jean,şort,eşofman',
                  'çanta,kese,torba,bag',
                  'saat,watch,kol saati',
                  'kitap,book,roman,dergi',
                  'oyuncak,toy,bebek,puzzle',
                  'ev,home,house,konut',
                ],
              },
              edge_ngram_filter: {
                type: 'edge_ngram',
                min_gram: 2,
                max_gram: 20,
              },
            },
          },
        },
        mappings: {
          properties: {
            id: { type: 'keyword' },
            name: {
              type: 'text',
              analyzer: 'turkish_analyzer',
              search_analyzer: 'search_analyzer',
              fields: {
                keyword: { type: 'keyword' },
                autocomplete: {
                  type: 'text',
                  analyzer: 'autocomplete_analyzer',
                  search_analyzer: 'search_analyzer',
                },
                suggest: {
                  type: 'completion',
                  analyzer: 'simple',
                  preserve_separators: true,
                  preserve_position_increments: true,
                  max_input_length: 50,
                },
              },
            },
            description: {
              type: 'text',
              analyzer: 'turkish_analyzer',
              search_analyzer: 'search_analyzer',
            },
            category_id: { type: 'keyword' },
            category_name: {
              type: 'text',
              analyzer: 'turkish_analyzer',
              fields: {
                keyword: { type: 'keyword' },
                suggest: {
                  type: 'completion',
                  analyzer: 'simple',
                },
              },
            },
            brand: {
              type: 'text',
              analyzer: 'keyword',
              fields: {
                keyword: { type: 'keyword' },
                suggest: {
                  type: 'completion',
                  analyzer: 'simple',
                },
              },
            },
            sku: { type: 'keyword' },
            barcode: { type: 'keyword' },
            base_price: { type: 'double' },
            currency: { type: 'keyword' },
            tax_rate: { type: 'double' },
            base_stock: { type: 'integer' },
            tags: {
              type: 'text',
              analyzer: 'keyword',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            attributes: { type: 'object' },
            is_active: { type: 'boolean' },
            is_express_delivery: { type: 'boolean' },
            preparation_time: { type: 'integer' },
            rating: { type: 'double' },
            review_count: { type: 'integer' },
            popularity_score: { type: 'double' },
            seller_info: {
              type: 'object',
              properties: {
                id: { type: 'keyword' },
                name: { type: 'text', analyzer: 'turkish_analyzer' },
                rating: { type: 'double' },
              },
            },
            location: { type: 'geo_point' },
            created_at: { type: 'date' },
            updated_at: { type: 'date' },
          },
        },
      },
    };

    await this.client.indices.create(indexConfig);
  }

  async indexProduct(product: Product): Promise<void> {
    const startTime = Date.now();
    
    try {
      const doc = {
        ...product,
        popularity_score: product.popularity_score || this.calculatePopularityScore(product),
        location: product.seller_info ? this.getSellerLocation(product.seller_info.id) : null,
      };

      await this.client.index({
        index: this.index,
        id: product.id,
        body: doc,
        refresh: 'wait_for',
      });

      logPerformance('index_product', Date.now() - startTime, { product_id: product.id });
      logger.debug(`Indexed product: ${product.id}`);
    } catch (error) {
      logger.error(`Failed to index product ${product.id}:`, error);
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      await this.client.delete({
        index: this.index,
        id: productId,
        refresh: 'wait_for',
      });

      logPerformance('delete_product', Date.now() - startTime, { product_id: productId });
      logger.debug(`Deleted product from index: ${productId}`);
    } catch (error) {
      if (error.statusCode !== 404) {
        logger.error(`Failed to delete product ${productId}:`, error);
        throw error;
      }
    }
  }

  async search(request: SearchRequest): Promise<{
    products: Product[];
    total: number;
    facets?: Facet;
    queryTimeMs: number;
    suggestions?: string[];
    searchMetadata: any;
  }> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('search', request);

    try {
      // Try to get cached facets for performance
      let cachedFacets = null;
      if (request.facets && !request.q) {
        cachedFacets = await this.getCachedFacets(request);
      }

      const query = this.buildSearchQuery(request);
      const aggs = request.facets && !cachedFacets ? this.buildAggregations() : undefined;

      const searchParams = {
        index: this.index,
        body: {
          query,
          aggs,
          sort: this.buildSort(request.sort_by, request.location),
          from: (request.page - 1) * request.size,
          size: request.size,
          highlight: request.highlight ? this.buildHighlight() : undefined,
          _source: {
            excludes: ['popularity_score'],
          },
        },
      };

      const response = await this.client.search(searchParams);
      const queryTimeMs = Date.now() - startTime;

      const products = response.body.hits.hits.map((hit: any) => ({
        ...hit._source,
        score: hit._score,
        highlight: hit.highlight,
        distance_km: hit.sort && hit.sort.length > 1 ? hit.sort[1] : undefined,
      }));

      const facets = request.facets 
        ? (cachedFacets || this.processFacets(response.body.aggregations))
        : undefined;

      // Cache facets for performance
      if (facets && !request.q && !cachedFacets) {
        await this.cacheFacets(request, facets);
      }

      const suggestions = request.q ? await this.getSuggestions(request.q) : undefined;

      const searchMetadata = {
        query_type: request.q ? 'text_search' : 'browse',
        filters_applied: this.getAppliedFilters(request),
        sort_applied: request.sort_by,
      };

      logPerformance('search', queryTimeMs, {
        query: request.q,
        total_results: response.body.hits.total.value,
        returned_results: products.length,
        has_facets: !!facets,
        performance_target_met: queryTimeMs <= config.performance.targetP95,
      });

      return {
        products,
        total: response.body.hits.total.value,
        facets,
        queryTimeMs,
        suggestions,
        searchMetadata,
      };
    } catch (error) {
      logger.error('Search failed:', error);
      throw error;
    }
  }

  private buildSearchQuery(request: SearchRequest): any {
    const must: any[] = [];
    const filter: any[] = [];
    const should: any[] = [];

    // Active products only
    filter.push({ term: { is_active: true } });

    // Text search with boosting
    if (request.q) {
      must.push({
        multi_match: {
          query: request.q,
          fields: [
            'name^5',
            'name.autocomplete^3',
            'description^1',
            'brand^4',
            'category_name^3',
            'tags^2',
            'attributes.*^1',
          ],
          type: 'best_fields',
          fuzziness: 'AUTO',
          operator: 'and',
          minimum_should_match: '75%',
        },
      });

      // Boost exact matches
      should.push({
        multi_match: {
          query: request.q,
          fields: ['name.keyword^10', 'brand.keyword^8'],
          type: 'phrase',
          boost: 2,
        },
      });
    }

    // Category filter
    if (request.category_id) {
      filter.push({ term: { category_id: request.category_id } });
    }

    // Brand filter
    if (request.brand) {
      filter.push({ term: { 'brand.keyword': request.brand } });
    }

    // Price range filter
    if (request.min_price || request.max_price) {
      const priceRange: any = {};
      if (request.min_price) priceRange.gte = request.min_price;
      if (request.max_price) priceRange.lte = request.max_price;
      filter.push({ range: { base_price: priceRange } });
    }

    // Delivery time filter
    if (request.delivery_time) {
      filter.push({ range: { preparation_time: { lte: request.delivery_time } } });
    }

    // Express delivery filter
    if (request.express_only) {
      filter.push({ term: { is_express_delivery: true } });
    }

    // Tags filter
    if (request.tags && request.tags.length > 0) {
      filter.push({ terms: { 'tags.keyword': request.tags } });
    }

    // Location-based filtering
    if (request.location) {
      filter.push({
        geo_distance: {
          distance: `${request.location.radius_km}km`,
          location: {
            lat: request.location.latitude,
            lon: request.location.longitude,
          },
        },
      });
    }

    // Boost popular products and high ratings
    should.push(
      { range: { popularity_score: { gte: 70, boost: 1.5 } } },
      { range: { rating: { gte: 4.0, boost: 1.3 } } },
      { term: { is_express_delivery: { value: true, boost: 1.2 } } }
    );

    const baseQuery = {
      bool: {
        must: must.length > 0 ? must : [{ match_all: {} }],
        filter,
        should,
        minimum_should_match: should.length > 0 ? 0 : undefined,
      },
    };

    return baseQuery;
  }

  private buildSort(sortBy: string, location?: any): any[] {
    const sorts: any[] = [];

    switch (sortBy) {
      case 'price_asc':
        sorts.push({ base_price: { order: 'asc' } });
        break;
      case 'price_desc':
        sorts.push({ base_price: { order: 'desc' } });
        break;
      case 'newest':
        sorts.push({ created_at: { order: 'desc' } });
        break;
      case 'rating':
        sorts.push({ rating: { order: 'desc' } });
        break;
      case 'popularity':
        sorts.push({ popularity_score: { order: 'desc' } });
        break;
      case 'relevance':
      default:
        sorts.push('_score');
        break;
    }

    // Add location-based sorting if location is provided
    if (location) {
      sorts.push({
        _geo_distance: {
          location: {
            lat: location.latitude,
            lon: location.longitude,
          },
          order: 'asc',
          unit: 'km',
        },
      });
    }

    // Secondary sort by popularity for tie-breaking
    if (sortBy !== 'popularity') {
      sorts.push({ popularity_score: { order: 'desc' } });
    }

    return sorts;
  }

  private buildHighlight(): any {
    return {
      fields: {
        name: {
          fragment_size: config.search.highlightFragmentSize,
          number_of_fragments: 1,
        },
        description: {
          fragment_size: config.search.highlightFragmentSize,
          number_of_fragments: 1,
        },
        'brand': {
          fragment_size: 50,
          number_of_fragments: 1,
        },
      },
      pre_tags: ['<mark>'],
      post_tags: ['</mark>'],
    };
  }

  private buildAggregations(): any {
    return {
      categories: {
        terms: {
          field: 'category_id',
          size: 20,
        },
        aggs: {
          category_name: {
            terms: {
              field: 'category_name.keyword',
              size: 1,
            },
          },
        },
      },
      brands: {
        terms: {
          field: 'brand.keyword',
          size: 20,
        },
      },
      price_ranges: {
        range: {
          field: 'base_price',
          ranges: [
            { key: '0-25', to: 25 },
            { key: '25-50', from: 25, to: 50 },
            { key: '50-100', from: 50, to: 100 },
            { key: '100-250', from: 100, to: 250 },
            { key: '250-500', from: 250, to: 500 },
            { key: '500+', from: 500 },
          ],
        },
      },
      delivery_times: {
        range: {
          field: 'preparation_time',
          ranges: [
            { key: '0-15', to: 15 },
            { key: '15-30', from: 15, to: 30 },
            { key: '30-60', from: 30, to: 60 },
            { key: '60+', from: 60 },
          ],
        },
      },
      ratings: {
        range: {
          field: 'rating',
          ranges: [
            { key: '4+', from: 4 },
            { key: '3+', from: 3, to: 4 },
            { key: '2+', from: 2, to: 3 },
            { key: '1+', from: 1, to: 2 },
          ],
        },
      },
      tags: {
        terms: {
          field: 'tags.keyword',
          size: 15,
        },
      },
    };
  }

  private processFacets(aggregations: any): Facet {
    const categories = aggregations.categories.buckets.map((bucket: any) => ({
      key: bucket.key,
      name: bucket.category_name.buckets[0]?.key || bucket.key,
      doc_count: bucket.doc_count,
    }));

    const brands = aggregations.brands.buckets.map((bucket: any) => ({
      key: bucket.key,
      doc_count: bucket.doc_count,
    }));

    const price_ranges = aggregations.price_ranges.buckets.map((bucket: any) => ({
      key: bucket.key,
      from: bucket.from,
      to: bucket.to,
      doc_count: bucket.doc_count,
    }));

    const delivery_times = aggregations.delivery_times.buckets.map((bucket: any) => ({
      key: bucket.key,
      from: bucket.from,
      to: bucket.to,
      doc_count: bucket.doc_count,
    }));

    const ratings = aggregations.ratings.buckets.map((bucket: any) => ({
      key: bucket.key,
      from: bucket.from,
      to: bucket.to,
      doc_count: bucket.doc_count,
    }));

    const tags = aggregations.tags.buckets.map((bucket: any) => ({
      key: bucket.key,
      doc_count: bucket.doc_count,
    }));

    return {
      categories,
      brands,
      price_ranges,
      delivery_times,
      ratings,
      tags,
    };
  }

  async getSuggestions(query: string, size: number = 10): Promise<string[]> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.search({
        index: this.index,
        body: {
          suggest: {
            product_suggest: {
              prefix: query,
              completion: {
                field: 'name.suggest',
                size: Math.ceil(size * 0.6),
                skip_duplicates: true,
              },
            },
            category_suggest: {
              prefix: query,
              completion: {
                field: 'category_name.suggest',
                size: Math.ceil(size * 0.2),
                skip_duplicates: true,
              },
            },
            brand_suggest: {
              prefix: query,
              completion: {
                field: 'brand.suggest',
                size: Math.ceil(size * 0.2),
                skip_duplicates: true,
              },
            },
          },
        },
      });

      const suggestions: string[] = [];
      
      // Collect all suggestions with priority
      response.body.suggest.product_suggest[0].options.forEach((option: any) => {
        suggestions.push(option.text);
      });
      
      response.body.suggest.category_suggest[0].options.forEach((option: any) => {
        suggestions.push(option.text);
      });
      
      response.body.suggest.brand_suggest[0].options.forEach((option: any) => {
        suggestions.push(option.text);
      });

      logPerformance('suggestions', Date.now() - startTime, { 
        query, 
        suggestions_count: suggestions.length 
      });

      return [...new Set(suggestions)].slice(0, size);
    } catch (error) {
      logger.error('Failed to get suggestions:', error);
      return [];
    }
  }

  async getPopularProducts(categoryId?: string, location?: any, size: number = 20): Promise<Product[]> {
    const startTime = Date.now();
    
    try {
      const filter: any[] = [{ term: { is_active: true } }];
      
      if (categoryId) {
        filter.push({ term: { category_id: categoryId } });
      }

      if (location) {
        filter.push({
          geo_distance: {
            distance: `${location.radius_km}km`,
            location: {
              lat: location.latitude,
              lon: location.longitude,
            },
          },
        });
      }

      const response = await this.client.search({
        index: this.index,
        body: {
          query: {
            bool: {
              filter,
              should: [
                { range: { popularity_score: { gte: 70, boost: 2 } } },
                { range: { rating: { gte: 4.0, boost: 1.5 } } },
                { term: { is_express_delivery: { value: true, boost: 1.3 } } },
              ],
              minimum_should_match: 0,
            },
          },
          sort: [
            { popularity_score: { order: 'desc' } },
            { rating: { order: 'desc' } },
            { created_at: { order: 'desc' } },
          ],
          size,
          _source: {
            excludes: ['popularity_score'],
          },
        },
      });

      const products = response.body.hits.hits.map((hit: any) => ({
        ...hit._source,
        score: hit._score,
      }));

      logPerformance('popular_products', Date.now() - startTime, {
        category_id: categoryId,
        products_count: products.length,
      });

      return products;
    } catch (error) {
      logger.error('Failed to get popular products:', error);
      throw error;
    }
  }

  // Helper methods
  private calculatePopularityScore(product: Product): number {
    let score = 50; // Base score
    
    if (product.rating) {
      score += product.rating * 10;
    }
    
    if (product.review_count) {
      score += Math.min(product.review_count * 0.1, 20);
    }
    
    if (product.is_express_delivery) {
      score += 10;
    }
    
    // Boost newer products
    const daysSinceCreated = (Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 30) {
      score += 5;
    }
    
    return Math.min(score, 100);
  }

  private getSellerLocation(sellerId: string): any {
    // This would typically come from a seller service
    // For now, return a default location (Istanbul)
    return {
      lat: 41.0082,
      lon: 28.9784,
    };
  }

  private generateCacheKey(prefix: string, data: any): string {
    const hash = Buffer.from(JSON.stringify(data)).toString('base64');
    return `${config.redis.keyPrefix}${prefix}:${hash}`;
  }

  private async getCachedFacets(request: SearchRequest): Promise<Facet | null> {
    try {
      const cacheKey = this.generateCacheKey('facets', {
        category_id: request.category_id,
        brand: request.brand,
        min_price: request.min_price,
        max_price: request.max_price,
        delivery_time: request.delivery_time,
        express_only: request.express_only,
        tags: request.tags,
        location: request.location,
      });
      
      const cached = await this.redisClient.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.warn('Failed to get cached facets:', error);
      return null;
    }
  }

  private async cacheFacets(request: SearchRequest, facets: Facet): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey('facets', {
        category_id: request.category_id,
        brand: request.brand,
        min_price: request.min_price,
        max_price: request.max_price,
        delivery_time: request.delivery_time,
        express_only: request.express_only,
        tags: request.tags,
        location: request.location,
      });
      
      await this.redisClient.setEx(
        cacheKey, 
        config.search.facetCacheTimeout, 
        JSON.stringify(facets)
      );
    } catch (error) {
      logger.warn('Failed to cache facets:', error);
    }
  }

  private getAppliedFilters(request: SearchRequest): string[] {
    const filters: string[] = [];
    
    if (request.category_id) filters.push('category');
    if (request.brand) filters.push('brand');
    if (request.min_price || request.max_price) filters.push('price_range');
    if (request.delivery_time) filters.push('delivery_time');
    if (request.express_only) filters.push('express_delivery');
    if (request.tags && request.tags.length > 0) filters.push('tags');
    if (request.location) filters.push('location');
    
    return filters;
  }

  async healthCheck(): Promise<{ status: string; cluster_name?: string; version?: string }> {
    try {
      const health = await this.client.cluster.health();
      const info = await this.client.info();
      
      return {
        status: health.body.status,
        cluster_name: health.body.cluster_name,
        version: info.body.version.number,
      };
    } catch (error) {
      logger.error('Elasticsearch health check failed:', error);
      return { status: 'red' };
    }
  }
}