import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8009', 10),
  
  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'support_bridge',
  },
  
  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '1', 10),
  },
  
  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    apiKeyPrefix: 'sb_',
    sessionSecret: process.env.SESSION_SECRET || 'session-secret-key',
  },
  
  // Chat Configuration
  chat: {
    maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS || '100', 10),
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '1800000', 10), // 30 minutes
    typingIndicatorTimeout: parseInt(process.env.TYPING_TIMEOUT || '3000', 10),
    messageRetention: parseInt(process.env.MESSAGE_RETENTION || '90', 10), // days
  },
  
  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    uploadPath: process.env.UPLOAD_PATH || '/tmp/uploads',
  },
  
  // External Services
  services: {
    ticketingApi: {
      baseUrl: process.env.TICKETING_API_URL || 'http://localhost:8010',
      apiKey: process.env.TICKETING_API_KEY || 'ticketing-api-key',
      timeout: 10000,
    },
    orderService: {
      baseUrl: process.env.ORDER_SERVICE_URL || 'http://localhost:8003',
      timeout: 5000,
    },
    customerService: {
      baseUrl: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:8001',
      timeout: 5000,
    },
    notificationService: {
      baseUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8006',
      timeout: 5000,
    },
  },
  
  // Webhook Configuration
  webhook: {
    secret: process.env.WEBHOOK_SECRET || 'webhook-secret-key',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false,
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    maxFiles: '14d',
    maxSize: '20m',
  },
  
  // SLA Configuration
  sla: {
    responseTime: {
      low: 24 * 60 * 60 * 1000, // 24 hours
      medium: 8 * 60 * 60 * 1000, // 8 hours
      high: 4 * 60 * 60 * 1000, // 4 hours
      urgent: 2 * 60 * 60 * 1000, // 2 hours
      critical: 30 * 60 * 1000, // 30 minutes
    },
    resolutionTime: {
      low: 7 * 24 * 60 * 60 * 1000, // 7 days
      medium: 3 * 24 * 60 * 60 * 1000, // 3 days
      high: 24 * 60 * 60 * 1000, // 24 hours
      urgent: 8 * 60 * 60 * 1000, // 8 hours
      critical: 4 * 60 * 60 * 1000, // 4 hours
    },
  },
} as const;

// Validation
const requiredEnvVars = [
  'DB_HOST',
  'DB_USERNAME',
  'DB_PASSWORD',
  'REDIS_HOST',
  'JWT_SECRET',
];

export const validateConfig = (): void => {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};