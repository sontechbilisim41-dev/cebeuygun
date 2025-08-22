import { FastifyPluginAsync } from 'fastify';
import { 
  PayoutRequestSchema,
  ReportRequestSchema,
  BulkPayoutRequestSchema,
  TariffRateSchema 
} from '@/types';
import { PayoutGenerator } from '@/services/payout-generator';
import { TariffEngine } from '@/services/tariff-engine';
import { DatabaseService } from '@/config/database';
import { logger } from '@/utils/logger';

const earningsRoutes: FastifyPluginAsync = async (fastify) => {
  const database = new DatabaseService();
  await database.initialize();
  
  const payoutGenerator = new PayoutGenerator(database);
  const tariffEngine = new TariffEngine(database);

  // Generate payout summary for courier
  fastify.post('/payout/calculate', {
    schema: {
      body: PayoutRequestSchema,
    },
  }, async (request, reply) => {
    const startTime = Date.now();
    
    try {
      const { courierId, startDate, endDate, includeDetails } = PayoutRequestSchema.parse(request.body);
      
      logger.info('Payout calculation request received', {
        courierId,
        startDate,
        endDate,
        includeDetails,
      });

      const summary = await payoutGenerator.generatePayoutSummary(
        courierId,
        new Date(startDate),
        new Date(endDate),
        includeDetails
      );

      logger.info('Payout calculation completed', {
        courierId,
        totalEarnings: summary.summary.totalEarnings.amount,
        totalDeliveries: summary.summary.totalDeliveries,
        processingTime: Date.now() - startTime,
      });

      return reply.send({
        success: true,
        message: 'Payout summary calculated successfully',
        data: summary,
      });
    } catch (error) {
      logger.error('Payout calculation failed:', error);
      
      return reply.status(500).send({
        success: false,
        message: 'Failed to calculate payout',
        error: error.message,
      });
    }
  });

  // Generate weekly payout
  fastify.post('/payout/weekly/:courierId', async (request, reply) => {
    try {
      const { courierId } = request.params as { courierId: string };
      const { weekDate } = request.body as { weekDate?: string };
      
      const targetDate = weekDate ? new Date(weekDate) : new Date();
      
      logger.info('Weekly payout generation request', {
        courierId,
        weekDate: targetDate.toISOString(),
      });

      const payout = await payoutGenerator.generateWeeklyPayout(courierId, targetDate);

      return reply.send({
        success: true,
        message: 'Weekly payout generated successfully',
        data: payout,
      });
    } catch (error) {
      logger.error('Weekly payout generation failed:', error);
      
      return reply.status(500).send({
        success: false,
        message: 'Failed to generate weekly payout',
        error: error.message,
      });
    }
  });

  // Generate report
  fastify.post('/reports/generate', {
    schema: {
      body: ReportRequestSchema,
    },
  }, async (request, reply) => {
    try {
      const reportRequest = ReportRequestSchema.parse(request.body);
      
      logger.info('Report generation request received', {
        courierId: reportRequest.courierId,
        format: reportRequest.format,
        language: reportRequest.language,
      });

      // Generate payout summary
      const summary = await payoutGenerator.generatePayoutSummary(
        reportRequest.courierId,
        new Date(reportRequest.startDate),
        new Date(reportRequest.endDate),
        reportRequest.includeDetails
      );

      // Generate report file
      const reportGenerator = new (await import('@/services/report-generator')).ReportGenerator();
      const filePath = await reportGenerator.generatePayoutReport(
        summary,
        reportRequest.format,
        reportRequest.language
      );

      return reply.send({
        success: true,
        message: 'Report generated successfully',
        data: {
          filePath,
          summary,
        },
      });
    } catch (error) {
      logger.error('Report generation failed:', error);
      
      return reply.status(500).send({
        success: false,
        message: 'Failed to generate report',
        error: error.message,
      });
    }
  });

  // Bulk payout generation
  fastify.post('/payout/bulk', {
    schema: {
      body: BulkPayoutRequestSchema,
    },
  }, async (request, reply) => {
    try {
      const bulkRequest = BulkPayoutRequestSchema.parse(request.body);
      
      logger.info('Bulk payout generation request', {
        startDate: bulkRequest.startDate,
        endDate: bulkRequest.endDate,
        courierIds: bulkRequest.courierIds?.length || 'all',
      });

      const payouts = await payoutGenerator.generateBulkPayouts(
        new Date(bulkRequest.startDate),
        bulkRequest.courierIds
      );

      return reply.send({
        success: true,
        message: 'Bulk payouts generated successfully',
        data: {
          payouts,
          totalGenerated: payouts.length,
        },
      });
    } catch (error) {
      logger.error('Bulk payout generation failed:', error);
      
      return reply.status(500).send({
        success: false,
        message: 'Failed to generate bulk payouts',
        error: error.message,
      });
    }
  });

  // Get courier earnings history
  fastify.get('/earnings/:courierId', async (request, reply) => {
    try {
      const { courierId } = request.params as { courierId: string };
      const { startDate, endDate } = request.query as { startDate?: string; endDate?: string };
      
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const end = endDate ? new Date(endDate) : new Date();

      const earnings = await payoutGenerator.earningsCalculator.getCourierEarnings(courierId, start, end);

      return reply.send({
        success: true,
        message: 'Earnings history retrieved successfully',
        data: {
          earnings,
          period: {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          },
        },
      });
    } catch (error) {
      logger.error('Failed to get earnings history:', error);
      
      return reply.status(500).send({
        success: false,
        message: 'Failed to retrieve earnings history',
        error: error.message,
      });
    }
  });

  // Get courier payouts
  fastify.get('/payouts/:courierId', async (request, reply) => {
    try {
      const { courierId } = request.params as { courierId: string };
      const { startDate, endDate } = request.query as { startDate?: string; endDate?: string };
      
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      const payouts = await payoutGenerator.getCourierPayouts(courierId, start, end);

      return reply.send({
        success: true,
        message: 'Payouts retrieved successfully',
        data: payouts,
      });
    } catch (error) {
      logger.error('Failed to get payouts:', error);
      
      return reply.status(500).send({
        success: false,
        message: 'Failed to retrieve payouts',
        error: error.message,
      });
    }
  });

  // Create tariff rate
  fastify.post('/tariffs', {
    schema: {
      body: TariffRateSchema.omit({ id: true }),
    },
  }, async (request, reply) => {
    try {
      const tariffData = request.body as any;
      
      const tariff = await tariffEngine.createTariffRate({
        ...tariffData,
        effectiveFrom: new Date(tariffData.effectiveFrom),
        effectiveTo: tariffData.effectiveTo ? new Date(tariffData.effectiveTo) : undefined,
      });

      return reply.status(201).send({
        success: true,
        message: 'Tariff rate created successfully',
        data: tariff,
      });
    } catch (error) {
      logger.error('Failed to create tariff rate:', error);
      
      return reply.status(400).send({
        success: false,
        message: 'Failed to create tariff rate',
        error: error.message,
      });
    }
  });

  // Update tariff rate
  fastify.put('/tariffs/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const updates = request.body as any;
      
      await tariffEngine.updateTariffRate(id, updates);

      return reply.send({
        success: true,
        message: 'Tariff rate updated successfully',
      });
    } catch (error) {
      logger.error('Failed to update tariff rate:', error);
      
      return reply.status(400).send({
        success: false,
        message: 'Failed to update tariff rate',
        error: error.message,
      });
    }
  });

  // Cleanup on close
  fastify.addHook('onClose', async () => {
    await database.disconnect();
  });
};

export { earningsRoutes };