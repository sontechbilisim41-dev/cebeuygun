import { AppDataSource } from '@/config/database';
import { IntegrationMetrics, SystemMetrics, SyncResult } from '@/types';
import { logger } from '@/utils/logger';
import { Repository } from 'typeorm';

class MetricsService {
  private metricsRepository: Repository<any>;
  private systemMetrics: SystemMetrics = {
    activeIntegrations: 0,
    totalSyncs: 0,
    queueSize: 0,
    errorRate: 0,
    averageResponseTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
  };

  constructor() {
    this.initializeRepository();
    this.startMetricsCollection();
  }

  private async initializeRepository(): Promise<void> {
    if (AppDataSource.isInitialized) {
      this.metricsRepository = AppDataSource.getRepository('IntegrationMetrics');
    }
  }

  async recordSyncMetrics(integrationId: string, result: SyncResult): Promise<void> {
    try {
      const existingMetrics = await this.getIntegrationMetrics(integrationId);
      
      const updatedMetrics: IntegrationMetrics = {
        integrationId,
        totalSyncs: existingMetrics.totalSyncs + 1,
        successfulSyncs: existingMetrics.successfulSyncs + (result.success ? 1 : 0),
        failedSyncs: existingMetrics.failedSyncs + (result.success ? 0 : 1),
        averageSyncTime: this.calculateAverageSyncTime(
          existingMetrics.averageSyncTime,
          existingMetrics.totalSyncs,
          result.duration
        ),
        lastSyncAt: result.timestamp,
        errorRate: this.calculateErrorRate(
          existingMetrics.failedSyncs + (result.success ? 0 : 1),
          existingMetrics.totalSyncs + 1
        ),
        dataVolume: {
          products: existingMetrics.dataVolume.products + (result.recordsProcessed || 0),
          orders: existingMetrics.dataVolume.orders,
          inventory: existingMetrics.dataVolume.inventory,
        },
      };

      await this.metricsRepository.save(updatedMetrics);

      // Update system metrics
      this.updateSystemMetrics(result);

      logger.debug(`Sync metrics recorded for ${integrationId}`, {
        totalSyncs: updatedMetrics.totalSyncs,
        errorRate: updatedMetrics.errorRate,
      });
    } catch (error) {
      logger.error(`Failed to record sync metrics for ${integrationId}:`, error);
    }
  }

  async getIntegrationMetrics(integrationId: string): Promise<IntegrationMetrics> {
    try {
      const metrics = await this.metricsRepository.findOne({
        where: { integrationId },
      });

      if (metrics) {
        return metrics;
      }

      // Return default metrics if not found
      return {
        integrationId,
        totalSyncs: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        averageSyncTime: 0,
        errorRate: 0,
        dataVolume: {
          products: 0,
          orders: 0,
          inventory: 0,
        },
      };
    } catch (error) {
      logger.error(`Failed to get integration metrics for ${integrationId}:`, error);
      throw error;
    }
  }

  async getAllIntegrationMetrics(): Promise<IntegrationMetrics[]> {
    try {
      return await this.metricsRepository.find({
        order: { lastSyncAt: 'DESC' },
      });
    } catch (error) {
      logger.error('Failed to get all integration metrics:', error);
      throw error;
    }
  }

  getSystemMetrics(): SystemMetrics {
    return { ...this.systemMetrics };
  }

  private updateSystemMetrics(syncResult: SyncResult): void {
    this.systemMetrics.totalSyncs += 1;
    
    if (!syncResult.success) {
      this.systemMetrics.errorRate = this.calculateErrorRate(
        this.systemMetrics.errorRate * this.systemMetrics.totalSyncs + 1,
        this.systemMetrics.totalSyncs
      );
    } else {
      this.systemMetrics.errorRate = this.calculateErrorRate(
        this.systemMetrics.errorRate * this.systemMetrics.totalSyncs,
        this.systemMetrics.totalSyncs
      );
    }

    this.systemMetrics.averageResponseTime = this.calculateAverageSyncTime(
      this.systemMetrics.averageResponseTime,
      this.systemMetrics.totalSyncs - 1,
      syncResult.duration
    );
  }

  private calculateAverageSyncTime(
    currentAverage: number,
    totalCount: number,
    newDuration: number
  ): number {
    if (totalCount === 0) return newDuration;
    return (currentAverage * totalCount + newDuration) / (totalCount + 1);
  }

  private calculateErrorRate(failedCount: number, totalCount: number): number {
    return totalCount > 0 ? failedCount / totalCount : 0;
  }

  private startMetricsCollection(): void {
    // Collect system metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);
  }

