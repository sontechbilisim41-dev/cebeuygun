import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || '8008'),
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
    keyPrefix: 'notification:',
  },
  
  kafka: {
    clientId: 'notification-service',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    groupId: 'notification-service-group',
    topics: {
      orderCreated: 'order.created',
      orderPaid: 'order.paid',
      orderAssigned: 'order.assigned',
      orderPickedUp: 'order.picked_up',
      orderOnTheWay: 'order.on_the_way',
      orderDelivered: 'order.delivered',
      orderCanceled: 'order.canceled',
      courierAssigned: 'courier.assigned',
      paymentFailed: 'payment.failed',
    },
  },
  
  channels: {
    fcm: {
      enabled: process.env.FCM_ENABLED === 'true',
      serviceAccountPath: process.env.FCM_SERVICE_ACCOUNT_PATH || './firebase-service-account.json',
      projectId: process.env.FCM_PROJECT_ID || 'cebeuygun-app',
    },
    sms: {
      enabled: process.env.SMS_ENABLED === 'true',
      provider: process.env.SMS_PROVIDER || 'twilio',
      twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || 'mock',
      twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || 'mock',
      twilioFromNumber: process.env.TWILIO_FROM_NUMBER || '+905551234567',
    },
    email: {
      enabled: process.env.EMAIL_ENABLED === 'true',
      provider: process.env.EMAIL_PROVIDER || 'sendgrid',
      sendgridApiKey: process.env.SENDGRID_API_KEY || 'mock',
      sesRegion: process.env.SES_REGION || 'eu-west-1',
      sesAccessKeyId: process.env.SES_ACCESS_KEY_ID || 'mock',
      sesSecretAccessKey: process.env.SES_SECRET_ACCESS_KEY || 'mock',
      fromEmail: process.env.FROM_EMAIL || 'noreply@cebeuygun.com',
      fromName: process.env.FROM_NAME || 'Cebeuygun',
    },
  },
  
  rateLimiting: {
    push: {
      maxPerMinute: parseInt(process.env.PUSH_RATE_LIMIT || '1000'),
      maxPerHour: parseInt(process.env.PUSH_RATE_LIMIT_HOUR || '10000'),
    },
    sms: {
      maxPerMinute: parseInt(process.env.SMS_RATE_LIMIT || '100'),
      maxPerHour: parseInt(process.env.SMS_RATE_LIMIT_HOUR || '1000'),
    },
    email: {
      maxPerMinute: parseInt(process.env.EMAIL_RATE_LIMIT || '500'),
      maxPerHour: parseInt(process.env.EMAIL_RATE_LIMIT_HOUR || '5000'),
    },
  },
  
  quietHours: {
    enabled: process.env.QUIET_HOURS_ENABLED === 'true',
    startHour: parseInt(process.env.QUIET_HOURS_START || '22'), // 22:00
    endHour: parseInt(process.env.QUIET_HOURS_END || '8'), // 08:00
    timezone: process.env.TIMEZONE || 'Europe/Istanbul',
    allowedChannels: (process.env.QUIET_HOURS_ALLOWED_CHANNELS || 'email').split(','),
  },
  
  retry: {
    maxAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS || '3'),
    initialDelay: parseInt(process.env.RETRY_INITIAL_DELAY || '1000'), // 1 second
    maxDelay: parseInt(process.env.RETRY_MAX_DELAY || '30000'), // 30 seconds
    backoffMultiplier: parseFloat(process.env.RETRY_BACKOFF_MULTIPLIER || '2.0'),
  },
  
  performance: {
    targetQueueTime: parseInt(process.env.TARGET_QUEUE_TIME_MS || '200'),
    batchSize: parseInt(process.env.BATCH_SIZE || '50'),
    concurrency: parseInt(process.env.CONCURRENCY || '10'),
  },
  
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['*'],
  },
  
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '1000'),
    timeWindow: process.env.RATE_LIMIT_WINDOW || '1 minute',
  },
};