import puppeteer from 'puppeteer';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import Handlebars from 'handlebars';
import { PayoutSummary, ReportRequest } from '@/types';
import { logger } from '@/utils/logger';
import { config } from '@/config';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export class ReportGenerator {
  private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    this.initializeHandlebarsHelpers();
  }

  /**
   * Generate payout report in specified format
   */
  async generatePayoutReport(
    summary: PayoutSummary,
    format: 'pdf' | 'csv',
    language: 'tr' | 'en' = 'tr'
  ): Promise<string> {
    const startTime = Date.now();
    
    try {
      logger.info('Generating payout report', {
        courierId: summary.courierId,
        format,
        language,
        totalEarnings: summary.summary.totalEarnings.amount,
      });

      const fileName = this.generateFileName(summary, format);
      const filePath = path.join(config.reports.outputDir, fileName);

      // Ensure output directory exists
      await fs.mkdir(config.reports.outputDir, { recursive: true });

      if (format === 'pdf') {
        await this.generatePDFReport(summary, filePath, language);
      } else {
        await this.generateCSVReport(summary, filePath);
      }

      logger.info('Report generated successfully', {
        courierId: summary.courierId,
        format,
        filePath,
        processingTime: Date.now() - startTime,
      });

      return filePath;
    } catch (error) {
      logger.error('Failed to generate report:', error);
      throw error;
    }
  }

  /**
   * Generate PDF report using Puppeteer
   */
  private async generatePDFReport(
    summary: PayoutSummary,
    filePath: string,
    language: 'tr' | 'en'
  ): Promise<void> {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      
      // Generate HTML content
      const htmlContent = await this.generateHTMLContent(summary, language);
      
      // Set content and generate PDF
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      await page.pdf({
        path: filePath,
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        displayHeaderFooter: true,
        headerTemplate: this.getHeaderTemplate(summary, language),
        footerTemplate: this.getFooterTemplate(language),
        printBackground: true,
      });
    } finally {
      await browser.close();
    }
  }

  /**
   * Generate CSV report
   */
  private async generateCSVReport(summary: PayoutSummary, filePath: string): Promise<void> {
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'deliveryId', title: 'Teslimat ID' },
        { id: 'date', title: 'Tarih' },
        { id: 'distance', title: 'Mesafe (km)' },
        { id: 'baseEarning', title: 'Temel Ücret (TRY)' },
        { id: 'distanceEarning', title: 'Mesafe Ücreti (TRY)' },
        { id: 'peakHourBonus', title: 'Pik Saat Bonusu (TRY)' },
        { id: 'vehicleBonus', title: 'Araç Bonusu (TRY)' },
        { id: 'totalEarning', title: 'Toplam Kazanç (TRY)' },
        { id: 'isPeakHour', title: 'Pik Saat' },
        { id: 'vehicleType', title: 'Araç Tipi' },
      ],
      encoding: 'utf8',
    });

    const records = (summary.deliveries || []).map(delivery => ({
      deliveryId: delivery.deliveryId,
      date: format(delivery.calculatedAt, 'dd.MM.yyyy HH:mm'),
      distance: delivery.calculationDetails.distance.toFixed(2),
      baseEarning: (delivery.baseEarning.amount / 100).toFixed(2),
      distanceEarning: (delivery.distanceEarning.amount / 100).toFixed(2),
      peakHourBonus: (delivery.peakHourBonus.amount / 100).toFixed(2),
      vehicleBonus: (delivery.vehicleBonus.amount / 100).toFixed(2),
      totalEarning: (delivery.totalEarning.amount / 100).toFixed(2),
      isPeakHour: delivery.calculationDetails.isPeakHour ? 'Evet' : 'Hayır',
      vehicleType: this.getVehicleTypeDisplayName(delivery.calculationDetails.vehicleMultiplier),
    }));

    await csvWriter.writeRecords(records);
  }

  /**
   * Generate HTML content for PDF
   */
  private async generateHTMLContent(summary: PayoutSummary, language: 'tr' | 'en'): Promise<string> {
    const templateName = `payout-report-${language}`;
    let template = this.templateCache.get(templateName);

    if (!template) {
      const templatePath = path.join(config.reports.templateDir, `${templateName}.hbs`);
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      template = Handlebars.compile(templateContent);
      this.templateCache.set(templateName, template);
    }

    const templateData = {
      ...summary,
      generatedAt: format(new Date(), 'dd.MM.yyyy HH:mm', { locale: tr }),
      formattedPeriod: `${format(summary.period.startDate, 'dd.MM.yyyy')} - ${format(summary.period.endDate, 'dd.MM.yyyy')}`,
      totalEarningsFormatted: this.formatMoney(summary.summary.totalEarnings),
      averageEarningFormatted: this.formatMoney(summary.summary.averageEarningPerDelivery),
      // Format all money values for display
      summary: {
        ...summary.summary,
        totalEarningsFormatted: this.formatMoney(summary.summary.totalEarnings),
        baseEarningsFormatted: this.formatMoney(summary.summary.baseEarnings),
        distanceEarningsFormatted: this.formatMoney(summary.summary.distanceEarnings),
        bonusEarningsFormatted: this.formatMoney(summary.summary.bonusEarnings),
        averageEarningPerDeliveryFormatted: this.formatMoney(summary.summary.averageEarningPerDelivery),
        averageEarningPerKmFormatted: this.formatMoney(summary.summary.averageEarningPerKm),
      },
      breakdown: {
        ...summary.breakdown,
        regularHours: {
          ...summary.breakdown.regularHours,
          earningsFormatted: this.formatMoney(summary.breakdown.regularHours.earnings),
        },
        peakHours: {
          ...summary.breakdown.peakHours,
          earningsFormatted: this.formatMoney(summary.breakdown.peakHours.earnings),
          bonusAmountFormatted: this.formatMoney(summary.breakdown.peakHours.bonusAmount),
        },
      },
    };

    return template(templateData);
  }

  /**
   * Generate file name for report
   */
  private generateFileName(summary: PayoutSummary, format: 'pdf' | 'csv'): string {
    const weekStr = `${summary.period.year}-W${summary.period.weekNumber.toString().padStart(2, '0')}`;
    const courierStr = summary.courierId.slice(-8);
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
    
    return `kurye-odeme-${courierStr}-${weekStr}-${timestamp}.${format}`;
  }

  /**
   * Format money for display
   */
  private formatMoney(money: { amount: number; currency: string }): string {
    const amount = money.amount / 100; // Convert from kuruş to TRY
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: money.currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Get vehicle type display name
   */
  private getVehicleTypeDisplayName(multiplier: number): string {
    if (multiplier >= 1.3) return 'Araba';
    if (multiplier >= 1.2) return 'Motosiklet';
    if (multiplier >= 1.1) return 'Bisiklet';
    return 'Yürüyerek';
  }

  /**
   * Initialize Handlebars helpers
   */
  private initializeHandlebarsHelpers(): void {
    Handlebars.registerHelper('formatMoney', (money: { amount: number; currency: string }) => {
      return this.formatMoney(money);
    });

    Handlebars.registerHelper('formatDate', (date: Date, formatStr: string) => {
      return format(date, formatStr, { locale: tr });
    });

    Handlebars.registerHelper('formatNumber', (num: number, decimals: number = 2) => {
      return num.toFixed(decimals);
    });

    Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    Handlebars.registerHelper('gt', (a: number, b: number) => a > b);
    Handlebars.registerHelper('add', (a: number, b: number) => a + b);
  }

  /**
   * Get header template for PDF
   */
  private getHeaderTemplate(summary: PayoutSummary, language: 'tr' | 'en'): string {
    const title = language === 'tr' ? 'Kurye Ödeme Raporu' : 'Courier Payment Report';
    return `
      <div style="font-size: 10px; padding: 5px 15px; width: 100%; text-align: center; color: #666;">
        <strong>${title}</strong> - ${summary.courierName}
      </div>
    `;
  }

  /**
   * Get footer template for PDF
   */
  private getFooterTemplate(language: 'tr' | 'en'): string {
    const text = language === 'tr' ? 'Sayfa' : 'Page';
    return `
      <div style="font-size: 10px; padding: 5px 15px; width: 100%; text-align: center; color: #666;">
        ${text} <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>
    `;
  }
}