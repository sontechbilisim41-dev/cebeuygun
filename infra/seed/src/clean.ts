import dotenv from 'dotenv';
import inquirer from 'inquirer';
import { DatabaseManager } from '@/utils/database';
import { ProgressTracker } from '@/utils/progress';

dotenv.config();

async function cleanSeedData() {
  const progress = new ProgressTracker();
  
  try {
    progress.logHeader('CLEAN SEED DATA');

    const db = new DatabaseManager({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'cebeuygun'
    });

    // Test connection
    progress.startTask('db-test', 'Testing database connection...');
    const isConnected = await db.testConnection();
    
    if (!isConnected) {
      progress.failTask('db-test', 'Database connection failed');
      process.exit(1);
    }
    
    progress.completeTask('db-test', 'Database connection successful');

    // Confirm deletion
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: 'This will permanently delete all seed data. Are you sure?',
        default: false
      }
    ]);

    if (!confirmed) {
      progress.logInfo('Clean operation cancelled');
      return;
    }

    // Clear data
    progress.startTask('clean', 'Clearing all seed data...');
    await db.clearAllSeedData();
    progress.completeTask('clean', 'All seed data cleared successfully');

    // Show final counts
    const counts = await db.getTableCounts();
    progress.logSummary(counts);

    await db.close();
  } catch (error) {
    progress.logError(`Clean operation failed: ${error.message}`);
    throw error;
  } finally {
    progress.cleanup();
  }
}

cleanSeedData().catch(console.error);