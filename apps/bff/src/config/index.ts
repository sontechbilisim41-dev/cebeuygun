export const config = {
  port: parseInt(process.env.BFF_SERVICE_PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:8001',
    },
    catalog: {
      url: process.env.CATALOG_SERVICE_URL || 'http://localhost:8002',
    },
    pricing: {
      url: process.env.PRICING_SERVICE_URL || 'http://localhost:8010',
    },
    promotion: {
      url: process.env.PROMOTION_SERVICE_URL || 'http://localhost:8007',
    },
    order: {
      url: process.env.ORDER_SERVICE_URL || 'http://localhost:8004',
    },
    inventory: {
      url: process.env.INVENTORY_SERVICE_URL || 'http://localhost:8011',
    },
  },
  
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:19000'],
  },
  
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    timeWindow: process.env.RATE_LIMIT_WINDOW || '1 minute',
  },
  
  websocket: {
    pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '60000'),
    pingInterval: parseInt(process.env.WS_PING_INTERVAL || '25000'),
  },
};