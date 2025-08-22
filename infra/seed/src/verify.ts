import dotenv from 'dotenv';
import { DatabaseManager } from '@/utils/database';
import { ProgressTracker } from '@/utils/progress';

dotenv.config();

async function verifySeedData() {
  const progress = new ProgressTracker();
  
  try {
    progress.logHeader('VERIFY SEED DATA');

    const db = new DatabaseManager({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'cebeuygun'
    });

    progress.startTask('verify', 'Verifying seed data integrity...');

    // Check table counts
    const counts = await db.getTableCounts();
    
    // Verify data relationships
    const verificationResults = await this.runVerificationChecks(db);
    
    progress.completeTask('verify', 'Verification completed');

    // Display results
    progress.logHeader('VERIFICATION RESULTS');
    
    console.log('📊 Table Counts:');
    Object.entries(counts).forEach(([table, count]) => {
      const status = count > 0 ? '✓' : '✗';
      console.log(`   ${status} ${table.padEnd(25)} ${count.toLocaleString()}`);
    });

    console.log('\n🔍 Data Integrity Checks:');
    verificationResults.forEach(result => {
      const status = result.passed ? '✓' : '✗';
      console.log(`   ${status} ${result.check.padEnd(30)} ${result.message}`);
    });

    await db.close();
  } catch (error) {
    progress.logError(`Verification failed: ${error.message}`);
    throw error;
  } finally {
    progress.cleanup();
  }
}

async function runVerificationChecks(db: DatabaseManager): Promise<Array<{
  check: string;
  passed: boolean;
  message: string;
}>> {
  const checks = [];

  try {
    // Check user-courier relationship
    const courierCheck = await db.query(`
      SELECT COUNT(*) as count 
      FROM couriers c 
      JOIN users u ON c.user_id = u.id 
      WHERE u.role = 'courier'
    `);
    
    checks.push({
      check: 'User-Courier Relationship',
      passed: courierCheck.rows[0].count > 0,
      message: `${courierCheck.rows[0].count} valid courier-user links`
    });

    // Check product-category relationship
    const productCheck = await db.query(`
      SELECT COUNT(*) as count 
      FROM products p 
      JOIN categories c ON p.category_id = c.id
    `);
    
    checks.push({
      check: 'Product-Category Links',
      passed: productCheck.rows[0].count > 0,
      message: `${productCheck.rows[0].count} products linked to categories`
    });

    // Check product media
    const mediaCheck = await db.query(`
      SELECT COUNT(*) as count 
      FROM product_media pm 
      JOIN products p ON pm.product_id = p.id
    `);
    
    checks.push({
      check: 'Product Media Links',
      passed: mediaCheck.rows[0].count > 0,
      message: `${mediaCheck.rows[0].count} media files linked to products`
    });

    // Check courier service areas
    const serviceAreaCheck = await db.query(`
      SELECT COUNT(*) as count 
      FROM courier_service_areas csa 
      JOIN couriers c ON csa.courier_id = c.id
    `);
    
    checks.push({
      check: 'Courier Service Areas',
      passed: serviceAreaCheck.rows[0].count > 0,
      message: `${serviceAreaCheck.rows[0].count} service areas defined`
    });

    // Check campaign-coupon relationship
    const couponCheck = await db.query(`
      SELECT COUNT(*) as count 
      FROM coupons cp 
      JOIN campaigns c ON cp.campaign_id = c.id
    `);
    
    checks.push({
      check: 'Campaign-Coupon Links',
      passed: couponCheck.rows[0].count > 0,
      message: `${couponCheck.rows[0].count} coupons linked to campaigns`
    });

  } catch (error) {
    checks.push({
      check: 'Database Query',
      passed: false,
      message: `Query failed: ${error.message}`
    });
  }

  return checks;
}

verifySeedData().catch(console.error);