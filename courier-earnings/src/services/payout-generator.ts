import { EarningsCalculator } from './earnings-calculator';
import { ReportGenerator } from './report-generator';
import { DatabaseService } from '@/config/database';
import { PayoutSummary, CourierPayout, Money, EarningsCalculation } from '@/types';
import { logger, earningsLogger } from '@/utils/logger';
import { startOfWeek, endOfWeek, getWeek, getYear, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';

export class PayoutGenerator {
  private earningsCalculator: EarningsCalculator;
  private reportGenerator: ReportGenerator;
  private database: DatabaseService;

  constructor(database: DatabaseService) {
    this.database = database;
    this.earningsCalculator = new EarningsCalculator(database);
    this.reportGenerator = new ReportGenerator();
  }

  /**
   * Generate payout summary for courier
   */
  async generatePayoutSummary(
    courierId: string,
    startDate: Date,
    endDate: Date,
    includeDetails: boolean = true
  ): Promise<PayoutSummary> {
    const summaryStartTime = Date.now();
    
    try {
      logger.info('Generating payout summary', {
        courierId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        includeDetails,
      });

      // Get courier information
      const courierInfo = await this.getCourierInfo(courierId);
      
      // Get earnings calculations for the period
      const earnings = await this.earningsCalculator.getCourierEarnings(courierId, startDate, endDate);
      
      // Get earnings statistics
      const stats = await this.earningsCalculator.getEarningsStatistics(courierId, startDate, endDate);

      // Calculate period information
      const weekNumber = getWeek(startDate, { locale: tr });
      const year = getYear(startDate);

      // Calculate breakdown by day
      const dailyBreakdown = await this.calculateDailyBreakdown(courierId, startDate, endDate);
      
      // Calculate breakdown by vehicle type
      const vehicleBreakdown = this.calculateVehicleBreakdown(earnings);
      
      // Calculate peak vs regular hours breakdown
      const hoursBreakdown = this.calculateHoursBreakdown(earnings);

      const summary: PayoutSummary = {
        courierId,
        courierName: courierInfo.name,
        period: {
          startDate,
          endDate,
          weekNumber,
          year,
        },
        summary: {
          totalDeliveries: stats.totalDeliveries,
          totalDistance: stats.totalDistance,
          totalEarnings: stats.totalEarnings,
          baseEarnings: this.sumEarningsByType(earnings, 'base'),
          distanceEarnings: this.sumEarningsByType(earnings, 'distance'),
          bonusEarnings: this.sumBonusEarnings(earnings),
          averageEarningPerDelivery: stats.averageEarningPerDelivery,
          averageEarningPerKm: stats.averageEarningPerKm,
        },
        breakdown: {
          regularHours: hoursBreakdown.regular,
          peakHours: hoursBreakdown.peak,
          byVehicleType: vehicleBreakdown,
          byDay: dailyBreakdown,
        },
        deliveries: includeDetails ? earnings : undefined,
      };

      earningsLogger.info('Payout summary generated', {
        courierId,
        period: `${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`,
        totalEarnings: stats.totalEarnings.amount,
        totalDeliveries: stats.totalDeliveries,
        processingTime: Date.now() - summaryStartTime,
      });

      return summary;
    } catch (error) {
      logger.error('Failed to generate payout summary:', error);
      throw error;
    }
  }

  /**
   * Generate weekly payout for courier
   */
  async generateWeeklyPayout(courierId: string, weekDate: Date): Promise<CourierPayout> {
    try {
      const startDate = startOfWeek(weekDate, { weekStartsOn: 1 }); // Monday
      const endDate = endOfWeek(weekDate, { weekStartsOn: 1 }); // Sunday

      logger.info('Generating weekly payout', {
        courierId,
        weekStart: startDate.toISOString(),
        weekEnd: endDate.toISOString(),
      });

      // Generate payout summary
      const summary = await this.generatePayoutSummary(courierId, startDate, endDate, true);

      // Check minimum payout threshold
      if (summary.summary.totalEarnings.amount < config.earnings.minimumPayout) {
        logger.info('Payout below minimum threshold', {
          courierId,
          earnings: summary.summary.totalEarnings.amount,
          minimum: config.earnings.minimumPayout,
        });
      }

      // Generate report
      const reportPath = await this.reportGenerator.generatePayoutReport(summary, 'pdf');

      // Create payout record
      const payout: CourierPayout = {
        id: uuidv4(),
        courierId,
        periodStart: startDate,
        periodEnd: endDate,
        totalEarnings: summary.summary.totalEarnings,
        totalDeliveries: summary.summary.totalDeliveries,
        status: 'pending',
        reportPath,
        generatedAt: new Date(),
        metadata: {
          weekNumber: summary.period.weekNumber,
          year: summary.period.year,
          totalDistance: summary.summary.totalDistance,
          peakHourDeliveries: summary.breakdown.peakHours.deliveries,
        },
      };

      // Store payout in database
      await this.storePayout(payout);

      earningsLogger.info('Weekly payout generated', {
        payoutId: payout.id,
        courierId,
        totalEarnings: payout.totalEarnings.amount,
        totalDeliveries: payout.totalDeliveries,
        reportPath,
      });

      return payout;
    } catch (error) {
      logger.error('Failed to generate weekly payout:', error);
      throw error;
    }
  }

  /**
   * Generate bulk payouts for all eligible couriers
   */
  async generateBulkPayouts(weekDate: Date, courierIds?: string[]): Promise<CourierPayout[]> {
    const startTime = Date.now();
    
    try {
      logger.info('Generating bulk payouts', {
        weekDate: weekDate.toISOString(),
        courierIds: courierIds?.length || 'all',
      });

      // Get eligible couriers
      const eligibleCouriers = courierIds || await this.getEligibleCouriers(weekDate);
      
      const payouts: CourierPayout[] = [];
      const batchSize = 5; // Process 5 couriers at a time

      for (let i = 0; i < eligibleCouriers.length; i += batchSize) {
        const batch = eligibleCouriers.slice(i, i + batchSize);
        const batchPromises = batch.map(courierId => this.generateWeeklyPayout(courierId, weekDate));
        
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            payouts.push(result.value);
          } else {
            logger.error(`Failed to generate payout for courier ${batch[index]}:`, result.reason);
          }
        });
      }

      logger.info('Bulk payout generation completed', {
        totalCouriers: eligibleCouriers.length,
        successfulPayouts: payouts.length,
        failedPayouts: eligibleCouriers.length - payouts.length,
        processingTime: Date.now() - startTime,
      });

      return payouts;
    } catch (error) {
      logger.error('Failed to generate bulk payouts:', error);
      throw error;
    }
  }

  /**
   * Get courier information
   */
  private async getCourierInfo(courierId: string): Promise<{ name: string; email: string; phone: string }> {
    const query = `
      SELECT first_name, last_name, email, phone
      FROM couriers 
      WHERE id = $1`;

    const result = await this.database.query(query, [courierId]);
    
    if (result.rows.length === 0) {
      throw new Error('Courier not found');
    }

    const courier = result.rows[0];
    return {
      name: `${courier.first_name} ${courier.last_name}`,
      email: courier.email,
      phone: courier.phone,
    };
  }

  /**
   * Calculate daily breakdown
   */
  private async calculateDailyBreakdown(
    courierId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    date: string;
    deliveries: number;
    earnings: Money;
    peakHourDeliveries: number;
  }>> {
    const query = `
      SELECT 
        DATE(calculated_at) as date,
        COUNT(*) as deliveries,
        COALESCE(SUM(total_earning), 0) as earnings,
        COALESCE(SUM(CASE WHEN (calculation_details->>'isPeakHour')::boolean THEN 1 ELSE 0 END), 0) as peak_hour_deliveries
      FROM courier_earnings 
      WHERE courier_id = $1 
        AND calculated_at >= $2 
        AND calculated_at <= $3
      GROUP BY DATE(calculated_at)
      ORDER BY date`;

    const result = await this.database.query(query, [courierId, startDate, endDate]);
    
    return result.rows.map((row: any) => ({
      date: format(new Date(row.date), 'yyyy-MM-dd'),
      deliveries: parseInt(row.deliveries),
      earnings: { amount: parseInt(row.earnings), currency: 'TRY' },
      peakHourDeliveries: parseInt(row.peak_hour_deliveries),
    }));
  }

  /**
   * Calculate vehicle type breakdown
   */
  private calculateVehicleBreakdown(earnings: EarningsCalculation[]): Record<string, {
    deliveries: number;
    earnings: Money;
  }> {
    const breakdown: Record<string, { deliveries: number; earnings: Money }> = {};

    earnings.forEach(earning => {
      const vehicleType = earning.calculationDetails.vehicleMultiplier > 1.0 
        ? this.getVehicleTypeFromMultiplier(earning.calculationDetails.vehicleMultiplier)
        : 'WALKING';

      if (!breakdown[vehicleType]) {
        breakdown[vehicleType] = {
          deliveries: 0,
          earnings: { amount: 0, currency: 'TRY' },
        };
      }

      breakdown[vehicleType].deliveries++;
      breakdown[vehicleType].earnings.amount += earning.totalEarning.amount;
    });

    return breakdown;
  }

  /**
   * Calculate hours breakdown (peak vs regular)
   */
  private calculateHoursBreakdown(earnings: EarningsCalculation[]): {
    regular: { deliveries: number; earnings: Money };
    peak: { deliveries: number; earnings: Money; bonusAmount: Money };
  } {
    const regular = { deliveries: 0, earnings: { amount: 0, currency: 'TRY' as const } };
    const peak = { 
      deliveries: 0, 
      earnings: { amount: 0, currency: 'TRY' as const },
      bonusAmount: { amount: 0, currency: 'TRY' as const }
    };

    earnings.forEach(earning => {
      if (earning.calculationDetails.isPeakHour) {
        peak.deliveries++;
        peak.earnings.amount += earning.totalEarning.amount;
        peak.bonusAmount.amount += earning.peakHourBonus.amount;
      } else {
        regular.deliveries++;
        regular.earnings.amount += earning.totalEarning.amount;
      }
    });

    return { regular, peak };
  }

  /**
   * Sum earnings by type
   */
  private sumEarningsByType(earnings: EarningsCalculation[], type: 'base' | 'distance'): Money {
    const total = earnings.reduce((sum, earning) => {
      return sum + (type === 'base' ? earning.baseEarning.amount : earning.distanceEarning.amount);
    }, 0);

    return { amount: total, currency: 'TRY' };
  }

  /**
   * Sum bonus earnings
   */
  private sumBonusEarnings(earnings: EarningsCalculation[]): Money {
    const total = earnings.reduce((sum, earning) => {
      return sum + earning.peakHourBonus.amount + earning.vehicleBonus.amount;
    }, 0);

    return { amount: total, currency: 'TRY' };
  }

  /**
   * Get vehicle type from multiplier
   */
  private getVehicleTypeFromMultiplier(multiplier: number): string {
    if (multiplier >= 1.3) return 'CAR';
    if (multiplier >= 1.2) return 'MOTORBIKE';
    if (multiplier >= 1.1) return 'BICYCLE';
    return 'WALKING';
  }

  /**
   * Store payout in database
   */
  private async storePayout(payout: CourierPayout): Promise<void> {
    const query = `
      INSERT INTO courier_payouts (id, courier_id, period_start, period_end, total_earnings,
                                  total_deliveries, status, report_path, generated_at, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;

    await this.database.query(query, [
      payout.id,
      payout.courierId,
      payout.periodStart,
      payout.periodEnd,
      payout.totalEarnings.amount,
      payout.totalDeliveries,
      payout.status,
      payout.reportPath,
      payout.generatedAt,
      JSON.stringify(payout.metadata),
    ]);
  }

  /**
   * Get eligible couriers for payout
   */
  private async getEligibleCouriers(weekDate: Date): Promise<string[]> {
    const startDate = startOfWeek(weekDate, { weekStartsOn: 1 });
    const endDate = endOfWeek(weekDate, { weekStartsOn: 1 });

    const query = `
      SELECT DISTINCT courier_id
      FROM courier_earnings 
      WHERE calculated_at >= $1 
        AND calculated_at <= $2
        AND total_earning >= $3`;

    const result = await this.database.query(query, [
      startDate,
      endDate,
      config.earnings.minimumPayout,
    ]);

    return result.rows.map((row: any) => row.courier_id);
  }

  /**
   * Update payout status
   */
  async updatePayoutStatus(payoutId: string, status: PayoutStatus, processedAt?: Date): Promise<void> {
    const query = `
      UPDATE courier_payouts 
      SET status = $1, processed_at = $2, updated_at = NOW()
      WHERE id = $3`;

    await this.database.query(query, [status, processedAt, payoutId]);

    earningsLogger.info('Payout status updated', {
      payoutId,
      status,
      processedAt: processedAt?.toISOString(),
    });
  }

  /**
   * Get payout by ID
   */
  async getPayoutById(payoutId: string): Promise<CourierPayout | null> {
    const query = `
      SELECT id, courier_id, period_start, period_end, total_earnings, total_deliveries,
             status, report_path, generated_at, processed_at, metadata
      FROM courier_payouts 
      WHERE id = $1`;

    const result = await this.database.query(query, [payoutId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      courierId: row.courier_id,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      totalEarnings: { amount: row.total_earnings, currency: 'TRY' },
      totalDeliveries: row.total_deliveries,
      status: row.status,
      reportPath: row.report_path,
      generatedAt: row.generated_at,
      processedAt: row.processed_at,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    };
  }

  /**
   * Get courier payouts for period
   */
  async getCourierPayouts(
    courierId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CourierPayout[]> {
    let query = `
      SELECT id, courier_id, period_start, period_end, total_earnings, total_deliveries,
             status, report_path, generated_at, processed_at, metadata
      FROM courier_payouts 
      WHERE courier_id = $1`;
    
    const params = [courierId];
    
    if (startDate) {
      query += ` AND period_start >= $${params.length + 1}`;
      params.push(startDate);
    }
    
    if (endDate) {
      query += ` AND period_end <= $${params.length + 1}`;
      params.push(endDate);
    }
    
    query += ` ORDER BY period_start DESC`;

    const result = await this.database.query(query, params);
    
    return result.rows.map((row: any) => ({
      id: row.id,
      courierId: row.courier_id,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      totalEarnings: { amount: row.total_earnings, currency: 'TRY' },
      totalDeliveries: row.total_deliveries,
      status: row.status,
      reportPath: row.report_path,
      generatedAt: row.generated_at,
      processedAt: row.processed_at,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    }));
  }
}