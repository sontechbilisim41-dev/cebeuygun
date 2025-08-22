import { AppDataSource } from '@/config/database';
import { AuditLog } from '@/types';
import { logger } from '@/utils/logger';
import { Repository } from 'typeorm';

class AuditService {
  private auditRepository: Repository<any>;

  constructor() {
    this.initializeRepository();
  }

  private async initializeRepository(): Promise<void> {
    if (AppDataSource.isInitialized) {
      this.auditRepository = AppDataSource.getRepository('AuditLog');
    }
  }

  async logEvent(event: Omit<AuditLog, 'id'>): Promise<void> {
    try {
      const auditLog: AuditLog = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...event,
      };

      // Save to database
      await this.auditRepository.save(auditLog);

      // Also log to application logger for immediate visibility
      logger.info('Audit event logged', {
        auditId: auditLog.id,
        integrationId: auditLog.integrationId,
        action: auditLog.action,
      });
    } catch (error) {
      logger.error('Failed to log audit event:', error);
      // Don't throw error to avoid breaking main flow
    }
  }

  async getAuditLogs(filters: {
    integrationId?: string;
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    try {
      const query: any = {};
      
      if (filters.integrationId) query.integrationId = filters.integrationId;
      if (filters.action) query.action = filters.action;
      if (filters.userId) query.userId = filters.userId;
      
      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) query.timestamp.$gte = filters.startDate;
        if (filters.endDate) query.timestamp.$lte = filters.endDate;
      }

      const [logs, total] = await this.auditRepository.findAndCount({
        where: query,
        order: { timestamp: 'DESC' },
        take: filters.limit || 100,
        skip: filters.offset || 0,
      });

      return { logs, total };
    } catch (error) {
      logger.error('Failed to get audit logs:', error);
      throw error;
    }
  }

  async exportAuditLogs(
    filters: any,
    format: 'csv' | 'json'
  ): Promise<{ filePath: string; recordCount: number }> {
    try {
      const { logs } = await this.getAuditLogs({ ...filters, limit: 10000 });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = `/tmp/audit_logs_${timestamp}.${format}`;
      
      if (format === 'csv') {
        await this.exportToCSV(logs, filePath);
      } else {
        await this.exportToJSON(logs, filePath);
      }

      logger.info(`Audit logs exported: ${filePath}`, {
        recordCount: logs.length,
        format,
      });

      return {
        filePath,
        recordCount: logs.length,
      };
    } catch (error) {
      logger.error('Failed to export audit logs:', error);
      throw error;
    }
  }

  private async exportToCSV(logs: AuditLog[], filePath: string): Promise<void> {
    const fs = require('fs').promises;
    const csvWriter = require('csv-writer').createObjectCsvWriter;

    const writer = csvWriter({
      path: filePath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'integrationId', title: 'Integration ID' },
        { id: 'action', title: 'Action' },
        { id: 'userId', title: 'User ID' },
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'ipAddress', title: 'IP Address' },
        { id: 'userAgent', title: 'User Agent' },
        { id: 'details', title: 'Details' },
      ],
    });

    const records = logs.map(log => ({
      ...log,
      details: JSON.stringify(log.details),
    }));

    await writer.writeRecords(records);
  }

  private async exportToJSON(logs: AuditLog[], filePath: string): Promise<void> {
    const fs = require('fs').promises;
    await fs.writeFile(filePath, JSON.stringify(logs, null, 2));
  }

  async cleanupOldLogs(retentionDays: number = 2555): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await this.auditRepository.delete({
        timestamp: { $lt: cutoffDate.toISOString() },
      });

      logger.info(`Cleaned up old audit logs`, {
        deletedCount: result.affected,
        cutoffDate: cutoffDate.toISOString(),
      });

      return result.affected || 0;
    } catch (error) {
      logger.error('Failed to cleanup old audit logs:', error);
      throw error;
    }
  }
}

export const auditService = new AuditService();