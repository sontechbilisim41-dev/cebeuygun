import Handlebars from 'handlebars';
import { DatabaseService } from '@/config/database';
import { NotificationTemplate, NotificationChannel } from '@/types';
import { logger } from '@/utils/logger';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export class TemplateEngine {
  private database: DatabaseService;
  private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();
  private cacheExpiry: Map<string, number> = new Map();

  constructor(database: DatabaseService) {
    this.database = database;
    this.initializeHelpers();
  }

  /**
   * Render notification content using template
   */
  async renderNotification(
    eventType: string,
    channel: NotificationChannel,
    language: 'tr' | 'en',
    data: Record<string, any>
  ): Promise<{
    subject?: string;
    title?: string;
    body: string;
    templateId: string;
  }> {
    try {
      const template = await this.getTemplate(eventType, channel, language);
      
      if (!template) {
        throw new Error(`Template not found for ${eventType}/${channel}/${language}`);
      }

      const cacheKey = `${template.id}:${JSON.stringify(data)}`;
      
      // Check cache first
      if (this.templateCache.has(cacheKey) && this.isCacheValid(cacheKey)) {
        const cachedTemplate = this.templateCache.get(cacheKey)!;
        return {
          subject: template.subject ? cachedTemplate(data) : undefined,
          title: template.title ? cachedTemplate(data) : undefined,
          body: cachedTemplate(data),
          templateId: template.id,
        };
      }

      // Compile templates
      const bodyTemplate = Handlebars.compile(template.body);
      const subjectTemplate = template.subject ? Handlebars.compile(template.subject) : undefined;
      const titleTemplate = template.title ? Handlebars.compile(template.title) : undefined;

      // Cache compiled templates
      this.templateCache.set(`${template.id}:body`, bodyTemplate);
      if (subjectTemplate) this.templateCache.set(`${template.id}:subject`, subjectTemplate);
      if (titleTemplate) this.templateCache.set(`${template.id}:title`, titleTemplate);
      this.cacheExpiry.set(cacheKey, Date.now() + 300000); // 5 minutes

      // Render content
      const result = {
        subject: subjectTemplate ? subjectTemplate(data) : undefined,
        title: titleTemplate ? titleTemplate(data) : undefined,
        body: bodyTemplate(data),
        templateId: template.id,
      };

      logger.debug('Template rendered successfully', {
        templateId: template.id,
        eventType,
        channel,
        language,
      });

      return result;
    } catch (error) {
      logger.error('Template rendering failed:', error);
      throw error;
    }
  }

  /**
   * Get template from database with caching
   */
  private async getTemplate(
    eventType: string,
    channel: NotificationChannel,
    language: 'tr' | 'en'
  ): Promise<NotificationTemplate | null> {
    const query = `
      SELECT id, name, description, event_type, channel, language, subject, title, body, variables, is_active, created_at, updated_at
      FROM notification_templates 
      WHERE event_type = $1 AND channel = $2 AND language = $3 AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1`;

    try {
      const result = await this.database.query(query, [eventType, channel, language]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        eventType: row.event_type,
        channel: row.channel,
        language: row.language,
        subject: row.subject,
        title: row.title,
        body: row.body,
        variables: row.variables || [],
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      logger.error('Failed to get template:', error);
      return null;
    }
  }

  /**
   * Initialize Handlebars helpers
   */
  private initializeHelpers(): void {
    // Date formatting helper
    Handlebars.registerHelper('formatDate', (date: string | Date, formatStr: string) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, formatStr, { locale: tr });
    });

    // Currency formatting helper
    Handlebars.registerHelper('formatCurrency', (amount: number, currency: string = 'TRY') => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
      }).format(amount / 100); // Convert from kuruş to TRY
    });

    // Time formatting helper
    Handlebars.registerHelper('formatTime', (date: string | Date) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'HH:mm', { locale: tr });
    });

    // Conditional helpers
    Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    Handlebars.registerHelper('gt', (a: number, b: number) => a > b);
    Handlebars.registerHelper('lt', (a: number, b: number) => a < b);

    // String helpers
    Handlebars.registerHelper('uppercase', (str: string) => str.toUpperCase());
    Handlebars.registerHelper('lowercase', (str: string) => str.toLowerCase());
    Handlebars.registerHelper('truncate', (str: string, length: number) => 
      str.length > length ? str.substring(0, length) + '...' : str
    );

    // Order status helper
    Handlebars.registerHelper('orderStatus', (status: string) => {
      const statusMap: Record<string, string> = {
        'created': 'Sipariş Oluşturuldu',
        'paid': 'Ödeme Alındı',
        'assigned': 'Kurye Atandı',
        'picked_up': 'Sipariş Alındı',
        'on_the_way': 'Yolda',
        'delivered': 'Teslim Edildi',
        'canceled': 'İptal Edildi',
      };
      return statusMap[status] || status;
    });

    // ETA helper
    Handlebars.registerHelper('formatETA', (minutes: number) => {
      if (minutes < 60) {
        return `${minutes} dakika`;
      } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours} saat ${remainingMinutes} dakika` : `${hours} saat`;
      }
    });
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(cacheKey: string): boolean {
    const expiry = this.cacheExpiry.get(cacheKey);
    return expiry ? Date.now() < expiry : false;
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
    this.cacheExpiry.clear();
  }
}