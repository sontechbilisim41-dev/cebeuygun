// Security configuration constants
export const SecurityConfig = {
  // Authentication
  TOKEN_ROTATION_INTERVAL: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  
  // Encryption
  ENCRYPTION_ALGORITHM: 'AES-256-GCM',
  KEY_ROTATION_INTERVAL: 90 * 24 * 60 * 60 * 1000, // 90 days
  
  // Rate Limiting
  RATE_LIMITS: {
    LOGIN: { requests: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    API: { requests: 100, window: 60 * 1000 }, // 100 requests per minute
    SENSITIVE: { requests: 10, window: 60 * 1000 }, // 10 requests per minute
    FILE_UPLOAD: { requests: 5, window: 60 * 1000 }, // 5 uploads per minute
  },
  
  // Data Protection
  PII_MASKING: {
    EMAIL: { showFirst: 2, showLast: 0 },
    PHONE: { showFirst: 3, showLast: 4 },
    NAME: { showFirst: 2, showLast: 0 },
    ADDRESS: { showFirst: 10, showLast: 0 },
  },
  
  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ],
  
  // Audit Logging
  AUDIT_LOG_RETENTION: {
    CRITICAL: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
    HIGH: 3 * 365 * 24 * 60 * 60 * 1000, // 3 years
    MEDIUM: 1 * 365 * 24 * 60 * 60 * 1000, // 1 year
    LOW: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  
  // GDPR/KVKK
  DATA_RETENTION: {
    BASIC_PII: 2555, // 7 years in days
    MARKETING_DATA: 1095, // 3 years
    ANALYTICS_DATA: 730, // 2 years
    SUPPORT_DATA: 1825, // 5 years
    LOCATION_DATA: 365, // 1 year
  },
  
  CONSENT_VERSION: '1.0',
  DPO_EMAIL: 'dpo@company.com',
  
  // Security Headers
  SECURITY_HEADERS: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  },
  
  // Monitoring
  SECURITY_MONITORING: {
    FAILED_LOGIN_THRESHOLD: 5,
    SUSPICIOUS_ACTIVITY_THRESHOLD: 10,
    DATA_ACCESS_ANOMALY_THRESHOLD: 100,
    ALERT_CHANNELS: ['email', 'sms'],
  },
  
  // Incident Response
  INCIDENT_SEVERITY_LEVELS: {
    CRITICAL: {
      responseTime: 15 * 60 * 1000, // 15 minutes
      escalation: ['security-team', 'management'],
    },
    HIGH: {
      responseTime: 60 * 60 * 1000, // 1 hour
      escalation: ['security-team'],
    },
    MEDIUM: {
      responseTime: 4 * 60 * 60 * 1000, // 4 hours
      escalation: ['security-team'],
    },
    LOW: {
      responseTime: 24 * 60 * 60 * 1000, // 24 hours
      escalation: [],
    },
  },
} as const;

// Environment-specific security settings
export const getSecurityConfig = (environment: 'development' | 'staging' | 'production') => {
  const baseConfig = SecurityConfig;
  
  switch (environment) {
    case 'development':
      return {
        ...baseConfig,
        // Relaxed settings for development
        TOKEN_ROTATION_INTERVAL: 60 * 60 * 1000, // 1 hour
        SESSION_TIMEOUT: 2 * 60 * 60 * 1000, // 2 hours
        MAX_LOGIN_ATTEMPTS: 10,
        RATE_LIMITS: {
          ...baseConfig.RATE_LIMITS,
          API: { requests: 1000, window: 60 * 1000 },
        },
      };
      
    case 'staging':
      return {
        ...baseConfig,
        // Slightly relaxed for testing
        MAX_LOGIN_ATTEMPTS: 7,
      };
      
    case 'production':
    default:
      return baseConfig;
  }
};

// Security feature flags
export const SecurityFeatures = {
  BIOMETRIC_AUTH: true,
  TWO_FACTOR_AUTH: false, // Future feature
  DEVICE_FINGERPRINTING: true,
  BEHAVIORAL_ANALYTICS: false, // Future feature
  ADVANCED_THREAT_DETECTION: false, // Future feature
  ZERO_TRUST_ARCHITECTURE: false, // Future feature
} as const;