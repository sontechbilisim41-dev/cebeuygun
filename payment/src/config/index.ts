import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PAYMENT_SERVICE_PORT || '8005'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/cebeuygun?sslmode=disable',
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    keyPrefix: 'payment:',
  },
  
  kafka: {
    clientId: 'payment-service',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    topics: {
      orderPaid: 'order.paid',
      paymentFailed: 'payment.failed',
      refundProcessed: 'refund.processed',
    },
  },
  
  providers: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_...',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...',
      apiVersion: '2023-10-16',
    },
    iyzico: {
      apiKey: process.env.IYZICO_API_KEY || 'sandbox-api-key',
      secretKey: process.env.IYZICO_SECRET_KEY || 'sandbox-secret-key',
      baseUrl: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
    },
  },
  
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY || 'your-32-char-encryption-key-here',
    tokenExpiry: parseInt(process.env.TOKEN_EXPIRY_HOURS || '24') * 60 * 60 * 1000, // 24 hours
  },
  
  fraudPrevention: {
    maxDailyAmount: parseFloat(process.env.MAX_DAILY_AMOUNT || '10000'), // TRY
    maxTransactionAmount: parseFloat(process.env.MAX_TRANSACTION_AMOUNT || '5000'), // TRY
    velocityCheckWindow: parseInt(process.env.VELOCITY_CHECK_WINDOW || '3600'), // 1 hour in seconds
    maxTransactionsPerHour: parseInt(process.env.MAX_TRANSACTIONS_PER_HOUR || '10'),
    allowedCountries: (process.env.ALLOWED_COUNTRIES || 'TR,US,GB,DE').split(','),
  },
  
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['*'],
  },
  
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    timeWindow: process.env.RATE_LIMIT_WINDOW || '1 minute',
  },
};