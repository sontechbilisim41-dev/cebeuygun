import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.SEARCH_SERVICE_PORT || '8003'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  elasticsearch: {
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    index: process.env.ELASTICSEARCH_INDEX || 'products',
    maxRetries: parseInt(process.env.ES_MAX_RETRIES || '3'),
    requestTimeout: parseInt(process.env.ES_REQUEST_TIMEOUT || '30000'),
    sniffOnStart: process.env.ES_SNIFF_ON_START === 'true',
  },
  
  kafka: {
    clientId: 'search-service',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    groupId: 'search-service-group',
    topics: {
      productUpsert: 'catalog.product.upsert',
    },
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    keyPrefix: 'search:',
  },
  
  search: {
    defaultSize: parseInt(process.env.DEFAULT_SEARCH_SIZE || '20'),
    maxSize: parseInt(process.env.MAX_SEARCH_SIZE || '100'),
    highlightFragmentSize: parseInt(process.env.HIGHLIGHT_FRAGMENT_SIZE || '150'),
    popularProductsSize: parseInt(process.env.POPULAR_PRODUCTS_SIZE || '50'),
    suggestionSize: parseInt(process.env.SUGGESTION_SIZE || '10'),
    facetCacheTimeout: parseInt(process.env.FACET_CACHE_TIMEOUT || '300'), // 5 minutes
  },
  
  performance: {
    targetP95: parseInt(process.env.TARGET_P95_MS || '50'),
    slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || '100'),
  },
  
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['*'],
  },
  
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '1000'),
    timeWindow: process.env.RATE_LIMIT_WINDOW || '1 minute',
  },
};