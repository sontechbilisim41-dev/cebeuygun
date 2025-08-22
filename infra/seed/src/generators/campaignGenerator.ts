import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { SeedCampaign, SeedCoupon } from '@/types';

export class CampaignGenerator {
  static generateCampaigns(count: number = 20): {
    campaigns: SeedCampaign[];
    coupons: SeedCoupon[];
  } {
    const campaigns: SeedCampaign[] = [];
    const coupons: SeedCoupon[] = [];

    // Predefined campaign templates
    const campaignTemplates = [
      {
        name: 'Hoş Geldin Kampanyası',
        description: 'Yeni üyelere özel %20 indirim',
        type: 'first_order',
        discountValue: 20,
        discountType: 'percentage'
      },
      {
        name: 'Ücretsiz Teslimat',
        description: '100 TL üzeri siparişlerde ücretsiz teslimat',
        type: 'free_delivery',
        minOrderAmount: 10000,
        discountType: 'free_delivery'
      },
      {
        name: 'Flash Sale - %30 İndirim',
        description: 'Seçili ürünlerde 24 saat özel indirim',
        type: 'flash_sale',
        discountValue: 30,
        discountType: 'percentage'
      },
      {
        name: 'Hafta Sonu Özel',
        description: 'Hafta sonu siparişlerinde 25 TL indirim',
        type: 'flat_discount',
        discountValue: 2500,
        discountType: 'flat_amount'
      },
      {
        name: 'Sadakat Programı',
        description: '10. siparişinizde %50 indirim',
        type: 'loyalty_reward',
        discountValue: 50,
        discountType: 'percentage'
      }
    ];

    campaignTemplates.forEach((template, index) => {
      const validFrom = faker.date.between({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        to: new Date()
      });
      
      const validUntil = faker.date.between({
        from: new Date(),
        to: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
      });

      const campaign: SeedCampaign = {
        id: uuidv4(),
        name: template.name,
        description: template.description,
        type: template.type as any,
        status: faker.helpers.weightedArrayElement([
          { weight: 60, value: 'active' },
          { weight: 20, value: 'draft' },
          { weight: 15, value: 'paused' },
          { weight: 5, value: 'expired' }
        ]),
        rules: this.generateCampaignRules(template),
        is_active: faker.datatype.boolean(0.8),
        valid_from: validFrom.toISOString(),
        valid_until: validUntil.toISOString(),
        budget: {
          amount: faker.number.int({ min: 10000, max: 1000000 }),
          currency: 'TRY'
        },
        spent_budget: {
          amount: faker.number.int({ min: 0, max: 50000 }),
          currency: 'TRY'
        },
        max_usage: faker.number.int({ min: 100, max: 10000 }),
        current_usage: faker.number.int({ min: 0, max: 500 }),
        max_usage_per_user: faker.number.int({ min: 1, max: 5 }),
        priority: faker.number.int({ min: 1, max: 1000 }),
        is_exclusive: faker.datatype.boolean(0.2),
        created_at: validFrom.toISOString(),
        updated_at: new Date().toISOString()
      };

      campaigns.push(campaign);

      // Generate coupons for this campaign (5-20 per campaign)
      const couponCount = faker.number.int({ min: 5, max: 20 });
      for (let i = 0; i < couponCount; i++) {
        const coupon = this.generateCoupon(campaign, template);
        coupons.push(coupon);
      }
    });

    // Generate additional random campaigns
    const remainingCount = count - campaignTemplates.length;
    for (let i = 0; i < remainingCount; i++) {
      const campaign = this.generateRandomCampaign();
      campaigns.push(campaign);

      // Generate coupons for random campaign
      const couponCount = faker.number.int({ min: 3, max: 15 });
      for (let j = 0; j < couponCount; j++) {
        const coupon = this.generateRandomCoupon(campaign);
        coupons.push(coupon);
      }
    }

    return { campaigns, coupons };
  }

