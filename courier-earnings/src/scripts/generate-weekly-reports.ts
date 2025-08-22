#!/usr/bin/env node

import { DatabaseService } from '@/config/database';
import { PayoutGenerator } from '@/services/payout-generator';
import { logger } from '@/utils/logger';
import { startOfWeek, endOfWeek, subWeeks, format } from 'date-fns';

/**
 * Script to generate weekly payout reports for all couriers
 * Usage: npm run generate-reports [-- --week=YYYY-MM-DD] [-- --courier=UUID]
 */

async function main() {
  try {
    const args = process.argv.slice(2);
    const weekArg = args.find(arg => arg.startsWith('--week='));
    const courierArg = args.find(arg => arg.startsWith('--courier='));
    
    // Parse week date (default to last week)
    const weekDate = weekArg 
      ? new Date(weekArg.split('=')[1])
      : subWeeks(new Date(), 1);
    
    // Parse courier ID (optional)
    const courierId = courierArg ? courierArg.split('=')[1] : undefined;

    logger.info('Starting weekly report generation', {
      weekDate: weekDate.toISOString(),
      courierId: courierId || 'all',
    });

    // Initialize services
    const database = new DatabaseService();
    await database.initialize();
    
    const payoutGenerator = new PayoutGenerator(database);

    if (courierId) {
      // Generate for specific courier
      const payout = await payoutGenerator.generateWeeklyPayout(courierId, weekDate);
      
      console.log(`✅ Payout generated for courier ${courierId}`);
      console.log(`   Total Earnings: ${payout.totalEarnings.amount / 100} TRY`);
      console.log(`   Total Deliveries: ${payout.totalDeliveries}`);
      console.log(`   Report Path: ${payout.reportPath}`);
    } else {
      // Generate for all eligible couriers
      const payouts = await payoutGenerator.generateBulkPayouts(weekDate);
      
      console.log(`✅ Generated ${payouts.length} payouts`);
      
      const totalEarnings = payouts.reduce((sum, payout) => sum + payout.totalEarnings.amount, 0);
      const totalDeliveries = payouts.reduce((sum, payout) => sum + payout.totalDeliveries, 0);
      
      console.log(`   Total Earnings: ${totalEarnings / 100} TRY`);
      console.log(`   Total Deliveries: ${totalDeliveries}`);
      
      payouts.forEach(payout => {
        console.log(`   - ${payout.courierId}: ${payout.totalEarnings.amount / 100} TRY (${payout.totalDeliveries} deliveries)`);
      });
    }

    await database.disconnect();
    
    logger.info('Weekly report generation completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Weekly report generation failed:', error);
    console.error('❌ Report generation failed:', error.message);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main();
}