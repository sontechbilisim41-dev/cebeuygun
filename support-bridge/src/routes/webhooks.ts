import { Router } from 'express';
import { webhookController } from '@/controllers/webhookController';
import { rateLimitMiddleware } from '@/middleware/rateLimitMiddleware';

const router = Router();

// Webhook endpoints - no auth required as they're called by external systems
router.post('/ticketing', 
  rateLimitMiddleware({ 
    windowMs: 1 * 60 * 1000, 
    maxRequests: 200,
    keyGenerator: (req) => `webhook:ticketing:${req.ip}`,
  }),
  webhookController.handleTicketingWebhook
);

router.post('/chat', 
  rateLimitMiddleware({ 
    windowMs: 1 * 60 * 1000, 
    maxRequests: 500,
    keyGenerator: (req) => `webhook:chat:${req.ip}`,
  }),
  webhookController.handleChatWebhook
);

export { router as webhookRoutes };