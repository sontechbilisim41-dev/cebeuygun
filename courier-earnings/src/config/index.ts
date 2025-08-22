import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.COURIER_EARNINGS_PORT || '8011'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'cebeuygun',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_SSL === 'true',
  },
  
  kafka: {
    clientId: 'courier-earnings-service',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    topics: {
      orderDelivered: 'order.delivered',
      courierPayoutGenerated: 'courier.payout.generated',
    },
  },
  
  earnings: {
    // Teslimat başı sabit ücretler (kuruş cinsinden)
    baseDeliveryFee: parseInt(process.env.BASE_DELIVERY_FEE || '800'), // 8 TRY
    expressDeliveryFee: parseInt(process.env.EXPRESS_DELIVERY_FEE || '1200'), // 12 TRY
    
    // Kilometre başı ücretler (kuruş/km)
    perKmRate: parseInt(process.env.PER_KM_RATE || '150'), // 1.5 TRY/km
    
    // Pik saat bonusları (yüzde)
    peakHourBonus: parseFloat(process.env.PEAK_HOUR_BONUS || '25'), // %25 bonus
    
    // Pik saatler (24 saat formatında)
    peakHours: [
      { start: 12, end: 14 }, // Öğle yemeği
      { start: 19, end: 21 }, // Akşam yemeği
    ],
    
    // Haftalık ödeme günü (0=Pazar, 1=Pazartesi, ...)
    payoutDay: parseInt(process.env.PAYOUT_DAY || '1'), // Pazartesi
    
    // Minimum ödeme tutarı (kuruş)
    minimumPayout: parseInt(process.env.MINIMUM_PAYOUT || '5000'), // 50 TRY
    
    // Araç tipi çarpanları
    vehicleMultipliers: {
      WALKING: 1.0,
      BICYCLE: 1.1,
      MOTORBIKE: 1.2,
      CAR: 1.3,
    },
  },
  
  reports: {
    outputDir: process.env.REPORTS_OUTPUT_DIR || './reports',
    templateDir: process.env.TEMPLATE_DIR || './src/templates',
    timezone: process.env.TIMEZONE || 'Europe/Istanbul',
  },
  
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['*'],
  },
  
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    timeWindow: process.env.RATE_LIMIT_WINDOW || '1 minute',
  },
};