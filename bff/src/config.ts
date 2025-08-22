export const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  },
  services: {
    auth: {
      host: 'localhost',
      port: parseInt(process.env.AUTH_SERVICE_PORT || '8001'),
    },
    catalog: {
      host: 'localhost',
      port: parseInt(process.env.CATALOG_SERVICE_PORT || '8002'),
    },
    search: {
      host: 'localhost',
      port: parseInt(process.env.SEARCH_SERVICE_PORT || '8003'),
    },
    order: {
      host: 'localhost',
      port: parseInt(process.env.ORDER_SERVICE_PORT || '8004'),
    },
    payment: {
      host: 'localhost',
      port: parseInt(process.env.PAYMENT_SERVICE_PORT || '8005'),
    },
    courier: {
      host: 'localhost',
      port: parseInt(process.env.COURIER_SERVICE_PORT || '8006'),
    },
    promotion: {
      host: 'localhost',
      port: parseInt(process.env.PROMOTION_SERVICE_PORT || '8007'),
    },
    notification: {
      host: 'localhost',
      port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || '8008'),
    },
    reporting: {
      host: 'localhost',
      port: parseInt(process.env.REPORTING_SERVICE_PORT || '8009'),
    },
    pricing: {
      host: 'localhost',
      port: parseInt(process.env.PRICING_SERVICE_PORT || '8010'),
    },
  },
};