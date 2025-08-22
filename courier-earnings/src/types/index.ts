import { z } from 'zod';

// Delivery status types
export type DeliveryStatus = 'completed' | 'cancelled' | 'failed';
export type VehicleType = 'WALKING' | 'BICYCLE' | 'MOTORBIKE' | 'CAR';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Base schemas
export const MoneySchema = z.object({
  amount: z.number().int().min(0),
  currency: z.string().length(3).default('TRY'),
});

export const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
});

export const DeliverySchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  courierId: z.string().uuid(),
  status: z.enum(['completed', 'cancelled', 'failed']),
  pickupLocation: LocationSchema,
  deliveryLocation: LocationSchema,
  actualDistance: z.number().min(0), // km
  actualDuration: z.number().min(0), // minutes
  isExpressDelivery: z.boolean(),
  vehicleType: z.enum(['WALKING', 'BICYCLE', 'MOTORBIKE', 'CAR']),
  completedAt: z.string().datetime(),
  pickupTime: z.string().datetime(),
  deliveryTime: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
});

// Tariff calculation schemas
export const TariffRateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  vehicleType: z.enum(['WALKING', 'BICYCLE', 'MOTORBIKE', 'CAR']).optional(),
  region: z.string().optional(),
  baseDeliveryFee: z.number().int().min(0), // kuruş
  perKmRate: z.number().int().min(0), // kuruş/km
  peakHourBonus: z.number().min(0).max(100), // yüzde
  minimumEarning: z.number().int().min(0), // kuruş
  maximumEarning: z.number().int().optional(), // kuruş
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
});

// Earnings calculation schemas
export const EarningsCalculationSchema = z.object({
  deliveryId: z.string().uuid(),
  courierId: z.string().uuid(),
  baseEarning: MoneySchema,
  distanceEarning: MoneySchema,
  peakHourBonus: MoneySchema,
  vehicleBonus: MoneySchema,
  totalEarning: MoneySchema,
  calculationDetails: z.object({
    baseRate: z.number(),
    distance: z.number(),
    distanceRate: z.number(),
    isPeakHour: z.boolean(),
    peakBonusRate: z.number(),
    vehicleMultiplier: z.number(),
    appliedTariff: z.string(),
  }),
  calculatedAt: z.string().datetime(),
});

// Payout schemas
export const PayoutRequestSchema = z.object({
  courierId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  includeDetails: z.boolean().default(true),
});

export const PayoutSummarySchema = z.object({
  courierId: z.string().uuid(),
  courierName: z.string(),
  period: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    weekNumber: z.number(),
    year: z.number(),
  }),
  summary: z.object({
    totalDeliveries: z.number().int(),
    totalDistance: z.number(),
    totalEarnings: MoneySchema,
    baseEarnings: MoneySchema,
    distanceEarnings: MoneySchema,
    bonusEarnings: MoneySchema,
    averageEarningPerDelivery: MoneySchema,
    averageEarningPerKm: MoneySchema,
  }),
  breakdown: z.object({
    regularHours: z.object({
      deliveries: z.number().int(),
      earnings: MoneySchema,
    }),
    peakHours: z.object({
      deliveries: z.number().int(),
      earnings: MoneySchema,
      bonusAmount: MoneySchema,
    }),
    byVehicleType: z.record(z.object({
      deliveries: z.number().int(),
      earnings: MoneySchema,
    })),
    byDay: z.array(z.object({
      date: z.string(),
      deliveries: z.number().int(),
      earnings: MoneySchema,
      peakHourDeliveries: z.number().int(),
    })),
  }),
  deliveries: z.array(EarningsCalculationSchema).optional(),
});

// Report generation schemas
export const ReportRequestSchema = z.object({
  courierId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  format: z.enum(['pdf', 'csv']).default('pdf'),
  includeDetails: z.boolean().default(true),
  language: z.enum(['tr', 'en']).default('tr'),
});

export const BulkPayoutRequestSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  courierIds: z.array(z.string().uuid()).optional(),
  minimumAmount: z.number().int().min(0).optional(),
  format: z.enum(['pdf', 'csv']).default('pdf'),
});

// Internal types
export interface Delivery {
  id: string;
  orderId: string;
  courierId: string;
  status: DeliveryStatus;
  pickupLocation: Location;
  deliveryLocation: Location;
  actualDistance: number;
  actualDuration: number;
  isExpressDelivery: boolean;
  vehicleType: VehicleType;
  completedAt: Date;
  pickupTime: Date;
  deliveryTime: Date;
  metadata?: Record<string, any>;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface TariffRate {
  id: string;
  name: string;
  vehicleType?: VehicleType;
  region?: string;
  baseDeliveryFee: number;
  perKmRate: number;
  peakHourBonus: number;
  minimumEarning: number;
  maximumEarning?: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
}

export interface EarningsCalculation {
  deliveryId: string;
  courierId: string;
  baseEarning: Money;
  distanceEarning: Money;
  peakHourBonus: Money;
  vehicleBonus: Money;
  totalEarning: Money;
  calculationDetails: {
    baseRate: number;
    distance: number;
    distanceRate: number;
    isPeakHour: boolean;
    peakBonusRate: number;
    vehicleMultiplier: number;
    appliedTariff: string;
  };
  calculatedAt: Date;
}

export interface PayoutSummary {
  courierId: string;
  courierName: string;
  period: {
    startDate: Date;
    endDate: Date;
    weekNumber: number;
    year: number;
  };
  summary: {
    totalDeliveries: number;
    totalDistance: number;
    totalEarnings: Money;
    baseEarnings: Money;
    distanceEarnings: Money;
    bonusEarnings: Money;
    averageEarningPerDelivery: Money;
    averageEarningPerKm: Money;
  };
  breakdown: {
    regularHours: {
      deliveries: number;
      earnings: Money;
    };
    peakHours: {
      deliveries: number;
      earnings: Money;
      bonusAmount: Money;
    };
    byVehicleType: Record<string, {
      deliveries: number;
      earnings: Money;
    }>;
    byDay: Array<{
      date: string;
      deliveries: number;
      earnings: Money;
      peakHourDeliveries: number;
    }>;
  };
  deliveries?: EarningsCalculation[];
}

export interface CourierPayout {
  id: string;
  courierId: string;
  periodStart: Date;
  periodEnd: Date;
  totalEarnings: Money;
  totalDeliveries: number;
  status: PayoutStatus;
  reportPath?: string;
  generatedAt: Date;
  processedAt?: Date;
  metadata?: Record<string, any>;
}

// Type exports
export type Money = z.infer<typeof MoneySchema>;
export type DeliveryData = z.infer<typeof DeliverySchema>;
export type TariffRateData = z.infer<typeof TariffRateSchema>;
export type EarningsCalculationData = z.infer<typeof EarningsCalculationSchema>;
export type PayoutRequest = z.infer<typeof PayoutRequestSchema>;
export type PayoutSummaryData = z.infer<typeof PayoutSummarySchema>;
export type ReportRequest = z.infer<typeof ReportRequestSchema>;
export type BulkPayoutRequest = z.infer<typeof BulkPayoutRequestSchema>;