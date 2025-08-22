import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8008', 10),
  
  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'integration_gateway',
  },
  
  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  
  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    encryptionKey: process.env.ENCRYPTION_KEY || 'your-32-char-encryption-key-here',
    apiKeyPrefix: 'igw_',
    tokenExpiration: '24h',
  },
  
  // Queue Configuration
  queue: {
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
    concurrency: {
      sync: 5,
      webhook: 10,
      export: 2,
    },
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false,
  },
  
  // Sync Configuration
  sync: {
    defaultInterval: 5 * 60 * 1000, // 5 minutes
    maxBatchSize: 1000,
    timeoutMs: 30000,
    retryPolicy: {
      maxRetries: 3,
      backoffMultiplier: 2,
      maxDelay: 60000,
    },
  },
  
  // Webhook Configuration
  webhook: {
    timeout: 10000,
    maxPayloadSize: '10mb',
    signatureHeader: 'X-Webhook-Signature',
    timestampHeader: 'X-Webhook-Timestamp',
    maxAge: 300, // 5 minutes
  },
  
  // File Upload Configuration
  upload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
      'text/csv',
      'application/csv',
      'text/plain',
      'application/json',
      'application/xml',
    ],
    tempDir: process.env.TEMP_DIR || '/tmp',
  },
  
  // Monitoring Configuration
  monitoring: {
    healthCheckInterval: 30000, // 30 seconds
    metricsRetention: 7 * 24 * 60 * 60 * 1000, // 7 days
    alertThresholds: {
      errorRate: 0.05, // 5%
      responseTime: 1000, // 1 second
      queueSize: 1000,
    },
  },
  
  // External Services
  services: {
    platformApi: {
      baseUrl: process.env.PLATFORM_API_URL || 'http://localhost:3000/api',
      timeout: 10000,
      retries: 3,
    },
    notificationService: {
      baseUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8006',
      timeout: 5000,
    },
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    maxFiles: '14d',
    maxSize: '20m',
    auditRetention: '7y',
  },
} as const;

// Validation
const requiredEnvVars = [
  'DB_HOST',
  'DB_USERNAME',
  'DB_PASSWORD',
  'REDIS_HOST',
  'JWT_SECRET',
  'ENCRYPTION_KEY',
];

export const validateConfig = (): void => {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  if (config.security.encryptionKey.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 characters long');
  }
};