  private async collectSystemMetrics(): Promise<void> {
    try {
      // Get memory usage
      const memoryUsage = process.memoryUsage();
      this.systemMetrics.memoryUsage = memoryUsage.heapUsed / 1024 / 1024; // MB

      // Get CPU usage (simplified)
      const cpuUsage = process.cpuUsage();
      this.systemMetrics.cpuUsage = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds

      // Get active integrations count
      const activeIntegrations = await this.metricsRepository.count({
        where: { status: 'active' },
      });
      this.systemMetrics.activeIntegrations = activeIntegrations;

      // Log metrics periodically
      if (Date.now() % (5 * 60 * 1000) < 30000) { // Every 5 minutes
        logger.info('System metrics collected', this.systemMetrics);
      }
    } catch (error) {
      logger.error('Failed to collect system metrics:', error);
    }
  }

  async getMetricsSummary(timeRange: {
    startDate: string;
    endDate: string;
  }): Promise<{
    totalIntegrations: number;
    activeIntegrations: number;
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    averageErrorRate: number;
    averageSyncTime: number;
    topPerformingIntegrations: IntegrationMetrics[];
    problematicIntegrations: IntegrationMetrics[];
  }> {
    try {
      const allMetrics = await this.getAllIntegrationMetrics();
      
      const totalIntegrations = allMetrics.length;
      const activeIntegrations = allMetrics.filter(m => m.lastSyncAt).length;
      const totalSyncs = allMetrics.reduce((sum, m) => sum + m.totalSyncs, 0);
      const successfulSyncs = allMetrics.reduce((sum, m) => sum + m.successfulSyncs, 0);
      const failedSyncs = allMetrics.reduce((sum, m) => sum + m.failedSyncs, 0);
      const averageErrorRate = totalSyncs > 0 ? failedSyncs / totalSyncs : 0;
      const averageSyncTime = allMetrics.reduce((sum, m) => sum + m.averageSyncTime, 0) / totalIntegrations;

      // Top performing (lowest error rate, highest sync count)
      const topPerforming = allMetrics
        .filter(m => m.totalSyncs > 10)
        .sort((a, b) => a.errorRate - b.errorRate || b.totalSyncs - a.totalSyncs)
        .slice(0, 5);

      // Problematic (highest error rate)
      const problematic = allMetrics
        .filter(m => m.errorRate > 0.1) // More than 10% error rate
        .sort((a, b) => b.errorRate - a.errorRate)
        .slice(0, 5);

      return {
        totalIntegrations,
        activeIntegrations,
        totalSyncs,
        successfulSyncs,
        failedSyncs,
        averageErrorRate,
        averageSyncTime,
        topPerformingIntegrations: topPerforming,
        problematicIntegrations: problematic,
      };
    } catch (error) {
      logger.error('Failed to get metrics summary:', error);
      throw error;
    }
  }

  async generateMetricsReport(
    integrationId: string,
    timeRange: { startDate: string; endDate: string }
  ): Promise<{
    integration: IntegrationMetrics;
    timeline: Array<{
      date: string;
      syncs: number;
      errors: number;
      avgDuration: number;
    }>;
    summary: {
      uptime: number;
      reliability: number;
      performance: string;
    };
  }> {
    try {
      const integration = await this.getIntegrationMetrics(integrationId);
      
      // Generate mock timeline data (would be real data from database)
      const timeline = this.generateTimelineData(timeRange);
      
      // Calculate summary metrics
      const uptime = integration.totalSyncs > 0 ? 
        (integration.successfulSyncs / integration.totalSyncs) * 100 : 0;
      
      const reliability = 100 - (integration.errorRate * 100);
      
      let performance = 'Good';
      if (integration.averageSyncTime > 10000) performance = 'Poor';
      else if (integration.averageSyncTime > 5000) performance = 'Fair';
      else if (integration.averageSyncTime < 2000) performance = 'Excellent';

      return {
        integration,
        timeline,
        summary: {
          uptime,
          reliability,
          performance,
        },
      };
    } catch (error) {
      logger.error(`Failed to generate metrics report for ${integrationId}:`, error);
      throw error;
    }
  }

  private generateTimelineData(timeRange: { startDate: string; endDate: string }): Array<{
    date: string;
    syncs: number;
    errors: number;
    avgDuration: number;
  }> {
    const timeline = [];
    const start = new Date(timeRange.startDate);
    const end = new Date(timeRange.endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      timeline.push({
        date: date.toISOString().split('T')[0],
        syncs: Math.floor(Math.random() * 50) + 10,
        errors: Math.floor(Math.random() * 5),
        avgDuration: Math.floor(Math.random() * 3000) + 1000,
      });
    }
    
    return timeline;
  }
}

export const metricsService = new MetricsService();