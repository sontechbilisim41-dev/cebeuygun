import { createClient } from 'redis';
import { config } from '@/config';
import { logger, fraudLogger } from '@/utils/logger';
import { FraudCheck } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class FraudDetectionService {
  private redisClient: any;

  constructor() {
    this.redisClient = createClient({ url: config.redis.url });
    this.redisClient.on('error', (err: any) => logger.error('Redis Client Error', err));
  }

  async initialize(): Promise<void> {
    await this.redisClient.connect();
    logger.info('Fraud detection service initialized');
  }

  async checkPayment(
    customerId: string,
    paymentIntentId: string,
    amount: number,
    currency: string,
    customerCountry?: string
  ): Promise<FraudCheck> {
    const startTime = Date.now();
    
    try {
      const riskFactors: string[] = [];
      let riskScore = 0;

      // Check 1: Amount limits
      if (amount > config.fraudPrevention.maxTransactionAmount * 100) {
        riskFactors.push('high_amount');
        riskScore += 30;
      }

      // Check 2: Velocity check - transactions per hour
      const hourlyCount = await this.getHourlyTransactionCount(customerId);
      if (hourlyCount >= config.fraudPrevention.maxTransactionsPerHour) {
        riskFactors.push('high_velocity');
        riskScore += 40;
      }

      // Check 3: Daily amount limit
      const dailyAmount = await this.getDailyTransactionAmount(customerId);
      if (dailyAmount + (amount / 100) > config.fraudPrevention.maxDailyAmount) {
        riskFactors.push('daily_limit_exceeded');
        riskScore += 50;
      }

      // Check 4: Geographic restrictions
      if (customerCountry && !config.fraudPrevention.allowedCountries.includes(customerCountry)) {
        riskFactors.push('restricted_country');
        riskScore += 60;
      }

      // Check 5: Unusual patterns (simplified)
      const isUnusualTime = this.isUnusualTransactionTime();
      if (isUnusualTime) {
        riskFactors.push('unusual_time');
        riskScore += 10;
      }

      // Check 6: First-time customer
      const isFirstTime = await this.isFirstTimeCustomer(customerId);
      if (isFirstTime && amount > 5000) { // 50 TRY
        riskFactors.push('first_time_high_amount');
        riskScore += 20;
      }

      // Determine action based on risk score
      let action: 'allow' | 'review' | 'block';
      let reason: string | undefined;

      if (riskScore >= 70) {
        action = 'block';
        reason = 'High risk score';
      } else if (riskScore >= 40) {
        action = 'review';
        reason = 'Medium risk score - manual review required';
      } else {
        action = 'allow';
      }

      const fraudCheck: FraudCheck = {
        id: uuidv4(),
        customerId,
        paymentIntentId,
        riskScore,
        riskFactors,
        action,
        reason,
        createdAt: new Date(),
      };

      // Log fraud check result
      fraudLogger.info('Fraud check completed', {
        customerId,
        paymentIntentId,
        riskScore,
        riskFactors,
        action,
        reason,
        processingTime: Date.now() - startTime,
      });

      // Update Redis counters
      await this.updateTransactionCounters(customerId, amount / 100);

      return fraudCheck;
    } catch (error) {
      logger.error('Fraud detection failed:', error);
      
      // Fail safe - allow payment but log the error
      return {
        id: uuidv4(),
        customerId,
        paymentIntentId,
        riskScore: 0,
        riskFactors: ['fraud_check_failed'],
        action: 'allow',
        reason: 'Fraud detection service unavailable',
        createdAt: new Date(),
      };
    }
  }

  private async getHourlyTransactionCount(customerId: string): Promise<number> {
    try {
      const key = `${config.redis.keyPrefix}hourly:${customerId}:${this.getCurrentHour()}`;
      const count = await this.redisClient.get(key);
      return parseInt(count || '0');
    } catch (error) {
      logger.warn('Failed to get hourly transaction count:', error);
      return 0;
    }
  }

  private async getDailyTransactionAmount(customerId: string): Promise<number> {
    try {
      const key = `${config.redis.keyPrefix}daily:${customerId}:${this.getCurrentDate()}`;
      const amount = await this.redisClient.get(key);
      return parseFloat(amount || '0');
    } catch (error) {
      logger.warn('Failed to get daily transaction amount:', error);
      return 0;
    }
  }

  private async isFirstTimeCustomer(customerId: string): Promise<boolean> {
    try {
      const key = `${config.redis.keyPrefix}customer:${customerId}:first_payment`;
      const exists = await this.redisClient.exists(key);
      return !exists;
    } catch (error) {
      logger.warn('Failed to check first-time customer:', error);
      return false;
    }
  }

  private isUnusualTransactionTime(): boolean {
    const hour = new Date().getHours();
    // Consider transactions between 2 AM and 6 AM as unusual
    return hour >= 2 && hour <= 6;
  }

  private async updateTransactionCounters(customerId: string, amount: number): Promise<void> {
    try {
      const hourlyKey = `${config.redis.keyPrefix}hourly:${customerId}:${this.getCurrentHour()}`;
      const dailyKey = `${config.redis.keyPrefix}daily:${customerId}:${this.getCurrentDate()}`;
      const firstTimeKey = `${config.redis.keyPrefix}customer:${customerId}:first_payment`;

      // Increment hourly counter
      await this.redisClient.incr(hourlyKey);
      await this.redisClient.expire(hourlyKey, 3600); // 1 hour

      // Increment daily amount
      await this.redisClient.incrByFloat(dailyKey, amount);
      await this.redisClient.expire(dailyKey, 86400); // 24 hours

      // Mark customer as having made a payment
      await this.redisClient.set(firstTimeKey, '1', { EX: 86400 * 30 }); // 30 days
    } catch (error) {
      logger.warn('Failed to update transaction counters:', error);
    }
  }

  private getCurrentHour(): string {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}`;
  }

  private getCurrentDate(): string {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  }

  async disconnect(): Promise<void> {
    await this.redisClient.quit();
  }
}