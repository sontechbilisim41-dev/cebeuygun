import { Request, Response } from 'express';
import { ticketService } from '@/services/ticketService';
import { logger } from '@/utils/logger';

export class TicketController {
  async createTicket(req: Request, res: Response): Promise<void> {
    try {
      const ticketData = req.body;
      const ticket = await ticketService.createTicket(ticketData);

      res.status(201).json({
        success: true,
        data: ticket,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Create ticket error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async getTicket(req: Request, res: Response): Promise<void> {
    try {
      const { ticketId } = req.params;
      const ticket = await ticketService.getTicket(ticketId);

      res.json({
        success: true,
        data: ticket,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get ticket error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async updateTicket(req: Request, res: Response): Promise<void> {
    try {
      const { ticketId } = req.params;
      const updates = req.body;

      const ticket = await ticketService.updateTicket(ticketId, updates);

      res.json({
        success: true,
        data: ticket,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Update ticket error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async getCustomerTickets(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const filters = req.query;

      const result = await ticketService.getCustomerTickets(customerId, filters);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get customer tickets error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async searchTickets(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query;
      const filters = req.body;

      const tickets = await ticketService.searchTickets(query as string, filters);

      res.json({
        success: true,
        data: tickets,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Search tickets error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const ticketController = new TicketController();