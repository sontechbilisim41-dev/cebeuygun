import { TariffEngine } from './tariff-engine';
import { DatabaseService } from '@/config/database';
import { Delivery, EarningsCalculation, Money, VehicleType } from '@/types';
import { logger, earningsLogger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class EarningsCalculator {
  private tariffEngine: TariffEngine;
  private database: DatabaseService;

  constructor(database: DatabaseService) {
    this.database = database;
    this.tariffEngine = new TariffEngine(database);
  }

  /**
   * Calculate earnings for a single delivery
   */
  async calculateDeliveryEarnings(delivery: Delivery): Promise<EarningsCalculation> {
    const startTime = Date.now();
    
    try {
      logger.info('Calculating earnings for delivery', {
        deliveryId: delivery.id,
        courierId: delivery.courierId,
        distance: delivery.actualDistance,
        vehicleType: delivery.vehicleType,
      });

      // Get applicable tariff
      const tariff = await this.tariffEngine.getApplicableTariff(
        delivery.courierId,
        delivery.vehicleType,
        delivery.deliveryLocation,
        delivery.completedAt
      );

      // Calculate base earning
      const baseEarning = delivery.isExpressDelivery 
        ? tariff.baseDeliveryFee * 1.5 // Express delivery bonus
        : tariff.baseDeliveryFee;

      // Calculate distance earning
      const distanceEarning = this.tariffEngine.calculateDistanceEarning(
        delivery.actualDistance,
        tariff.perKmRate
      );

      // Check if delivery was during peak hours
      const isPeakHour = this.tariffEngine.isPeakHour(delivery.completedAt);
      
      // Calculate peak hour bonus
      const peakHourBonus = isPeakHour 
        ? this.tariffEngine.calculatePeakHourBonus(baseEarning + distanceEarning, tariff.peakHourBonus)
        : 0;

      // Calculate vehicle bonus
      const vehicleBonus = this.tariffEngine.calculateVehicleBonus(
        baseEarning + distanceEarning,
        delivery.vehicleType
      );

      // Calculate total earning
      const totalEarning = baseEarning + distanceEarning + peakHourBonus + vehicleBonus;

      // Apply minimum/maximum limits
      const finalEarning = Math.max(
        tariff.minimumEarning,
        tariff.maximumEarning ? Math.min(totalEarning, tariff.maximumEarning) : totalEarning
      );

      const calculation: EarningsCalculation = {
        deliveryId: delivery.id,
        courierId: delivery.courierId,
        baseEarning: { amount: baseEarning, currency: 'TRY' },
        distanceEarning: { amount: distanceEarning, currency: 'TRY' },
        peakHourBonus: { amount: peakHourBonus, currency: 'TRY' },
        vehicleBonus: { amount: vehicleBonus, currency: 'TRY' },
        totalEarning: { amount: finalEarning, currency: 'TRY' },
        calculationDetails: {
          baseRate: tariff.baseDeliveryFee,
          distance: delivery.actualDistance,
          distanceRate: tariff.perKmRate,
          isPeakHour,
          peakBonusRate: tariff.peakHourBonus,
          vehicleMultiplier: config.earnings.vehicleMultipliers[delivery.vehicleType] || 1.0,
          appliedTariff: tariff.name,
        },
        calculatedAt: new Date(),
      };

      // Store calculation in database
      await this.storeEarningsCalculation(calculation);

      // Log for audit
      earningsLogger.info('Earnings calculated', {
        deliveryId: delivery.id,
        courierId: delivery.courierId,
        totalEarning: finalEarning,
        baseEarning,
        distanceEarning,
        peakHourBonus,
        vehicleBonus,
        tariffUsed: tariff.name,
        processingTime: Date.now() - startTime,
      });

      logger.info('Earnings calculation completed', {
        deliveryId: delivery.id,
        totalEarning: finalEarning,
        processingTime: Date.now() - startTime,
      });

      return calculation;
    } catch (error) {
      logger.error('Failed to calculate earnings:', error);
      throw error;
    }
  }

  /**
   * Calculate earnings for multiple deliveries (batch processing)
   */
  async calculateBatchEarnings(deliveries: Delivery[]): Promise<EarningsCalculation[]> {
    const startTime = Date.now();
    
    try {
      logger.info('Calculating batch earnings', {
        deliveryCount: deliveries.length,
        courierIds: [...new Set(deliveries.map(d => d.courierId))],
      });

      const calculations: EarningsCalculation[] = [];
      const batchSize = 10;

      // Process in batches to avoid overwhelming the system
      for (let i = 0; i < deliveries.length; i += batchSize) {
        const batch = deliveries.slice(i, i + batchSize);
        const batchPromises = batch.map(delivery => this.calculateDeliveryEarnings(delivery));
        
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            calculations.push(result.value);
          } else {
            logger.error(`Failed to calculate earnings for delivery ${batch[index].id}:`, result.reason);
          }
        });
      }

      logger.info('Batch earnings calculation completed', {
        totalDeliveries: deliveries.length,
        successfulCalculations: calculations.length,
        failedCalculations: deliveries.length - calculations.length,
        processingTime: Date.now() - startTime,
      });

      return calculations;
    } catch (error) {
      logger.error('Failed to calculate batch earnings:', error);
      throw error;
    }
  }

  /**
   * Store earnings calculation in database
   */
  private async storeEarningsCalculation(calculation: EarningsCalculation): Promise<void> {
    const query = `
      INSERT INTO courier_earnings (id, delivery_id, courier_id, base_earning, distance_earning,
                                   peak_hour_bonus, vehicle_bonus, total_earning, calculation_details,
                                   calculated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (delivery_id) DO UPDATE SET
        base_earning = EXCLUDED.base_earning,
        distance_earning = EXCLUDED.distance_earning,
        peak_hour_bonus = EXCLUDED.peak_hour_bonus,
        vehicle_bonus = EXCLUDED.vehicle_bonus,
        total_earning = EXCLUDED.total_earning,
        calculation_details = EXCLUDED.calculation_details,
        calculated_at = EXCLUDED.calculated_at`;

    await this.database.query(query, [
      uuidv4(),
      calculation.deliveryId,
      calculation.courierId,
      calculation.baseEarning.amount,
      calculation.distanceEarning.amount,
      calculation.peakHourBonus.amount,
      calculation.vehicleBonus.amount,
      calculation.totalEarning.amount,
      JSON.stringify(calculation.calculationDetails),
      calculation.calculatedAt,
    ]);
  }

  /**
   * Get earnings for courier in date range
   */
  async getCourierEarnings(
    courierId: string,
    startDate: Date,
    endDate: Date
  ): Promise<EarningsCalculation[]> {
    const query = `
      SELECT ce.id, ce.delivery_id, ce.courier_id, ce.base_earning, ce.distance_earning,
             ce.peak_hour_bonus, ce.vehicle_bonus, ce.total_earning, ce.calculation_details,
             ce.calculated_at
      FROM courier_earnings ce
      WHERE ce.courier_id = $1 
        AND ce.calculated_at >= $2 
        AND ce.calculated_at <= $3
      ORDER BY ce.calculated_at DESC`;

    const result = await this.database.query(query, [courierId, startDate, endDate]);
    
    return result.rows.map((row: any) => ({
      deliveryId: row.delivery_id,
      courierId: row.courier_id,
      baseEarning: { amount: row.base_earning, currency: 'TRY' },
      distanceEarning: { amount: row.distance_earning, currency: 'TRY' },
      peakHourBonus: { amount: row.peak_hour_bonus, currency: 'TRY' },
      vehicleBonus: { amount: row.vehicle_bonus, currency: 'TRY' },
      totalEarning: { amount: row.total_earning, currency: 'TRY' },
      calculationDetails: JSON.parse(row.calculation_details),
      calculatedAt: row.calculated_at,
    }));
  }

  /**
   * Get total earnings for courier in period
   */
  async getTotalEarnings(courierId: string, startDate: Date, endDate: Date): Promise<Money> {
    const query = `
      SELECT COALESCE(SUM(total_earning), 0) as total
      FROM courier_earnings 
      WHERE courier_id = $1 
        AND calculated_at >= $2 
        AND calculated_at <= $3`;

    const result = await this.database.query(query, [courierId, startDate, endDate]);
    
    return {
      amount: parseInt(result.rows[0].total),
      currency: 'TRY',
    };
  }

  /**
   * Get earnings statistics for courier
   */
  async getEarningsStatistics(courierId: string, startDate: Date, endDate: Date): Promise<{
    totalEarnings: Money;
    totalDeliveries: number;
    totalDistance: number;
    averageEarningPerDelivery: Money;
    averageEarningPerKm: Money;
    peakHourDeliveries: number;
    peakHourEarnings: Money;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_deliveries,
        COALESCE(SUM(total_earning), 0) as total_earnings,
        COALESCE(SUM((calculation_details->>'distance')::numeric), 0) as total_distance,
        COALESCE(SUM(CASE WHEN (calculation_details->>'isPeakHour')::boolean THEN 1 ELSE 0 END), 0) as peak_hour_deliveries,
        COALESCE(SUM(CASE WHEN (calculation_details->>'isPeakHour')::boolean THEN total_earning ELSE 0 END), 0) as peak_hour_earnings
      FROM courier_earnings 
      WHERE courier_id = $1 
        AND calculated_at >= $2 
        AND calculated_at <= $3`;

    const result = await this.database.query(query, [courierId, startDate, endDate]);
    const stats = result.rows[0];

    const totalEarnings = parseInt(stats.total_earnings);
    const totalDeliveries = parseInt(stats.total_deliveries);
    const totalDistance = parseFloat(stats.total_distance);

    return {
      totalEarnings: { amount: totalEarnings, currency: 'TRY' },
      totalDeliveries,
      totalDistance,
      averageEarningPerDelivery: {
        amount: totalDeliveries > 0 ? Math.round(totalEarnings / totalDeliveries) : 0,
        currency: 'TRY',
      },
      averageEarningPerKm: {
        amount: totalDistance > 0 ? Math.round(totalEarnings / totalDistance) : 0,
        currency: 'TRY',
      },
      peakHourDeliveries: parseInt(stats.peak_hour_deliveries),
      peakHourEarnings: { amount: parseInt(stats.peak_hour_earnings), currency: 'TRY' },
    };
  }
}