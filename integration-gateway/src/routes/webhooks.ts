import { Router } from 'express';
import { webhookController } from '@/controllers/webhookController';
import { rateLimitMiddleware } from '@/middleware/rateLimitMiddleware';

const router = Router();

// Webhook endpoint - no auth required as it's called by external systems
router.post('/:integrationId', 
  rateLimitMiddleware({ 
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 100, // Allow high frequency for webhooks
    keyGenerator: (req) => `webhook:${req.params.integrationId}:${req.ip}`,
  }),
  webhookController.handleWebhook
);

export { router as webhookRoutes };