import { Router } from 'express';
import { ticketController } from '@/controllers/ticketController';
import { authMiddleware } from '@/middleware/authMiddleware';
import { rateLimitMiddleware } from '@/middleware/rateLimitMiddleware';

const router = Router();

// Ticket CRUD
router.post('/', 
  authMiddleware,
  rateLimitMiddleware({ windowMs: 5 * 60 * 1000, maxRequests: 20 }),
  ticketController.createTicket
);

router.get('/:ticketId', 
  authMiddleware,
  ticketController.getTicket
);

router.put('/:ticketId', 
  authMiddleware,
  rateLimitMiddleware({ windowMs: 1 * 60 * 1000, maxRequests: 50 }),
  ticketController.updateTicket
);

// Customer tickets
router.get('/customer/:customerId', 
  authMiddleware,
  ticketController.getCustomerTickets
);

// Search
router.post('/search', 
  authMiddleware,
  rateLimitMiddleware({ windowMs: 1 * 60 * 1000, maxRequests: 30 }),
  ticketController.searchTickets
);

export { router as ticketRoutes };