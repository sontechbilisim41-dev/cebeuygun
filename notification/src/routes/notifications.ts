import { FastifyPluginAsync } from 'fastify';
import { 
  SendNotificationSchema,
  BulkNotificationSchema,
  NotificationTemplateSchema 
} from '@/types';
import { NotificationOrchestrator } from '@/services/notification-orchestrator';
import { logger } from '@/utils/logger';

const notificationsRoutes: FastifyPluginAsync = async (fastify) => {
  const orchestrator = fastify.notificationOrchestrator as NotificationOrchestrator;

  // Send single notification
  fastify.post('/send', {
    schema: {
      body: SendNotificationSchema,
    },
  }, async (request, reply) => {
    const startTime = Date.now();
    
    try {
      const notificationRequest = SendNotificationSchema.parse(request.body);
      
      logger.info('Notification send request received', {
        userId: notificationRequest.userId,
        eventType: notificationRequest.eventType,
        channels: notificationRequest.channels,
        priority: notificationRequest.priority,
      });

      const result = await orchestrator.processNotification(notificationRequest);

      return reply.send({
        success: true,
        message: 'Notification processed successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Notification send failed:', error);
      
      return reply.status(400).send({
        success: false,
        message: 'Failed to send notification',
        error: error.message,
      });
    }
  });

  // Send bulk notifications
  fastify.post('/bulk', {
    schema: {
      body: BulkNotificationSchema,
    },
  }, async (request, reply) => {
    try {
      const bulkRequest = BulkNotificationSchema.parse(request.body);
      
      logger.info('Bulk notification request received', {
        userCount: bulkRequest.userIds.length,
        eventType: bulkRequest.eventType,
        channels: bulkRequest.channels,
      });

      const result = await orchestrator.processBulkNotification(bulkRequest);

      return reply.send({
        success: true,
        message: 'Bulk notifications processed',
        data: result,
      });
    } catch (error) {
      logger.error('Bulk notification failed:', error);
      
      return reply.status(400).send({
        success: false,
        message: 'Failed to send bulk notifications',
        error: error.message,
      });
    }
  });

  // Get notification metrics
  fastify.get('/metrics', async (request, reply) => {
    try {
      const { start_date, end_date, channel } = request.query as any;
      
      if (!start_date || !end_date) {
        return reply.status(400).send({
          success: false,
          message: 'start_date and end_date are required',
        });
      }

      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      const metrics = await orchestrator.getNotificationMetrics(startDate, endDate, channel);

      return reply.send({
        success: true,
        message: 'Metrics retrieved successfully',
        data: metrics,
      });
    } catch (error) {
      logger.error('Failed to get metrics:', error);
      
      return reply.status(500).send({
        success: false,
        message: 'Failed to retrieve metrics',
        error: error.message,
      });
    }
  });

  // Get queue statistics
  fastify.get('/queue/stats', async (request, reply) => {
    try {
      const queueManager = fastify.queueManager as any;
      const stats = await queueManager.getQueueStats();

      return reply.send({
        success: true,
        message: 'Queue statistics retrieved',
        data: stats,
      });
    } catch (error) {
      logger.error('Failed to get queue stats:', error);
      
      return reply.status(500).send({
        success: false,
        message: 'Failed to retrieve queue statistics',
        error: error.message,
      });
    }
  });

  // Create notification template
  fastify.post('/templates', {
    schema: {
      body: NotificationTemplateSchema.omit({ id: true }),
    },
  }, async (request, reply) => {
    try {
      const templateData = request.body as any;
      const templateId = require('uuid').v4();
      
      const query = `
        INSERT INTO notification_templates (id, name, description, event_type, channel, language, subject, title, body, variables, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`;

      const result = await fastify.database.query(query, [
        templateId,
        templateData.name,
        templateData.description,
        templateData.eventType,
        templateData.channel,
        templateData.language,
        templateData.subject,
        templateData.title,
        templateData.body,
        JSON.stringify(templateData.variables),
        templateData.isActive,
      ]);

      return reply.status(201).send({
        success: true,
        message: 'Template created successfully',
        data: result.rows[0],
      });
    } catch (error) {
      logger.error('Template creation failed:', error);
      
      return reply.status(400).send({
        success: false,
        message: 'Failed to create template',
        error: error.message,
      });
    }
  });

  // Get notification templates
  fastify.get('/templates', async (request, reply) => {
    try {
      const { event_type, channel, language } = request.query as any;
      
      let query = 'SELECT * FROM notification_templates WHERE is_active = true';
      const params: any[] = [];
      let paramIndex = 1;

      if (event_type) {
        query += ` AND event_type = $${paramIndex}`;
        params.push(event_type);
        paramIndex++;
      }

      if (channel) {
        query += ` AND channel = $${paramIndex}`;
        params.push(channel);
        paramIndex++;
      }

      if (language) {
        query += ` AND language = $${paramIndex}`;
        params.push(language);
        paramIndex++;
      }

      query += ' ORDER BY event_type, channel, language';

      const result = await fastify.database.query(query, params);

      return reply.send({
        success: true,
        message: 'Templates retrieved successfully',
        data: result.rows,
      });
    } catch (error) {
      logger.error('Failed to get templates:', error);
      
      return reply.status(500).send({
        success: false,
        message: 'Failed to retrieve templates',
        error: error.message,
      });
    }
  });
};

export { notificationsRoutes };