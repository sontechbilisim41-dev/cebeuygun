import { Macro } from '@/types';
import { logger } from '@/utils/logger';
import { cacheService } from './cacheService';

class MacroService {
  private macros: Map<string, Macro> = new Map();

  async initialize(): Promise<void> {
    await this.loadMacros();
    this.setupDefaultMacros();
  }

  async getMacros(category?: string): Promise<Macro[]> {
    try {
      const allMacros = Array.from(this.macros.values());
      
      if (category) {
        return allMacros.filter(macro => 
          macro.category === category && macro.isActive
        );
      }

      return allMacros.filter(macro => macro.isActive);
    } catch (error) {
      logger.error('Get macros error:', error);
      throw error;
    }
  }

  async getMacro(macroId: string): Promise<Macro | null> {
    return this.macros.get(macroId) || null;
  }

  async createMacro(macroData: Omit<Macro, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>): Promise<Macro> {
    try {
      const macro: Macro = {
        ...macroData,
        id: `macro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.macros.set(macro.id, macro);
      await this.saveMacro(macro);

      logger.info('Macro created', { macroId: macro.id, title: macro.title });

      return macro;
    } catch (error) {
      logger.error('Create macro error:', error);
      throw error;
    }
  }

  async updateMacro(macroId: string, updates: Partial<Macro>): Promise<Macro> {
    try {
      const macro = this.macros.get(macroId);
      if (!macro) {
        throw new Error('Macro not found');
      }

      const updatedMacro = {
        ...macro,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      this.macros.set(macroId, updatedMacro);
      await this.saveMacro(updatedMacro);

      logger.info('Macro updated', { macroId, updates });

      return updatedMacro;
    } catch (error) {
      logger.error('Update macro error:', error);
      throw error;
    }
  }

  async deleteMacro(macroId: string): Promise<void> {
    try {
      this.macros.delete(macroId);
      await this.deleteMacroFromDB(macroId);

      logger.info('Macro deleted', { macroId });
    } catch (error) {
      logger.error('Delete macro error:', error);
      throw error;
    }
  }

  async useMacro(macroId: string, variables?: Record<string, string>): Promise<string> {
    try {
      const macro = this.macros.get(macroId);
      if (!macro) {
        throw new Error('Macro not found');
      }

      // Increment usage count
      macro.usageCount++;
      this.macros.set(macroId, macro);
      await this.saveMacro(macro);

      // Process variables in content
      let content = macro.content;
      if (variables) {
        for (const [key, value] of Object.entries(variables)) {
          content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
      }

      logger.debug('Macro used', { macroId, usageCount: macro.usageCount });

      return content;
    } catch (error) {
      logger.error('Use macro error:', error);
      throw error;
    }
  }

  async searchMacros(query: string, category?: string): Promise<Macro[]> {
    try {
      const allMacros = Array.from(this.macros.values());
      
      return allMacros.filter(macro => {
        const matchesQuery = 
          macro.title.toLowerCase().includes(query.toLowerCase()) ||
          macro.content.toLowerCase().includes(query.toLowerCase()) ||
          macro.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
        
        const matchesCategory = !category || macro.category === category;
        
        return matchesQuery && matchesCategory && macro.isActive;
      });
    } catch (error) {
      logger.error('Search macros error:', error);
      throw error;
    }
  }

  private async loadMacros(): Promise<void> {
    try {
      // Load from database
      const macros = await this.getMacrosFromDB();
      
      for (const macro of macros) {
        this.macros.set(macro.id, macro);
      }

      logger.info(`Loaded ${macros.length} macros`);
    } catch (error) {
      logger.error('Load macros error:', error);
    }
  }

  private setupDefaultMacros(): void {
    const defaultMacros = [
      {
        title: 'Hoş Geldiniz',
        content: 'Merhaba! Size nasıl yardımcı olabilirim?',
        category: 'greeting',
        tags: ['welcome', 'greeting'],
      },
      {
        title: 'Sipariş Durumu Sorgusu',
        content: 'Sipariş durumunuzu kontrol ediyorum. Lütfen birkaç dakika bekleyin.',
        category: 'order',
        tags: ['order', 'status'],
      },
      {
        title: 'Ödeme Sorunu',
        content: 'Ödeme ile ilgili sorununuzu anlıyorum. Ödeme ekibimizle iletişime geçerek size yardımcı olacağım.',
        category: 'payment',
        tags: ['payment', 'issue'],
      },
      {
        title: 'Teslimat Gecikmesi',
        content: 'Teslimat gecikmesi için özür dileriz. Kurye ekibimizle iletişime geçerek durumu kontrol ediyorum.',
        category: 'delivery',
        tags: ['delivery', 'delay'],
      },
      {
        title: 'İade Talebi',
        content: 'İade talebinizi değerlendiriyorum. İade koşullarımızı kontrol ederek size bilgi vereceğim.',
        category: 'refund',
        tags: ['refund', 'return'],
      },
      {
        title: 'Teknik Destek',
        content: 'Teknik sorunlarınız için teknik destek ekibimize yönlendiriyorum.',
        category: 'technical',
        tags: ['technical', 'support'],
      },
      {
        title: 'Görüşme Sonlandırma',
        content: 'Başka bir sorunuz yoksa görüşmemizi sonlandırabiliriz. İyi günler dilerim!',
        category: 'closing',
        tags: ['closing', 'goodbye'],
      },
    ];

    for (const macroData of defaultMacros) {
      if (!Array.from(this.macros.values()).some(m => m.title === macroData.title)) {
        this.createMacro({
          ...macroData,
          isActive: true,
          createdBy: 'system',
        });
      }
    }
  }

  private async getMacrosFromDB(): Promise<Macro[]> {
    // Mock implementation - would query database
    return [];
  }

  private async saveMacro(macro: Macro): Promise<void> {
    // Save to database
    logger.debug('Saving macro', { macroId: macro.id });
  }

  private async deleteMacroFromDB(macroId: string): Promise<void> {
    // Delete from database
    logger.debug('Deleting macro', { macroId });
  }
}

export const macroService = new MacroService();