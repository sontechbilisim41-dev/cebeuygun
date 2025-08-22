import Joi from 'joi';

// Integration configuration validation
export const integrationConfigSchema = Joi.object({
  merchantId: Joi.string().required(),
  name: Joi.string().min(1).max(100).required(),
  type: Joi.string().valid('webhook', 'polling', 'hybrid').required(),
  connector: Joi.string().valid('csv', 'logo', 'netsis', 'custom').required(),
  status: Joi.string().valid('active', 'inactive', 'error', 'pending').default('pending'),
  settings: Joi.object().default({}),
  credentials: Joi.object({
    apiKey: Joi.string().optional(),
    username: Joi.string().optional(),
    password: Joi.string().optional(),
    endpoint: Joi.string().uri().optional(),
    token: Joi.string().optional(),
    customFields: Joi.object().optional(),
  }).required(),
  maxRetries: Joi.number().integer().min(1).max(10).default(3),
  retryDelay: Joi.number().integer().min(1000).max(300000).default(5000),
});

export const validateIntegrationConfig = (data: any) => {
  return integrationConfigSchema.validate(data, { abortEarly: false });
};

// Sync request validation
export const syncRequestSchema = Joi.object({
  type: Joi.string().valid('inventory', 'pricing', 'orders', 'products', 'full').required(),
  priority: Joi.number().integer().min(0).max(10).default(0),
  delay: Joi.number().integer().min(0).max(3600000).default(0), // Max 1 hour delay
  metadata: Joi.object().optional(),
});

export const validateSyncRequest = (data: any) => {
  return syncRequestSchema.validate(data, { abortEarly: false });
};

// Data mapping validation
export const dataMappingSchema = Joi.object({
  integrationId: Joi.string().required(),
  sourceField: Joi.string().required(),
  targetField: Joi.string().required(),
  transformation: Joi.string().optional(),
  defaultValue: Joi.any().optional(),
  required: Joi.boolean().default(false),
  validation: Joi.string().optional(),
});

export const validateDataMapping = (data: any) => {
  return dataMappingSchema.validate(data, { abortEarly: false });
};

// Webhook configuration validation
export const webhookConfigSchema = Joi.object({
  url: Joi.string().uri().required(),
  events: Joi.array().items(Joi.string()).min(1).required(),
  secret: Joi.string().min(16).optional(),
});

export const validateWebhookConfig = (data: any) => {
  return webhookConfigSchema.validate(data, { abortEarly: false });
};

// Product data validation
export const productSyncSchema = Joi.object({
  externalId: Joi.string().required(),
  sku: Joi.string().required(),
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).optional(),
  categoryId: Joi.string().optional(),
  brand: Joi.string().max(100).optional(),
  price: Joi.number().min(0).required(),
  currency: Joi.string().length(3).default('TRY'),
  stock: Joi.number().integer().min(0).required(),
  minStock: Joi.number().integer().min(0).optional(),
  maxStock: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().default(true),
  attributes: Joi.object().optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  lastModified: Joi.string().isoDate().required(),
});

export const validateProductSync = (data: any) => {
  return productSyncSchema.validate(data, { abortEarly: false });
};

// Inventory update validation
export const inventoryUpdateSchema = Joi.object({
  sku: Joi.string().required(),
  stock: Joi.number().integer().min(0).required(),
  reservedStock: Joi.number().integer().min(0).optional(),
  availableStock: Joi.number().integer().min(0).optional(),
  lastUpdated: Joi.string().isoDate().required(),
  location: Joi.string().optional(),
});

export const validateInventoryUpdate = (data: any) => {
  return inventoryUpdateSchema.validate(data, { abortEarly: false });
};

// Price update validation
export const priceUpdateSchema = Joi.object({
  sku: Joi.string().required(),
  price: Joi.number().min(0).required(),
  currency: Joi.string().length(3).default('TRY'),
  effectiveFrom: Joi.string().isoDate().required(),
  effectiveTo: Joi.string().isoDate().optional(),
  priceType: Joi.string().valid('regular', 'sale', 'bulk').default('regular'),
});

export const validatePriceUpdate = (data: any) => {
  return priceUpdateSchema.validate(data, { abortEarly: false });
};

// Order sync validation
export const orderSyncSchema = Joi.object({
  externalOrderId: Joi.string().required(),
  platformOrderId: Joi.string().optional(),
  status: Joi.string().valid(
    'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'
  ).required(),
  items: Joi.array().items(Joi.object({
    sku: Joi.string().required(),
    name: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
    unitPrice: Joi.number().min(0).required(),
    totalPrice: Joi.number().min(0).required(),
    attributes: Joi.object().optional(),
  })).min(1).required(),
  customer: Joi.object({
    externalId: Joi.string().optional(),
    name: Joi.string().required(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      district: Joi.string().optional(),
      postalCode: Joi.string().optional(),
      country: Joi.string().required(),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90).optional(),
        longitude: Joi.number().min(-180).max(180).optional(),
      }).optional(),
    }).optional(),
  }).required(),
  totalAmount: Joi.number().min(0).required(),
  currency: Joi.string().length(3).default('TRY'),
  orderDate: Joi.string().isoDate().required(),
  deliveryDate: Joi.string().isoDate().optional(),
  notes: Joi.string().max(500).optional(),
});

export const validateOrderSync = (data: any) => {
  return orderSyncSchema.validate(data, { abortEarly: false });
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// SQL injection detection
export const detectSQLInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|\/\*|\*\/)/,
    /(\bOR\b.*=.*\bOR\b)/i,
    /(\bAND\b.*=.*\bAND\b)/i,
    /(\b(EXEC|EXECUTE)\b)/i,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
};

// XSS detection
export const detectXSS = (input: string): boolean => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
};

// Validate file upload
export const validateFileUpload = (file: Express.Multer.File): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  // Check file size
  if (file.size > config.upload.maxFileSize) {
    errors.push(`File size exceeds limit of ${config.upload.maxFileSize / 1024 / 1024}MB`);
  }
  
  // Check MIME type
  if (!config.upload.allowedMimeTypes.includes(file.mimetype)) {
    errors.push(`File type ${file.mimetype} not allowed`);
  }
  
  // Check filename
  if (!/^[a-zA-Z0-9._-]+$/.test(file.originalname)) {
    errors.push('Filename contains invalid characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Rate limiting validation
export const validateRateLimit = (
  identifier: string,
  maxRequests: number,
  windowMs: number,
  store: Map<string, { count: number; resetTime: number }>
): { allowed: boolean; remaining: number; resetTime: number } => {
  const now = Date.now();
  const resetTime = now + windowMs;
  
  const record = store.get(identifier);
  
  if (!record || now > record.resetTime) {
    store.set(identifier, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime,
    };
  }
  
  record.count++;
  const allowed = record.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - record.count);
  
  return {
    allowed,
    remaining,
    resetTime: record.resetTime,
  };
};