import { Request, Response } from 'express';
import { chatService } from '@/services/chatService';
import { macroService } from '@/services/macroService';
import { logger } from '@/utils/logger';

export class ChatController {
  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const { customerId, orderId, customerInfo } = req.body;

      if (!customerId) {
        res.status(400).json({
          success: false,
          error: 'Customer ID is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const session = await chatService.createChatSession(customerId, orderId, customerInfo);

      res.status(201).json({
        success: true,
        data: session,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Create chat session error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const session = await chatService.getSession(sessionId);

      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Session not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        success: true,
        data: session,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get chat session error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async getChatHistory(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { limit = 50 } = req.query;

      const messages = await chatService.getChatHistory(sessionId, parseInt(limit as string));

      res.json({
        success: true,
        data: messages,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get chat history error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async endSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { reason } = req.body;

      await chatService.endChatSession(sessionId, reason);

      res.json({
        success: true,
        message: 'Session ended successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('End chat session error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async getMacros(req: Request, res: Response): Promise<void> {
    try {
      const { category, search } = req.query;

      let macros;
      if (search) {
        macros = await macroService.searchMacros(search as string, category as string);
      } else {
        macros = await macroService.getMacros(category as string);
      }

      res.json({
        success: true,
        data: macros,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get macros error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async useMacro(req: Request, res: Response): Promise<void> {
    try {
      const { macroId } = req.params;
      const { variables } = req.body;

      const content = await macroService.useMacro(macroId, variables);

      res.json({
        success: true,
        data: { content },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Use macro error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await chatService.getSessionMetrics();

      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get chat metrics error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const chatController = new ChatController();