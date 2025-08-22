import { Router } from 'express';
import { integrationController } from '@/controllers/integrationController';
import { webhookController } from '@/controllers/webhookController';
import { authMiddleware } from '@/middleware/authMiddleware';
import { rateLimitMiddleware } from '@/middleware/rateLimitMiddleware';
import { cacheMiddleware } from '@/middleware/cacheMiddleware';

const router = Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Integration CRUD operations
router.post('/', 
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, maxRequests: 10 }),
  integrationController.createIntegration
);

router.get('/', 
  cacheMiddleware(300), // 5 minutes cache
  integrationController.listIntegrations
);

router.get('/:integrationId', 
  cacheMiddleware(60), // 1 minute cache
  integrationController.getIntegration
);

router.put('/:integrationId', 
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, maxRequests: 20 }),
  integrationController.updateIntegration
);

router.delete('/:integrationId', 
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, maxRequests: 5 }),
  integrationController.deleteIntegration
);

// Connection testing
router.post('/:integrationId/test-connection', 
  rateLimitMiddleware({ windowMs: 5 * 60 * 1000, maxRequests: 10 }),
  integrationController.testConnection
);

// Sync operations
router.post('/:integrationId/sync', 
  rateLimitMiddleware({ windowMs: 1 * 60 * 1000, maxRequests: 5 }),
  integrationController.triggerSync
);

// Metrics
router.get('/:integrationId/metrics', 
  cacheMiddleware(120), // 2 minutes cache
  integrationController.getIntegrationMetrics
);

// Webhook management
router.post('/:integrationId/webhook/register', 
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, maxRequests: 5 }),
  webhookController.registerWebhook
);

router.delete('/:integrationId/webhook', 
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, maxRequests: 5 }),
  webhookController.unregisterWebhook
);

router.post('/:integrationId/webhook/test', 
  rateLimitMiddleware({ windowMs: 5 * 60 * 1000, maxRequests: 10 }),
  webhookController.testWebhook
);

router.get('/:integrationId/webhook/logs', 
  cacheMiddleware(60),
  webhookController.getWebhookLogs
);

// System endpoints
router.get('/system/health', integrationController.getSystemHealth);
router.get('/system/connectors', integrationController.getAvailableConnectors);

export { router as integrationRoutes };