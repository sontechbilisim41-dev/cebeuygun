import 'reflect-metadata';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config, validateConfig } from '@/config';
import { initializeDatabase } from '@/config/database';
import { chatService } from '@/services/chatService';
import { macroService } from '@/services/macroService';
import { logger } from '@/utils/logger';
import { chatRoutes } from '@/routes/chat';
import { ticketRoutes } from '@/routes/tickets';
import { webhookRoutes } from '@/routes/webhooks';

class SupportBridgeServer {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: config.env === 'production' ? 
          ['https://app.cebeuygun.com', 'https://admin.cebeuygun.com'] : 
          true,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.env === 'production' ? 
        ['https://app.cebeuygun.com', 'https://admin.cebeuygun.com'] : 
        true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request ID middleware
    this.app.use((req, res, next) => {
      req.headers['x-request-id'] = req.headers['x-request-id'] || 
        `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      res.set('X-Request-ID', req.headers['x-request-id'] as string);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        service: 'support-bridge',
      });
    });

    // API routes
    this.app.use('/api/chat', chatRoutes);
    this.app.use('/api/tickets', ticketRoutes);
    this.app.use('/webhooks', webhookRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        timestamp: new Date().toISOString(),
      });
    });
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Unhandled error:', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        requestId: req.headers['x-request-id'],
      });

      res.status(500).json({
        success: false,
        error: config.env === 'production' ? 'Internal server error' : error.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    });

    // Handle process signals
    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
  }

  async start(): Promise<void> {
    try {
      // Validate configuration
      validateConfig();

      // Initialize database
      await initializeDatabase();

      // Initialize services
      chatService.initialize(this.io);
      await macroService.initialize();

      // Start server
      this.server.listen(config.port, () => {
        logger.info(`Support Bridge started on port ${config.port}`, {
          environment: config.env,
          version: '1.0.0',
        });
      });

    } catch (error) {
      logger.error('Failed to start Support Bridge:', error);
      process.exit(1);
    }
  }

  private async gracefulShutdown(signal: string): Promise<void> {
    logger.info(`Graceful shutdown initiated by ${signal}`);

    try {
      // Close server
      if (this.server) {
        this.server.close(() => {
          logger.info('HTTP server closed');
        });
      }

      // Close Socket.IO
      this.io.close(() => {
        logger.info('Socket.IO server closed');
      });

      // Close database connection
      const { closeDatabase } = await import('@/config/database');
      await closeDatabase();

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new SupportBridgeServer();
server.start().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default server;