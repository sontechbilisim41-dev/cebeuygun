import { DatabaseService } from '@/config/database';
import { TariffRate, VehicleType, Location } from '@/types';
import { logger } from '@/utils/logger';
import { config } from '@/config';

export class TariffEngine {
  private database: DatabaseService;

  constructor(database: DatabaseService) {
    this.database = database;
  }

  /**
   * Get applicable tariff rate for courier and delivery
   */
  async getApplicableTariff(
    courierId: string,
    vehicleType: VehicleType,
    deliveryLocation: Location,
    deliveryTime: Date
  ): Promise<TariffRate> {
    try {
      // Get region from delivery location (simplified - in production, use geocoding)
      const region = await this.getRegionFromLocation(deliveryLocation);

      // Query for applicable tariff rates
      const query = `
        SELECT id, name, vehicle_type, region, base_delivery_fee, per_km_rate, 
               peak_hour_bonus, minimum_earning, maximum_earning, effective_from, 
               effective_to, is_active, created_at, updated_at
        FROM tariff_rates 
        WHERE is_active = true 
          AND effective_from <= $1 
          AND (effective_to IS NULL OR effective_to >= $1)
          AND (vehicle_type IS NULL OR vehicle_type = $2)
          AND (region IS NULL OR region = $3)
        ORDER BY 
          CASE WHEN vehicle_type IS NOT NULL THEN 1 ELSE 0 END DESC,
          CASE WHEN region IS NOT NULL THEN 1 ELSE 0 END DESC,
          effective_from DESC
        LIMIT 1`;

      const result = await this.database.query(query, [deliveryTime, vehicleType, region]);

      if (result.rows.length > 0) {
        return this.mapTariffRow(result.rows[0]);
      }

      // Fallback to default tariff
      return this.getDefaultTariff(vehicleType);
    } catch (error) {
      logger.error('Failed to get applicable tariff:', error);
      return this.getDefaultTariff(vehicleType);
    }
  }

  /**
   * Get default tariff configuration
   */
  private getDefaultTariff(vehicleType: VehicleType): TariffRate {
    const vehicleMultiplier = config.earnings.vehicleMultipliers[vehicleType] || 1.0;
    
    return {
      id: 'default',
      name: 'Varsayılan Tarife',
      vehicleType,
      baseDeliveryFee: Math.round(config.earnings.baseDeliveryFee * vehicleMultiplier),
      perKmRate: Math.round(config.earnings.perKmRate * vehicleMultiplier),
      peakHourBonus: config.earnings.peakHourBonus,
      minimumEarning: config.earnings.minimumPayout,
      effectiveFrom: new Date('2025-01-01'),
      isActive: true,
    };
  }

  /**
   * Check if delivery time is during peak hours
   */
  isPeakHour(deliveryTime: Date): boolean {
    const hour = deliveryTime.getHours();
    
    return config.earnings.peakHours.some(peak => 
      hour >= peak.start && hour < peak.end
    );
  }

  /**
   * Calculate distance-based earning
   */
  calculateDistanceEarning(distance: number, perKmRate: number): number {
    return Math.round(distance * perKmRate);
  }

  /**
   * Calculate peak hour bonus
   */
  calculatePeakHourBonus(baseAmount: number, bonusRate: number): number {
    return Math.round(baseAmount * (bonusRate / 100));
  }

  /**
   * Calculate vehicle type bonus
   */
  calculateVehicleBonus(baseAmount: number, vehicleType: VehicleType): number {
    const multiplier = config.earnings.vehicleMultipliers[vehicleType] || 1.0;
    return Math.round(baseAmount * (multiplier - 1.0));
  }

  /**
   * Create new tariff rate
   */
  async createTariffRate(tariff: Omit<TariffRate, 'id'>): Promise<TariffRate> {
    const id = require('uuid').v4();
    
    const query = `
      INSERT INTO tariff_rates (id, name, vehicle_type, region, base_delivery_fee, 
                               per_km_rate, peak_hour_bonus, minimum_earning, maximum_earning,
                               effective_from, effective_to, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`;

    const result = await this.database.query(query, [
      id,
      tariff.name,
      tariff.vehicleType,
      tariff.region,
      tariff.baseDeliveryFee,
      tariff.perKmRate,
      tariff.peakHourBonus,
      tariff.minimumEarning,
      tariff.maximumEarning,
      tariff.effectiveFrom,
      tariff.effectiveTo,
      tariff.isActive,
    ]);

    return this.mapTariffRow(result.rows[0]);
  }

  /**
   * Update tariff rate
   */
  async updateTariffRate(id: string, updates: Partial<TariffRate>): Promise<void> {
    const setParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        const dbKey = this.camelToSnake(key);
        setParts.push(`${dbKey} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (setParts.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE tariff_rates 
      SET ${setParts.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}`;
    
    values.push(id);

    const result = await this.database.query(query, values);
    
    if (result.rowCount === 0) {
      throw new Error('Tariff rate not found');
    }
  }

  /**
   * Get region from location (simplified implementation)
   */
  private async getRegionFromLocation(location: Location): Promise<string> {
    // In production, this would use a geocoding service
    // For now, return a default region based on coordinates
    
    // Istanbul coordinates check
    if (location.latitude >= 40.8 && location.latitude <= 41.2 &&
        location.longitude >= 28.7 && location.longitude <= 29.3) {
      return 'Istanbul';
    }
    
    // Ankara coordinates check
    if (location.latitude >= 39.7 && location.latitude <= 40.1 &&
        location.longitude >= 32.6 && location.longitude <= 33.0) {
      return 'Ankara';
    }
    
    return 'Other';
  }

  /**
   * Map database row to TariffRate object
   */
  private mapTariffRow(row: any): TariffRate {
    return {
      id: row.id,
      name: row.name,
      vehicleType: row.vehicle_type,
      region: row.region,
      baseDeliveryFee: row.base_delivery_fee,
      perKmRate: row.per_km_rate,
      peakHourBonus: row.peak_hour_bonus,
      minimumEarning: row.minimum_earning,
      maximumEarning: row.maximum_earning,
      effectiveFrom: row.effective_from,
      effectiveTo: row.effective_to,
      isActive: row.is_active,
    };
  }

  /**
   * Convert camelCase to snake_case
   */
  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}