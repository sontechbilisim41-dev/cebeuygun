import dotenv from 'dotenv';
import inquirer from 'inquirer';
import { SeedConfig } from '@/types';
import { DatabaseManager } from '@/utils/database';
import { ProgressTracker } from '@/utils/progress';
import { UserGenerator } from '@/generators/userGenerator';
import { CourierGenerator } from '@/generators/courierGenerator';
import { ProductGenerator } from '@/generators/productGenerator';
import { CampaignGenerator } from '@/generators/campaignGenerator';
import { getAllCategories } from '@/data/categories';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

class SeedManager {
  private config: SeedConfig;
  private db: DatabaseManager;
  private progress: ProgressTracker;

  constructor() {
    this.config = this.loadConfig();
    this.db = new DatabaseManager(this.config.database);
    this.progress = new ProgressTracker();
  }

  private loadConfig(): SeedConfig {
    return {
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'cebeuygun'
      },
      counts: {
        users: 50,
        couriers: 20,
        categories: 100,
        products: 5000,
        campaigns: 25,
        coupons: 200
      },
      options: {
        clearExisting: false,
        generateImages: true,
        verbose: false
      }
    };
  }

  async run(): Promise<void> {
    try {
      this.progress.logHeader('CEBEUYGUN PLATFORM SEED DATA GENERATOR');

      // Test database connection
      this.progress.startTask('db-test', 'Testing database connection...');
      const isConnected = await this.db.testConnection();
      
      if (!isConnected) {
        this.progress.failTask('db-test', 'Database connection failed');
        process.exit(1);
      }
      
      this.progress.completeTask('db-test', 'Database connection successful');

      // Ask for confirmation
      const shouldContinue = await this.confirmSeedOperation();
      if (!shouldContinue) {
        this.progress.logInfo('Seed operation cancelled by user');
        return;
      }

      // Clear existing data if requested
      if (this.config.options.clearExisting) {
        await this.clearExistingData();
      }

      // Generate and insert data
      await this.generateUsers();
      await this.generateCategories();
      await this.generateProducts();
      await this.generateCouriers();
      await this.generateCampaigns();

      // Show summary
      await this.showSummary();
      
      this.progress.logDemoInfo();

    } catch (error) {
      this.progress.logError(`Seed operation failed: ${error.message}`);
      throw error;
    } finally {
      this.progress.cleanup();
      await this.db.close();
    }
  }

  private async confirmSeedOperation(): Promise<boolean> {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'This will generate demo data for the platform. Continue?',
        default: true
      },
      {
        type: 'confirm',
        name: 'clearExisting',
        message: 'Clear existing data before seeding?',
        default: false,
        when: (answers) => answers.proceed
      }
    ]);

    this.config.options.clearExisting = answers.clearExisting;
    return answers.proceed;
  }

  private async clearExistingData(): Promise<void> {
    this.progress.startTask('clear-data', 'Clearing existing data...');
    await this.db.clearAllSeedData();
    this.progress.completeTask('clear-data', 'Existing data cleared');
  }

  private async generateUsers(): Promise<void> {
    this.progress.startTask('users', `Generating ${this.config.counts.users} users...`);
    
    const users = await UserGenerator.generateUsers(this.config.counts.users);
    await this.db.insertBatch('users', users);
    
    this.progress.completeTask('users', `Generated ${users.length} users`);
  }

  private async generateCategories(): Promise<void> {
    this.progress.startTask('categories', 'Generating product categories...');
    
    const categoryData = getAllCategories();
    const categories = categoryData.map((cat, index) => ({
      id: uuidv4(),
      name: cat.name,
      description: cat.description,
      parent_id: cat.parentName ? this.findCategoryId(categoryData, cat.parentName) : null,
      image_url: null,
      sort_order: index,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    await this.db.insertBatch('categories', categories);
    
    this.progress.completeTask('categories', `Generated ${categories.length} categories`);
  }

  private findCategoryId(categories: any[], name: string): string | null {
    // This would need to be implemented with proper ID tracking
    // For now, return null for simplicity
    return null;
  }

  private async generateProducts(): Promise<void> {
    this.progress.startTask('products', `Generating ${this.config.counts.products} products...`);
    
    // Get category IDs
    const categoryResult = await this.db.query('SELECT id FROM categories WHERE parent_id IS NOT NULL');
    const categoryIds = categoryResult.rows.map((row: any) => row.id);

    const { products, productMedia } = ProductGenerator.generateProducts(
      categoryIds,
      this.config.counts.products
    );

    await this.db.insertBatch('products', products);
    await this.db.insertBatch('product_media', productMedia);
    
    this.progress.completeTask('products', `Generated ${products.length} products with ${productMedia.length} images`);
  }

  private async generateCouriers(): Promise<void> {
    this.progress.startTask('couriers', `Generating ${this.config.counts.couriers} couriers...`);
    
    // Get courier user IDs
    const userResult = await this.db.query('SELECT id FROM users WHERE role = $1', ['courier']);
    const courierUserIds = userResult.rows.map((row: any) => row.id);

    const { couriers, serviceAreas, workingHours } = CourierGenerator.generateCouriers(
      courierUserIds,
      this.config.counts.couriers
    );

    await this.db.insertBatch('couriers', couriers);
    await this.db.insertBatch('courier_service_areas', serviceAreas);
    await this.db.insertBatch('courier_working_hours', workingHours);
    
    this.progress.completeTask('couriers', 
      `Generated ${couriers.length} couriers with ${serviceAreas.length} service areas`
    );
  }

  private async generateCampaigns(): Promise<void> {
    this.progress.startTask('campaigns', `Generating ${this.config.counts.campaigns} campaigns...`);
    
    const { campaigns, coupons } = CampaignGenerator.generateCampaigns(this.config.counts.campaigns);

    await this.db.insertBatch('campaigns', campaigns);
    await this.db.insertBatch('coupons', coupons);
    
    this.progress.completeTask('campaigns', 
      `Generated ${campaigns.length} campaigns with ${coupons.length} coupons`
    );
  }

  private async showSummary(): Promise<void> {
    this.progress.startTask('summary', 'Generating summary...');
    
    const counts = await this.db.getTableCounts();
    
    this.progress.completeTask('summary', 'Summary generated');
    this.progress.logSummary(counts);
  }
}

// Main execution
async function main() {
  const seedManager = new SeedManager();
  
  try {
    await seedManager.run();
    process.exit(0);
  } catch (error) {
    console.error('Seed operation failed:', error);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n\nSeed operation interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\nSeed operation terminated');
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main();
}

export default main;