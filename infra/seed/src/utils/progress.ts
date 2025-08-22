import ora, { Ora } from 'ora';
import chalk from 'chalk';

export class ProgressTracker {
  private spinners: Map<string, Ora> = new Map();
  private startTime: number = Date.now();

  startTask(taskId: string, message: string): void {
    const spinner = ora({
      text: message,
      color: 'cyan',
      spinner: 'dots'
    }).start();
    
    this.spinners.set(taskId, spinner);
  }

  updateTask(taskId: string, message: string): void {
    const spinner = this.spinners.get(taskId);
    if (spinner) {
      spinner.text = message;
    }
  }

  completeTask(taskId: string, message?: string): void {
    const spinner = this.spinners.get(taskId);
    if (spinner) {
      spinner.succeed(message || spinner.text);
      this.spinners.delete(taskId);
    }
  }

  failTask(taskId: string, message?: string): void {
    const spinner = this.spinners.get(taskId);
    if (spinner) {
      spinner.fail(message || spinner.text);
      this.spinners.delete(taskId);
    }
  }

  logInfo(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  logSuccess(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  logWarning(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  logError(message: string): void {
    console.log(chalk.red('✗'), message);
  }

  logHeader(message: string): void {
    console.log('\n' + chalk.bold.cyan('═'.repeat(60)));
    console.log(chalk.bold.cyan(`  ${message}`));
    console.log(chalk.bold.cyan('═'.repeat(60)) + '\n');
  }

  logSummary(counts: Record<string, number>): void {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    
    this.logHeader('SEED SUMMARY');
    
    console.log(chalk.bold('📊 Generated Data:'));
    Object.entries(counts).forEach(([table, count]) => {
      console.log(`   ${chalk.cyan(table.padEnd(25))} ${chalk.green(count.toLocaleString())}`);
    });
    
    console.log(`\n${chalk.bold('⏱ Total Time:')} ${chalk.green(elapsed + 's')}`);
    console.log(`${chalk.bold('🎯 Status:')} ${chalk.green('COMPLETED SUCCESSFULLY')}\n`);
  }

  logDemoInfo(): void {
    this.logHeader('DEMO CREDENTIALS');
    
    const credentials = [
      { role: 'Admin', email: 'admin@cebeuygun.com', password: 'admin123' },
      { role: 'Customer', email: 'customer@demo.com', password: 'demo123' },
      { role: 'Courier', email: 'courier@demo.com', password: 'demo123' },
      { role: 'Seller', email: 'seller@demo.com', password: 'demo123' }
    ];

    credentials.forEach(cred => {
      console.log(`${chalk.bold(cred.role.padEnd(10))} ${chalk.cyan(cred.email.padEnd(25))} ${chalk.green(cred.password)}`);
    });

    console.log(`\n${chalk.bold('🌐 Demo URLs:')}`);
    console.log(`   ${chalk.cyan('Customer App:')} ${chalk.blue('http://localhost:3000')}`);
    console.log(`   ${chalk.cyan('Admin Dashboard:')} ${chalk.blue('http://localhost:3001')}`);
    console.log(`   ${chalk.cyan('Courier App:')} ${chalk.blue('http://localhost:3002')}`);
    console.log(`   ${chalk.cyan('API Documentation:')} ${chalk.blue('http://localhost:8000/docs')}\n`);
  }

  cleanup(): void {
    this.spinners.forEach(spinner => {
      spinner.stop();
    });
    this.spinners.clear();
  }
}