  private static generateCoupon(campaign: SeedCampaign, template: any): SeedCoupon {
    return {
      id: uuidv4(),
      code: this.generateCouponCode(),
      campaign_id: campaign.id,
      discount_type: template.discountType,
      discount_value: template.discountValue || faker.number.int({ min: 5, max: 50 }),
      min_order_amount: template.minOrderAmount ? {
        amount: template.minOrderAmount,
        currency: 'TRY'
      } : undefined,
      max_discount_amount: template.discountType === 'percentage' ? {
        amount: faker.number.int({ min: 5000, max: 20000 }),
        currency: 'TRY'
      } : undefined,
      usage_limit: faker.number.int({ min: 1, max: 100 }),
      usage_count: faker.number.int({ min: 0, max: 10 }),
      valid_from: campaign.valid_from,
      valid_until: campaign.valid_until,
      is_active: campaign.is_active,
      applicable_products: faker.datatype.boolean(0.3) ? 
        faker.helpers.arrayElements(['prod1', 'prod2', 'prod3'], { min: 1, max: 3 }) : 
        undefined,
      applicable_categories: faker.datatype.boolean(0.4) ? 
        faker.helpers.arrayElements(['cat1', 'cat2'], { min: 1, max: 2 }) : 
        undefined,
      user_restrictions: faker.datatype.boolean(0.2) ? {
        newUsersOnly: true,
        minOrderHistory: 0
      } : undefined,
      created_at: campaign.created_at,
      updated_at: campaign.updated_at
    };
  }

  private static generateRandomCampaign(): SeedCampaign {
    const validFrom = faker.date.between({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date()
    });
    
    const validUntil = faker.date.between({
      from: new Date(),
      to: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    });

    return {
      id: uuidv4(),
      name: faker.commerce.productName() + ' Kampanyası',
      description: faker.lorem.sentence(),
      type: faker.helpers.arrayElement([
        'percentage_discount',
        'flat_discount',
        'free_delivery',
        'loyalty_reward',
        'flash_sale'
      ]),
      status: faker.helpers.weightedArrayElement([
        { weight: 60, value: 'active' },
        { weight: 20, value: 'draft' },
        { weight: 15, value: 'paused' },
        { weight: 5, value: 'expired' }
      ]),
      rules: [],
      is_active: faker.datatype.boolean(0.8),
      valid_from: validFrom.toISOString(),
      valid_until: validUntil.toISOString(),
      budget: {
        amount: faker.number.int({ min: 10000, max: 500000 }),
        currency: 'TRY'
      },
      spent_budget: {
        amount: 0,
        currency: 'TRY'
      },
      max_usage: faker.number.int({ min: 50, max: 5000 }),
      current_usage: 0,
      max_usage_per_user: faker.number.int({ min: 1, max: 3 }),
      priority: faker.number.int({ min: 1, max: 1000 }),
      is_exclusive: faker.datatype.boolean(0.1),
      created_at: validFrom.toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  private static generateRandomCoupon(campaign: SeedCampaign): SeedCoupon {
    const discountType = faker.helpers.arrayElement(['percentage', 'flat_amount', 'free_delivery']);
    
    return {
      id: uuidv4(),
      code: this.generateCouponCode(),
      campaign_id: campaign.id,
      discount_type: discountType,
      discount_value: discountType === 'percentage' ? 
        faker.number.int({ min: 5, max: 50 }) : 
        faker.number.int({ min: 500, max: 5000 }),
      min_order_amount: faker.datatype.boolean(0.6) ? {
        amount: faker.number.int({ min: 2000, max: 15000 }),
        currency: 'TRY'
      } : undefined,
      max_discount_amount: discountType === 'percentage' ? {
        amount: faker.number.int({ min: 2000, max: 10000 }),
        currency: 'TRY'
      } : undefined,
      usage_limit: faker.number.int({ min: 1, max: 1000 }),
      usage_count: faker.number.int({ min: 0, max: 50 }),
      valid_from: campaign.valid_from,
      valid_until: campaign.valid_until,
      is_active: campaign.is_active,
      created_at: campaign.created_at,
      updated_at: campaign.updated_at
    };
  }

  private static generateCouponCode(): string {
    const prefixes = ['SAVE', 'DEAL', 'OFFER', 'PROMO', 'DISC', 'SPECIAL'];
    const prefix = faker.helpers.arrayElement(prefixes);
    const number = faker.string.numeric(4);
    return `${prefix}${number}`;
  }

  private static generateCampaignRules(template: any): any[] {
    const rules = [];
    
    if (template.minOrderAmount) {
      rules.push({
        type: 'min_order_amount',
        value: template.minOrderAmount,
        currency: 'TRY'
      });
    }

    if (template.type === 'first_order') {
      rules.push({
        type: 'user_order_count',
        operator: 'equals',
        value: 0
      });
    }

    if (faker.datatype.boolean(0.3)) {
      rules.push({
        type: 'time_restriction',
        days: faker.helpers.arrayElements([0, 1, 2, 3, 4, 5, 6], { min: 1, max: 7 }),
        hours: {
          start: '09:00',
          end: '22:00'
        }
      });
    }

    return rules;
  }
}