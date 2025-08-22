import { Router } from 'express';
import { chatController } from '@/controllers/chatController';
import { authMiddleware } from '@/middleware/authMiddleware';
import { rateLimitMiddleware } from '@/middleware/rateLimitMiddleware';

const router = Router();

// Chat session management
router.post('/sessions', 
  rateLimitMiddleware({ windowMs: 5 * 60 * 1000, maxRequests: 10 }),
  chatController.createSession
);

router.get('/sessions/:sessionId', 
  authMiddleware,
  chatController.getSession
);

router.delete('/sessions/:sessionId', 
  authMiddleware,
  chatController.endSession
);

// Chat history
router.get('/sessions/:sessionId/messages', 
  authMiddleware,
  chatController.getChatHistory
);

// Macros
router.get('/macros', 
  authMiddleware,
  chatController.getMacros
);

router.post('/macros/:macroId/use', 
  authMiddleware,
  rateLimitMiddleware({ windowMs: 1 * 60 * 1000, maxRequests: 30 }),
  chatController.useMacro
);

// Metrics
router.get('/metrics', 
  authMiddleware,
  chatController.getMetrics
);

export { router as chatRoutes };