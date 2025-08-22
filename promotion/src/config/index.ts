import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PROMOTION_SERVICE_PORT || '8007'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'cebeuygun',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_SSL === 'true',
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    keyPrefix: 'promotion:',
    cacheTtl: parseInt(process.env.CACHE_TTL || '300'), // 5 minutes
  },
  
  services: {
    pricing: {
      url: process.env.PRICING_SERVICE_URL || 'http://localhost:8010',
    },
    catalog: {
      url: process.env.CATALOG_SERVICE_URL || 'http://localhost:8002',
    },
  },
  
  campaigns: {
    maxConcurrentCampaigns: parseInt(process.env.MAX_CONCURRENT_CAMPAIGNS || '10'),
    defaultPriority: parseInt(process.env.DEFAULT_CAMPAIGN_PRIORITY || '100'),
    auditRetentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS || '90'),
  },
  
  coupons: {
    defaultExpiryDays: parseInt(process.env.DEFAULT_COUPON_EXPIRY_DAYS || '30'),
    maxUsagePerUser: parseInt(process.env.MAX_COUPON_USAGE_PER_USER || '1'),
    poolSize: parseInt(process.env.COUPON_POOL_SIZE || '10000'),
  },
  
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['*'],
  },
  
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '1000'),
    timeWindow: process.env.RATE_LIMIT_WINDOW || '1 minute',
  },
};